import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import assign from 'lodash/assign';
import _find from 'lodash/find';
import _remove from 'lodash/remove';
import _map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import clipboard from 'clipboard-js';
import {Table, Column, Cell, ColumnGroup}  from '../datatable';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { CONSTANTS } from './constants/constants';
import Autosize from './common/auto.zise';
import validator from './common/validator';
import AutoPosition from './common/auto.position';
import ErrorBox from './common/error.box';
import Menu from './common/context.menu';
import RowIndex from './indexcell/row.index';
import HeaderIndex from './indexcell/header.index';
import FooterRowIndex from './indexcell/footer.index';
import HeaderCell from './headerfooter/header.cell';
import FooterCell from './headerfooter/footer.cell';
import CellAction from './cell/cell.action';
import RowOpenForm from './openform/row.openform';
import HeaderOpenForm from './openform/header.openform';
import FooterOpenForm from './openform/footer.openform';
import RowButtion from './actionbutton/row.actionbtn';
import HeaderButtion from './actionbutton/header.actionbtn';
import FooterButtion from './actionbutton/footer.actionbtn';
import { inBetween, inBetweenArea, areaInBetweenArea, isInParent,
  ignoreKeyCodes, isCommand, isFirefox, isSafari } from './common/helper';
import styles from './css/flexi.table.css';
class FlexiTable extends Component {
  constructor(props) {
    super(props);
    console.log('props', props);
    const columns = this.getInitialColumns(props);
    this.state = {
      columnWidthOverrides: {},
      columns,
      model: props.model,
      appName: props.appName,
      data: props.model.getList(props.appName),
      selection: {},
      copySelection: {},
      showError: null,
      isCut: false,
      selectedIds: [],
      showCheckboxIdx: "",
      selectAllIdx: [],
      currentPage: 1,
      rowsPerPage: 2,
      tableHeight: {
        height: (props.model.getList(props.appName).length * this.props.rowHeight) + 80
      }
    };
    this.__dragging = {};
    this.__history = [];
    this.__history.push(this.state.data);
    this.__historyIndex = this.__history.length;
  }

  componentWillMount() {
    window.addEventListener('mouseup', this.handleGlobalMouseUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('paste', this.handlePaste);
    window.addEventListener('copy', this.handleCopy);
    window.addEventListener('cut', this.handleCut);
    window.addEventListener('beforecopy', this.preventDefault);
    window.addEventListener('click', this.handleBaseClick);
  }

  componentWillReceiveProps(nextProps) {
    let data = nextProps.model.getList(nextProps.appName);
    this.setState({
      data, tableHeight: {
        height: (data.length * this.props.rowHeight) + 80
      } });
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('paste', this.handlePaste);
    window.removeEventListener('copy', this.handleCopy);
    window.removeEventListener('cut', this.handleCut);
    window.removeEventListener('beforecopy', this.preventDefault);
    window.removeEventListener('click', this.handleBaseClick);
  }

  componentDidUpdateTODO(prevProps, prevState) {
    const data = this.state.data;
    const previousData = this.__history[this.__historyIndex - 1];
    if (prevState.data !== data && previousData !== data) {
      let foundChanges = false;
      for (let i = 0; i < data.length; i++) {
        if (data.get(i).get('data') !== previousData.get(i).get('data')) {
          foundChanges = true;
          break;
        }
      }

      if (!foundChanges) {
        return;
      }

      this.__history = this.__history.splice(0, this.__historyIndex);
      this.__history.push(this.state.data);
      this.__historyIndex = this.__history.length;
    }
  }

  getInitialColumns = (props) => {
    let columnsReConstruction = props.columns.filter((column) => column.Hidden !== true);
    return columnsReConstruction.map((column, i) => {
      const newColumn = { column, __index: i };
      return new Immutable.Map(newColumn);
    });
  }

  handleRowMouseDown(rowIndex) {
    this.cancelLongClick();
    this.longClickTimer = setTimeout(() => {
      this.setState({
        longPressedRowIndex: rowIndex
      });
    }, 1000);
  }

  handleRowMouseUp() {
    this.cancelLongClick();
  }

  cancelLongClick() {
    if (this.longClickTimer) {
      clearTimeout(this.longClickTimer);
      this.longClickTimer = null;
    }
  }

  /**
   * Internal Methods
   */
  validateRow(s, columns, row) {
    const errors = {};
    //  No data
    if (row.length === 0) {
      return errors;
    }
    //  Per column
    columns.forEach(column => {
      column = column.get('column');
      const error = validator(row, row.getValue(column.columnKey),
        true, column.options, column.validator);
      if (error) {
        errors[column.columnKey] = (column.label || column.columnKey) + ': ' + error;
      }
    });
    this.setState({ errors: errors });
    return Object.keys(errors).length > 0 ? errors : null;
  }

  getColumnsWithSelection(prevSel, sel) {
    return this.state.columns.map((column, i) => {
      const prevSelected = inBetween(i, prevSel.startCol, prevSel.endCol);
      const selected = inBetween(i, sel.startCol, sel.endCol);
      if (prevSelected !== selected) {
        return column.set('__selected', selected);
      } else {
        return column;
      }
    });
  }

  getRowIndexDataWithSelection(sel) {
    const allSelected = sel.startRow === 0 && sel.endRow === this.state.data.length - 1 &&
                          sel.startCol === 0 && sel.endCol === this.state.columns.length - 1;
    if (!this.state.rowIndexData || this.state.rowIndexData.__allSelected !== allSelected) {
      return { __allSelected: allSelected };
    } else {
      return this.state.rowIndexData;
    }
  }

  setSelectionPoint = (startRow, endRow, startCol, endCol, force) => {
    const prevSelection = this.state.selection;
    const selection = {
      startRow,
      endRow,
      startCol,
      endCol
    };

    if (isEqual(selection, this.state.selection) && !force) {
      return;
    }

    const columns = this.getColumnsWithSelection(prevSelection, selection);
    const rowIndexData = this.getRowIndexDataWithSelection(selection);

    this.setState({ selection, columns, rowIndexData });
  }

  setSelectionObject(obj, force) {
    const sel = {};
    assign(sel, this.state.selection, obj);
    this.setSelectionPoint(sel.startRow, sel.endRow, sel.startCol, sel.endCol, force);
  }

  setCopySelectionPoint = (startRow, endRow, startCol, endCol) => {
    const copySelection = {
      startRow: Math.min(startRow, endRow),
      endRow: Math.max(startRow, endRow),
      startCol: Math.min(startCol, endCol),
      endCol: Math.max(startCol, endCol)
    };

    if (isEqual(copySelection, this.state.copySelection)) {
      return;
    }

    this.setState({ copySelection });
  }

  setCopySelectionObject(obj) {
    const sel = {};
    assign(sel, this.state.copySelection, obj);
    this.setCopySelectionPoint(sel.startRow, sel.endRow, sel.startCol, sel.endCol);
  }

  setEditing = (editing, data) => {
    return new Promise((resolve, reject) => {
      const sel = this.state.selection;
      if (editing !== !!this.state.editing) {
        data = data || this.state.data;

        const prevSel = this.state.editing;
        if (prevSel) {
          Reflect.deleteProperty(data[prevSel.startRow], 'editing');
        }

        let row = data[sel.startRow];
        if (editing) {
          row['editing'] = sel.startCol;
        } else {
          Reflect.deleteProperty(row, 'editing');
        }
      }

      this.setState({ editing: editing ? sel : null, data }, resolve);

      if (!editing) {
        setTimeout(this.focusBase, 0);
      }
    });
  }

  focusBase = () => {
    ReactDOM.findDOMNode(this.base).focus();
  }

  focusDummy = () => {
    ReactDOM.findDOMNode(this.dummy).select();
  }

  dataToData(data) {
    if (data) {
      return data.map(d => { return new Immutable.Map({ data: d.get('data'), errors: d.get('errors') }); });
    } else {
      return data;
    }
  }

  getSelectionFromChange(data, newData) {
    let selection = {};

    //  Check row
    for (let i = 0; i <= newData.length; i++) {
      //  If start not found and row is different, it means startRow
      //  else If start found and row is same, or row not found, it means ended
      if (selection.startRow === undefined && newData.get(i) &&
      newData.get(i).get('data') !== data.get(i).get('data')) {
        selection.startRow = i;
      }else if (selection.startRow !== undefined && (!newData.get(i) ||
      newData.get(i).get('data') === data.get(i).get('data'))) {
        selection.endRow = i - 1;
        break;
      }
    }

    //  Check column
    for (let i = selection.startRow; i <= selection.endRow; i++) {
      for (let j = 0; j <= this.state.columns.length; j++) {
        const columnKey = this.state.columns[j] ? this.state.columns[j].get('column').columnKey : null;

        //  If start not found and col is different, it means startRow
        //  else If start found and col is same, or col not found, it means ended
        if ((selection.startCol === undefined || selection.startCol > j) && newData.get(i) &&
            newData.get(i).get('data').get(columnKey) !== data.get(i).get('data').get(columnKey)) {
          selection.startCol = j;
        }else if (selection.startCol !== undefined &&
          (selection.endCol === undefined || selection.endCol < j) &&
                 (!newData.get(i) || newData.get(i).get('data').get(columnKey) ===
                 data.get(i).get('data').get(columnKey))) {
          selection.endCol = j - 1;
          break;
        }
      }
    }

    return selection;
  }


  /**
   * Handlers
   */
  preventDefault = (e) => {
    e.preventDefault();
  }

  handleResizeColumn = (newColumnWidth, key) => {
    const columnWidthOverrides = { ...this.state.columnWidthOverrides };
    columnWidthOverrides[key] = newColumnWidth;
    this.setState({ columnWidthOverrides });
    this.props.handleUserPreferenceUpdate();
  }

  handleGlobalMouseDown = (type, selection, e) => {
    if (e.button === 2 && areaInBetweenArea(selection, this.state.selection)) {
      return;
    }

    if (this.state.editing) {
      setTimeout(() => {
        this.__dragging[type] = true;
        this.setSelectionObject(selection);
        //this.focusBase();
      }, 0);
    } else {
      this.__dragging[type] = true;
      this.setSelectionObject(selection);
      //this.focusBase();
    }
  }

  rowIndexMouseOver = (type, selection, row, e) => {
    const sel = {};
    assign(sel, this.state.selection, selection);
    this.setState({ showCheckboxIdx: row.id });
  }

  onRowsSelectedDeselect = (type, selection, row, e) => {
    let rIdx = this.state.selectedIds;
    let slectedIdx = _find(rIdx, function(rowIdx) {
      return rowIdx === row.id;
    });
    if(slectedIdx) {
      _remove(rIdx, function(rowIdx) {
        return rowIdx === slectedIdx;
      });
    }else{
      rIdx.push(row.id);
    }
    this.setState({ selectedIds: rIdx });
  }

  handleRowIndexMouseOver = (type, selection, errors, e) => {
    const errorsArr = [];
    for (let key in errors) {
      errorsArr.push(errors[key]);
    }

    this.handleGlobalMouseOver(type, selection);

    if (errorsArr.length > 0) {
      this.handleCellMouseEnter(errorsArr, e);
    }
  }

  handleGlobalMouseOver = (type, selection) => {
    if (this.__dragging[type] && !this.state.editing) {
      this.setSelectionObject(selection);
    }
  }

  handleGlobalMouseUp = () => {
    this.__dragging = {};
  }

  handleSelectAll = () => {
    this.setSelectionPoint(0, Math.max(this.state.data.length, this.state.data.length), 0, this.state.columns.length);
  }
  handleCheckBoxChangesAll = () => {
    let rIdx = this.state.selectedIds;
    if(rIdx.length !== this.state.data.length) {
      rIdx = _map(this.state.data, function(item) {
        return item.id;
      });
    }else{
      rIdx = [];
    }
    this.setState({ selectedIds: rIdx });
  }

  handleDataUpdate(rowIndex, columnKey, value) {
    let data = this.state.data;
    let row = data[rowIndex];
    // let rowData = row.get('data');
    if (value || columnKey === "YesNo") {
      row.update(columnKey, value);
    } else {
      row.update(columnKey, "");
    }
    //this.props.onSave(this.props.model);
    //  Errors
    row['errors'] = this.validateRow(this.props.rowValidator, this.state.columns, row);
    this.setEditing(false, data).then(() => {
      this.setCopySelectionPoint(-1, -1, -1, -1);
    });
  }

  handleKeyDown = (e) => {
    if (!isInParent(e.target, ReactDOM.findDOMNode(this.base))) {
      return;
    }

    //  Arrow events
    const sel = this.state.selection;
    const ctrl = (e.ctrlKey || e.metaKey);
    const editing = this.state.editing;
    if (e.keyCode === CONSTANTS.UP_ARROW_KEY) {
      e.preventDefault();
      if (e.shiftKey) {
        this.setSelectionObject({ endRow: ctrl ? 0 : sel.endRow - 1 });
      } else {
        this.setSelectionPoint(sel.startRow - 1, sel.startRow - 1, sel.startCol, sel.startCol);
      }
    } else if (e.keyCode === CONSTANTS.DOWN_ARROW_KEY) {
      e.preventDefault();
      if (e.shiftKey) {
        this.setSelectionObject({ endRow: ctrl ? this.state.data.length : sel.endRow + 1 });
      } else {
        this.setSelectionPoint(sel.startRow + 1, sel.startRow + 1, sel.startCol, sel.startCol);
      }
    } else if (e.keyCode === CONSTANTS.LEFT_ARROW_KEY && !editing) {
      e.preventDefault();
      if (e.shiftKey) {
        this.setSelectionObject({ endCol: ctrl ? 0 : sel.endCol - 1 });
      } else {
        this.setSelectionPoint(sel.startRow, sel.startRow, sel.startCol - 1, sel.startCol - 1);
      }
    } else if (e.keyCode === CONSTANTS.RIGHT_ARROW_KEY && !editing) {
      e.preventDefault();
      if (e.shiftKey) {
        this.setSelectionObject({ endCol: ctrl ? this.props.columns.length : sel.endCol + 1 });
      } else {
        this.setSelectionPoint(sel.startRow, sel.startRow, sel.startCol + 1, sel.startCol + 1);
      }
    } else if (e.keyCode === CONSTANTS.ENTER_KEY) {
      e.preventDefault();
      this.setSelectionPoint(sel.startRow + 1, sel.startRow + 1, sel.startCol, sel.startCol);
    } else if (e.keyCode === CONSTANTS.TAb_KEY) {
      e.preventDefault();
      if (e.shiftKey) {
        this.setSelectionPoint(sel.startRow, sel.startRow, sel.startCol - 1, sel.startCol - 1);
      } else {
        this.setSelectionPoint(sel.startRow, sel.startRow, sel.startCol + 1, sel.startCol + 1);
      }
    } else if (e.keyCode === CONSTANTS.ESC_KEY && editing) {
      this.setEditing(false);
    } else if (e.keyCode === CONSTANTS.ESC_KEY && !editing) {
      this.setCopySelectionPoint(-1, -1, -1, -1);
      this.setState({ isCut: false });
    } else if (!editing && (e.keyCode === CONSTANTS.BACKSPACE_KEY || e.keyCode === CONSTANTS.DELETE_KEY)) {
      this.handleDelete(e);
    } else if (!editing && e.keyCode === CONSTANTS.A_TO_Z_KEY90 && ctrl) {
      if (e.shiftKey) {
        this.handleRedo();
      } else {
        this.handleUndo();
      }
      e.preventDefault();
    }else if (ctrl && (e.keyCode === CONSTANTS.A_TO_Z_KEY67 || e.keyCode === CONSTANTS.A_TO_Z_KEY88) && !editing) {
      //  Copy and cut
      if (isFirefox()) {
        this.focusBase();
        //  Force a selection so firefox will trigger oncopy
        const selection = document.getSelection();
        const range = document.createRange();
        range.setStartBefore(ReactDOM.findDOMNode(this.dummy));
        range.setEndAfter(ReactDOM.findDOMNode(this.dummy));
        selection.addRange(range);
        setTimeout(() => {
          selection.removeAllRanges();
        });
      }
    }else if (ctrl && e.keyCode === CONSTANTS.A_TO_Z_KEY86 && !editing) {
      //  Paste
      if (isFirefox()) {
        //  Force a selection so firefox will trigger onpaste
        this.focusDummy();
      }
    } else if (ctrl && e.keyCode === CONSTANTS.A_TO_Z_KEY65) {//  Ctrl + A
      //this.handleSelectAll();
    } else if (!ignoreKeyCodes[e.keyCode] && !this.state.editing && !isCommand(e)) {
      this.setEditing(true);
    } else if (ctrl && !isCommand(e)) {
      //  To focus on input for safari paste event
      if (isSafari()) {
        this.focusBase();
      }
    }
  }

  handleDoubleClick = (e) => {
    this.setEditing(true, this.state.data);
  }

  handleUndo = () => {
    if (this.__historyIndex > 1) {
      this.__historyIndex--;
      let data = this.__history[this.__historyIndex - 1];
      data = this.dataToData(data);

      const oldData = this.state.data;
      this.setEditing(false, data).then(() => {
        this.setSelectionObject(this.getSelectionFromChange(oldData, data), true);
      });
    }
  }

  handleRedo = () => {
    if (this.__historyIndex < this.__history.length) {
      this.__historyIndex++;
      let data = this.__history[this.__historyIndex - 1];
      data = this.dataToData(data);

      const oldData = this.state.data;
      this.setEditing(false, data).then(() => {
        this.setSelectionObject(this.getSelectionFromChange(oldData, data), true);
      });
    }
  }

  handleDelete = (e, selection) => {
    if (e) {
      e.preventDefault();
    }

    let data = this.state.data;
    const sel = selection || this.state.selection;
    const columns = this.state.columns;

    for (let rowI = Math.min(sel.startRow, sel.endRow); rowI <= Math.max(sel.startRow, sel.endRow); rowI++) {
      let row = data[rowI];
      //let rowData = row.get('data');
      for (let colI = Math.min(sel.startCol, sel.endCol); colI <= Math.max(sel.startCol, sel.endCol); colI++) {
        const columnKey = columns[colI].get('column').columnKey;
        row.update(columnKey, "");
      }
      row['errors'] = this.validateRow(this.props.rowValidator, this.state.columns, row);
    }
    this.props.onSave(this.props.model);
    this.setState({ data });
  }

  processCopy = () => {
    if (!isInParent(document.activeElement, ReactDOM.findDOMNode(this.base)) ||
        this.state.editing) {
      return null;
    }

    let data = [];
    const sel = this.state.selection;
    const startRow = Math.min(sel.startRow, sel.endRow);
    const endRow = Math.max(sel.startRow, sel.endRow);
    for (let row = startRow; row <= endRow; row++) {
      const rowDataRaw = [];
      const rowData = this.state.data[row];

      const startCol = Math.min(sel.startCol, sel.endCol);
      const endCol = Math.max(sel.startCol, sel.endCol);
      for (let col = startCol; col <= endCol; col++) {
        const columnKey = this.state.columns[col].get('column').columnKey;
        rowDataRaw.push(rowData.getValue(columnKey));
      }
      data.push(rowDataRaw.join('\t'));
    }

    this.setCopySelectionObject(sel);
    return data;
  }

  handleMenuCopy = (e) => {
    let data = this.processCopy();
    if (data) {
      clipboard.copy(data);
    }
    this.setState({ isCut: false });
  }

  handleMenuCut = (e) => {
    this.handleMenuCopy(e);
    this.setState({ isCut: true });
  }

  handleCopy = (e) => {
    let data = this.processCopy();
    if (data) {
      e.clipboardData.setData('text/plain', data.join('\n'));
      e.preventDefault();
    }
    this.setState({ isCut: false });
  }

  handleCut = (e) => {
    this.handleCopy(e);
    this.setState({ isCut: true });
  }

  handlePaste = (e) => {
    if (!isInParent(document.activeElement, ReactDOM.findDOMNode(this.base)) ||
        this.state.editing) {
      return;
    }

    e.preventDefault();
    let text = (e.originalEvent || e).clipboardData.getData('text/plain');

    if (text.charCodeAt(text.length - 1) === 65279) {
      text = text.substring(0, text.length - 1);
    }

    let rows = text.replace(/\r/g, '\n').split('\n');
    rows = rows.map(row => {
      return row.split('\t');
    });

    let data = this.state.data;
    const sel = this.state.selection;
    const isSingle = rows.length === 1 && rows[0] && rows[0].length === 1;

    const startRow = Math.min(sel.startRow, sel.endRow);
    const endRow = Math.max(sel.startRow, sel.endRow);
    const startCol = Math.min(sel.startCol, sel.endCol);
    const endCol = Math.max(sel.startCol, sel.endCol);

    //  If single cell
    if (isSingle) {
      for (let rowI = startRow; rowI <= endRow; rowI++) {
        let row = data[rowI];
        //let rowData = row.get('data');
        for (let colI = startCol; colI <= endCol; colI++) {
          const columnKey = this.props.columns[colI].columnKey;
          if (rows[0][0]) {
            row.update(columnKey, rows[0][0]);
          } else {
            row.update(columnKey, "");
          }
        }
        row['errors'] = this.validateRow(this.props.rowValidator, this.state.columns, row);
      }
    }else {//  If not single cell
      rows.forEach((r, i) => {
        i += startRow;

        //  Out of bound
        if (i >= this.state.data.length) {
          this.handleCreateNewRecord(i);
          data = this.state.data;
        }

        let row = data[i];
        //let rowData = row.get('data');
        r.forEach((value, j) => {
          j += startCol;

          //  Out of bound
          if (j >= this.props.columns.length) {
            return;
          }

          const columnKey = this.props.columns[j].columnKey;
          if (value) {
            row.update(columnKey, value);
          } else {
            row.update(columnKey, "");
          }
          row['errors'] = this.validateRow(this.props.rowValidator, this.state.columns, row);
        });
      });
    }
    this.props.onSave(this.props.model);
    //  Clear copy selection
    const copySelection = this.state.copySelection;
    if (!isSingle) {
      this.setSelectionPoint(startRow, startRow + rows.length - 1, startCol, startCol + rows[0].length - 1);
    }

    //  Clear data for cut area
    if (this.state.isCut) {
      this.handleDelete(null, copySelection);
      this.setState({ isCut: false, copySelection: {} });
    }else{
      this.setState({ data, copySelection: {} });
    }
  }

  handleCellMouseEnter = (errors, e) => {
    const cell = e.target.tagName === 'div' ? e.target : e.target.parentNode.parentNode;
    this.setState({
      showError: {
        errors: Array.isArray(errors) ? errors : [errors],
        boundingBox: cell.getBoundingClientRect()
      }
    });
  }

  handleCellMouseLeave = () => {
    this.setState({ showCheckboxIdx: "" });
  }

  handleColumnContextMenu(column, e) {
    e.preventDefault();
    this.setState({
      columnMenu: {
        column,
        position: { left: e.clientX, top: e.clientY }
      }
    });
  }

  handleRowContextMenu(row, isHeader, e) {
    e.preventDefault();
    this.setState({
      rowMenu: {
        row,
        position: { left: e.clientX, top: e.clientY },
        isHeader
      }
    });
  }

  handleSelectionContextMenu = (e) => {
    e.preventDefault();
    this.setState({
      selectionMenu: {
        selection: this.state.selection,
        position: { left: e.clientX, top: e.clientY }
      }
    });
  }

  handleBaseClick = (e) => {
    setTimeout(() => {
      //  Reset menus
      if (this.state.columnMenu) {
        this.setState({ columnMenu: null });
      }
      if (this.state.rowMenu) {
        this.setState({ rowMenu: null });
      }
      if (this.state.selectionMenu) {
        this.setState({ selectionMenu: null });
      }
      if(this.state.showError) {
        this.setState({ showError: null });
      }
    }, 0);
  }

  handleSort = (direction) => {
    const column = this.state.columnMenu.column;
    const columnKey = column.get('column').columnKey;

    let data = this.state.data;
    data = data.sort((a, b) => {
      const dataA = a.get('data').get(columnKey);
      const dataB = b.get('data').get(columnKey);

      if (!dataA && !dataB) {
        return b.get('data').length - a.get('data').length;
      }

      if (!dataA) {
        return 1;
      }

      if (!dataB) {
        return -1;
      }

      return dataB > dataA ? -direction : direction;
    });

    this.setState({ data });
  }

  handleDeleteRow = () => {
    const selection = this.state.selection;
    let data = this.state.data;

    let startIndex = selection.startRow < selection.endRow ? selection.startRow : selection.endRow;
    let endIndex = selection.startRow > selection.endRow ? selection.startRow : selection.endRow;
    for (let i = startIndex; i < endIndex + 1; i++) {
      let id = data[i].id;
      this.state.model.delete(this.state.appName, id);
    }
    this.props.onSave();
    data = this.state.model.getList(this.state.appName);
    this.setState({ data }, () => {
      this.setSelectionPoint(-1, -1, -1, -1);
    });
  }

  handleDeleteRecord = (rowId) => {
    let data = this.state.data;
    this.state.model.delete(this.state.appName, rowId);
    this.props.onSave();
    data = this.state.model.getList(this.state.appName);
    this.setState({ data }, () => {
      this.setSelectionPoint(-1, -1, -1, -1);
    });
  }

  handleSaveRecord = () => {
    let data = this.state.data;
    this.props.onSave();
    data = this.state.model.getList(this.state.appName);
    this.setState({ data }, () => {
      this.setSelectionPoint(-1, -1, -1, -1);
    });
  }

  handleCreateNewRecord= (startRow) => {
    this.state.model.create(this.state.appName, startRow);
    this.props.onSave();
    let data = this.state.model.getList(this.state.appName);
    this.setState({ data });
  }

  handleInsertRow = (startRow, amount) => {
    for (let i = 0; i < amount; i++) {
      this.state.model.create(this.state.appName, startRow);
    }
    this.props.onSave();
    let data = this.state.model.getList(this.state.appName);
    this.setState({ data }, () => {
      this.setSelectionPoint(startRow, startRow + amount - 1, 0, this.state.columns.size);
    });
  }

  handleDND = (dndObject) => {
    var dndData = dndObject.data;
    var newData = arraymove(dndData, dndObject.from, dndObject.to);
    function arraymove(array, from, to) {
      if(to === from) return array;
      var target = array[from];
      var increment = to < from ? -1 : 1;
      for(var k = from; k !== to; k += increment) {
        array[k] = array[k + increment];
      }
      array[to] = target;
      return array;
    }
    this.setState({ data: newData });
  }

  /**
   * Rendering
   */
  indexHeaderRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <HeaderIndex
        //selected={ column.__allSelected }
        selectedIds={this.state.selectedIds}
        rowCount = {this.state.data.length}
        getStyle={ this.props.getRowHeaderStyle }
        onMouseDown={ this.handleSelectAll }
        handleCheckBoxChanges= { this.handleCheckBoxChangesAll }
        //onContextMenu={ this.handleRowContextMenu.bind(this, column, true) }
        viewForm ={this.props.viewForm}
        onMouseLeave={ this.handleCellMouseLeave }
      />
    );
  }


  indexRenderer = (column, rowIndex, columnKey, row) => {
    const selected = inBetween(rowIndex,
      this.state.selection.startRow,
      this.state.selection.endRow);
    return (
      <RowIndex
        index={ rowIndex }
        selected={ selected }
        width={40}
        row ={row}
        column={ column.get('column') }
        rowHeight ={this.props.rowHeight}
        data={this.state.data}
        errors={ row['errors'] }
        history={this.props.history}
        handleDND = {this.handleDND}
        getStyle={ this.props.getRowHeaderStyle }
        rowSelection={this.state.showCheckboxIdx}
        selectedIds={this.state.selectedIds}
        onMouseDown={ this.handleGlobalMouseDown.bind(this, 'row', {
          startRow: rowIndex,
          endRow: rowIndex,
          startCol: 0,
          endCol: this.state.columns.length - 1
        }) }
        handleCheckBoxChanges ={ this.onRowsSelectedDeselect.bind(this, 'row', {
          startRow: rowIndex,
          endRow: rowIndex,
          startCol: 0,
          endCol: this.state.columns.length - 1
        }, row) }
        onMouseOver = {this.rowIndexMouseOver.bind(this, 'row', {
          startRow: rowIndex,
          endRow: rowIndex,
          startCol: 0,
          endCol: this.state.columns.length - 1
        }, row) }
        onMouseEnter={ this.handleRowIndexMouseOver.bind(this, 'row', {
          endRow: rowIndex
        }, row['errors']) }
        onMouseLeave={ this.handleCellMouseLeave }
        onContextMenu={ this.handleRowContextMenu.bind(this, column, false) }
      />
    );
  }

  headerRenderer = (column, columnKey, height, width) => {
    return (
      <HeaderCell
        column={ column.get('column') }
        selected={ column.get('__selected') }
        getStyle={ this.props.getColumnHeaderStyle }
        handleSort={ this.props.handleSort }
        sort={ this.props.sort }
        // onMouseDown={this.handleGlobalMouseDown.bind(this, 'column', {
        //   startRow: 0,
        //   endRow: this.state.data.length - 1,
        //   startCol: column.get('__index'),
        //   endCol: column.get('__index')
        // }) }
        onMouseEnter={ this.handleGlobalMouseOver.bind(this, 'column', {
          endCol: column.get('__index')
        }) }
        onContextMenu={ this.handleColumnContextMenu.bind(this, column) } />
    );
  }

  indexfooterRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <div>
        <FooterRowIndex
          column={column.get('column')}
          getStyle={ this.props.getRowHeaderStyle }
          onMouseDown={ () => this.handleCreateNewRecord()}
        />
      </div>
    );
  }


  footerRenderer = (column, columnKey, height, width) => {
    return (
      <FooterCell
        column={ column.get('column') }
        getStyle={ this.props.getColumnHeaderStyle }
      />
    );
  }

  headerOpenFormRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <HeaderOpenForm
        getStyle={this.props.getRowHeaderStyle}
      />
    );
  }

  rowOpenFormRenderer = (column, rowIndex, columnKey, row) => {
    const selected = inBetween(rowIndex,
      this.state.selection.startRow,
      this.state.selection.endRow);
    return (
      <RowOpenForm
        index={rowIndex}
        selected={selected}
        selectedIds={this.state.selectedIds}
        width={40}
        row={row}
        modelId={this.state.appName}
        history={this.props.history}
        getStyle={this.props.getRowHeaderStyle}
      />
    );
  }

  footerOpenFormRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <div>
        <FooterOpenForm
          getStyle={this.props.getRowHeaderStyle}
        />
      </div>
    );
  }

  headerButtionRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <HeaderButtion
        getStyle={this.props.getRowHeaderStyle}
        handleSaveRecord={this.handleSaveRecord}
      />
    );
  }

  rowButtionRenderer = (column, rowIndex, columnKey, row) => {
    const selected = inBetween(rowIndex,
      this.state.selection.startRow,
      this.state.selection.endRow);
    return (
      <RowButtion
        index={rowIndex}
        selected={selected}
        selectedIds={this.state.selectedIds}
        width={40}
        row={row}
        handleDeleteRecord={this.handleDeleteRecord}
        modelId={this.state.appName}
        history={this.props.history}
        getStyle={this.props.getRowHeaderStyle}
      />
    );
  }

  footerButtionRenderer = (column, rowIndex, columnKey, width, height) => {
    return (
      <div>
        <FooterButtion
          getStyle={this.props.getRowHeaderStyle}
        />
      </div>
    );
  }


  cellRenderer = (columnKey, row, rowIndex, column, width) => {
    const cellData = row.getValue(columnKey);
    const columnData = column.get('column');
    const columnIndex = column.get('__index');
    const sel = this.state.selection;
    const copySel = this.state.copySelection;
    //  Selection
    const focused = sel.startRow === rowIndex && sel.startCol === columnIndex;
    const selected = inBetweenArea(rowIndex, columnIndex, sel.startRow, sel.endRow, sel.startCol, sel.endCol);

    const prevRowFocused = (sel.startRow === rowIndex - 1) && (sel.startCol === columnIndex);
    const prevRowSelected = inBetweenArea(rowIndex - 1,
      columnIndex, sel.startRow, sel.endRow, sel.startCol, sel.endCol);
    const hasPrevRow = (prevRowSelected && (Math.max(sel.startRow, sel.endRow) ===
      rowIndex - 1)) || prevRowFocused;

    const prevColumnFocused = (sel.startRow === rowIndex) && (sel.startCol === columnIndex - 1);
    const prevColumnSelected = inBetweenArea(rowIndex, columnIndex - 1, sel.startRow,
      sel.endRow, sel.startCol, sel.endCol);
    const hasPrevColumn = (prevColumnSelected && (Math.max(sel.startCol, sel.endCol) ===
      columnIndex - 1)) || prevColumnFocused;

    const isLeft = Math.min(sel.startCol, sel.endCol) === columnIndex;
    const isRight = Math.max(sel.startCol, sel.endCol) === columnIndex;
    const isTop = Math.min(sel.startRow, sel.endRow) === rowIndex;
    const isBottom = Math.max(sel.startRow, sel.endRow) === rowIndex;

    //  Errors
    const errors = row['errors'] || {};

    //  Editing
    const editing = row['editing'] === columnIndex && focused;

    //  Copy selection
    const copySelectedRow = inBetween(rowIndex, copySel.startRow, copySel.endRow);
    const copySelectedCol = inBetween(columnIndex, copySel.startCol, copySel.endCol);
    const isCopyLeft = Math.min(copySel.startCol, copySel.endCol) === columnIndex;
    const isCopyRight = Math.max(copySel.startCol, copySel.endCol) === columnIndex;
    const isCopyTop = Math.min(copySel.startRow, copySel.endRow) === rowIndex;
    const isCopyBottom = Math.max(copySel.startRow, copySel.endRow) === rowIndex;

    //  Return cell
    return (
      <CellAction
        data={ cellData }
        editing={ editing }
        focused={ focused }
        row ={row}
        selected={ selected }
        rowHeight ={this.props.rowHeight}
        hasPrevRow={ hasPrevRow }
        hasPrevColumn={ hasPrevColumn }
        isLeft={ isLeft }
        isRight={ isRight }
        isTop={ isTop }
        isBottom={ isBottom }
        error={ errors[columnKey] }
        isCopyLeft={ isCopyLeft && copySelectedRow }
        isCopyRight={ isCopyRight && copySelectedRow }
        isCopyTop={ isCopyTop && copySelectedCol }
        isCopyBottom={ isCopyBottom && copySelectedCol }
        column={ columnData }
        selection={ sel }
        rowIndex={ rowIndex }
        columnIndex={ columnIndex }
        selectedIds={this.state.selectedIds}
        getStyle={ this.props.getCellStyle }
        onUpdate={ this.handleDataUpdate.bind(this, rowIndex, columnKey) }
        onMouseDown={this.handleGlobalMouseDown.bind(this, 'cell', {
          startRow: rowIndex,
          endRow: rowIndex,
          startCol: column.get('__index'),
          endCol: column.get('__index')
        }) }
        onMouseOver={this.handleGlobalMouseOver.bind(this, 'cell', {
          endRow: rowIndex,
          endCol: column.get('__index')
        }) }
        onMouseEnter={ errors[columnKey] ? this.handleCellMouseEnter.bind(this, errors[columnKey]) : null }
        onMouseLeave={ this.handleCellMouseLeave }
        onDoubleClick={this.handleDoubleClick}
        onContextMenu={ this.handleSelectionContextMenu } />
    );
  }

  getColumns(props) {
    let columns = [];
    let columnsTypes = ['Number', 'Date', "DateTime"];
    columns.push(
      <Column
        key="___index"
        columnKey="___index"
        columnData={this.state.rowIndexData}
        width={40}
        header={ cell => this.indexHeaderRenderer(this.state.columns[0], cell.rowIndex,
          cell.columnKey, this.state.data[cell.rowIndex]) }
        cell={cell => this.indexRenderer(this.state.columns[0], cell.rowIndex,
          cell.columnKey, this.state.data[cell.rowIndex])}
        footer={cell => this.indexfooterRenderer(this.state.columns[0], cell.rowIndex,
          cell.columnKey, this.state.data[cell.rowIndex])}
        isReorderable={true}
        fixed={true} />
    );
    if(this.props.viewForm) {
      columns.push(
        <Column
          key="openform"
          columnKey="openform"
          columnData={this.state.rowIndexData}
          width={40}
          header={cell => this.headerOpenFormRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          cell={cell => this.rowOpenFormRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          footer={cell => this.footerOpenFormRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          fixed={true} />
      );
    }
    this.state.columns.forEach((column, i) => {
      const columnData = column.get('column');
      columnData.columnData = column;
      columnData.columnKey = columnData.Name;
      columnData.cell = (cell) => this.cellRenderer(cell.columnKey, this.state.data[cell.rowIndex],
        cell.rowIndex, this.state.columns[i], cell.Width);
      columnData.header = (cell) => this.headerRenderer(this.state.columns[i],
        cell.columnKey, cell.height, cell.Width);
      columnData.footer = (cell) => this.footerRenderer(this.state.columns[i],
        cell.columnKey, cell.height, cell.Width);
      columnData.width = this.state.columnWidthOverrides[columnData.columnKey] || columnData.Width || 200;
      columnData.allowCellsRecycling = false;
      columnData.isResizable = true;
      columnData.isReorderable = true;
      columnData.align = columnData.Type === _find(columnsTypes, function(o) {
        return o === columnData.Type;
      }) ? 'right' : 'left';
      columnData.fixed = columnData.Fixed;
      columnData.fixedRight = columnData.RightFixed;
      //  Last column fills up all the remaining width
      if (i === this.state.columns.length - 1) {
        columnData.flexGrow = 2;
      }

      columns.push(
        <Column
          { ...columnData }
          key={ columnData.columnKey }
        />
      );
    });
    if (this.props.actionButtion) {
      columns.push(
        <Column
          key="actionbtn"
          columnKey="actionbtn"
          columnData={this.state.rowIndexData}
          width={130}
          header={cell => this.headerButtionRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          cell={cell => this.rowButtionRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          footer={cell => this.footerButtionRenderer(this.state.columns[0], cell.rowIndex,
            cell.columnKey, this.state.data[cell.rowIndex])}
          fixedRight={true} />
      );
    }
    return columns;
  }

  getErrorPopover() {
    const showError = this.state.showError;
    if (!showError) {
      return null;
    }
    return (
      <AutoPosition
        anchorBox={ { left: showError.boundingBox.left, top: showError.boundingBox.top }} >
        <ErrorBox errors={ showError.errors } getStyle={ this.props.getCellErrorStyle }/>
      </AutoPosition>
    );
  }

  getContextMenu() {
    if (!this.state.selectionMenu && !this.state.rowMenu) {
      return null;
    }
    let pos = {
      left: 0,
      top: 0
    };

    const selectionMenu = this.state.selectionMenu;
    const selection = this.state.selection;
    const startRow = Math.min(selection.startRow, selection.endRow);
    const endRow = Math.max(selection.startRow, selection.endRow);
    const rowCount = endRow - startRow + 1;
    const rowMenu = this.state.rowMenu;
    if(this.state.rowMenu) {
      pos.left = rowMenu.position.left;
      pos.top = rowMenu.position.top;
    }else{
      pos.left = selectionMenu.position.left;
      pos.top = selectionMenu.position.top;
    }
    return (
      <AutoPosition
        anchorBox={ { left: pos.left, top: pos.top } } >
        <Menu items={[
          { label: 'Insert record above', onClick: this.handleInsertRow.bind(this, startRow, rowCount) },
          { label: 'Insert record below', onClick: this.handleInsertRow.bind(this, endRow + 1, rowCount) },
          { label: 'Duplicate record', onClick: this.handleCreateNewRecord },
          { label: 'Delete record', onClick: this.handleDeleteRow },
          { label: 'Copy', onClick: this.handleMenuCopy },
          { label: 'Paste', onClick: this.handleMenuCopy },
          // { label: 'Clear', onClick: this.handleDelete },
          { label: 'Create as a task', onClick: this.handleInsertRow.bind(this, this.state.data.length + 1, rowCount) }
        ]} />
      </AutoPosition>
    );
  }

  render() {
    const TableHeader = this.props.tableHeader;
    const TableFooter = this.props.tableFooter;
    return (
      <DragDropContextProvider backend={HTML5Backend} >
        <div
          ref={(node) => {
            this.base = node;
          }}
          className={`${styles.flexifullSize} ${styles.flexitableBase} ${styles.tablemainWrapper}`}
          tabIndex="0"
          style={ this.state.tableHeight }>

          <Autosize>
            <Table
              rowsCount={this.state.data.length}
              onColumnResizeEndCallback={ this.handleResizeColumn }
              onColumnReorderEndCallback={ this.props.handleColumnReorder }
              isColumnResizing={ false }
              rowHeight={ this.props.rowHeight }
              headerHeight={ 40 }
              width={ 0 }
              height={ 0 }
              maxHeight={this.state.tableHeight}
              footer="flexitable"
              footerHeight={this.props.footerHeight}
              showScrollbarX={false}
              showScrollbarY={false}
              isColumnReordering={false}
            >
              {this.getColumns()}
            </Table>

          </Autosize>
          <input
            ref={(node) => {this.dummy = node;}}
            type="text"
            style={{ display: 'none' }}
            onFocus={ this.preventDefault } />
          {/* { this.getErrorPopover() } */}
          { this.getContextMenu() }

        </div>
      </DragDropContextProvider>
    );
  }
}

FlexiTable.propTypes = {
  model: PropTypes.object.isRequired,
  appName: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  onSave: PropTypes.func,
  rowValidator: PropTypes.func,
  getCellStyle: PropTypes.func,
  getRowHeaderStyle: PropTypes.func,
  getColumnHeaderStyle: PropTypes.func,
  getCellErrorStyle: PropTypes.func,
  rowHeight: PropTypes.number,
  history: PropTypes.object,
  rowIndexWidth: PropTypes.number,
  viewForm: PropTypes.bool.isRequired,
  rowKey: PropTypes.string,
  dropdown: PropTypes.func,
  tableHeader: PropTypes.func,
  tableFooter: PropTypes.func,
  sort: PropTypes.array,
  handleColumnReorder: PropTypes.func,
  footerHeight: PropTypes.number,
  handleUserPreferenceUpdate: PropTypes.func,
  handleSort: PropTypes.func,
  actionButtion: PropTypes.bool.isRequired
};

FlexiTable.defaultProps = {
  defaultData: [],
  rowHeight: 40,
  columns: [],
  viewForm: true,
  rowIndexWidth: 40,
  footerHeight: 40,
  actionButtion: true
};

export default FlexiTable;
