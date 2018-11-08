import React from 'react';
import PropTypes from 'prop-types';
import ReactWheelHandler from './rc.wheel.handler';
import {ReactTouchHandler} from './rc.touch.handler';
import Scrollbar from './scrollbar';
import FixedDataTableBufferedRows from './data.table.buffered.rows';
import FixedDataTableColumnResizeHandle from './data.table.column.resize.handle';
import {FixedDataTableRow} from './data.table.row';
import {FixedDataTableScrollHelper} from './data.table.scroll.helper';
import FixedDataTableWidthHelper from './data.table.width.helper';
import {FixedDataTableEventHelper} from './data.table.event.helper';

import {cx} from './vendor/core/cx';
import {debounce as debounceCore} from './vendor/core/debounce';
import {emptyFunction} from './vendor/core/emptyfunction';
import {invariant} from './vendor/core/invariant';
import {joinClasses} from './vendor/core/joinclasses';
import {shallowEqual} from './vendor/core/shallowequal';
import {FixedDataTableTranslateDOMPosition} from './data.table.translate.dom.position';
import styles from './css/datasheet.css';

var ReactChildren = React.Children;

var EMPTY_OBJECT = {};
var BORDER_HEIGHT = 1;
var HEADER = 'header';
var FOOTER = 'footer';
var CELL = 'cell';
var ARROW_SCROLL_SPEED = 25;
var DRAG_SCROLL_SPEED = 15;
var DRAG_SCROLL_BUFFER = 100;

class FixedDataTable extends React.Component {
  static propTypes= {
    width: PropTypes.number.isRequired,
    height: PropTypes.number,
    className: PropTypes.string,
    maxHeight: PropTypes.number,
    ownerHeight: PropTypes.number,
    overflowX: PropTypes.oneOf(['hidden', 'auto']),
    overflowY: PropTypes.oneOf(['hidden', 'auto']),
    touchScrollEnabled: PropTypes.bool,
    keyboardScrollEnabled: PropTypes.bool,
    keyboardPageEnabled: PropTypes.bool,
    showScrollbarX: PropTypes.bool,
    showScrollbarY: PropTypes.bool,
    onHorizontalScroll: PropTypes.func,
    onVerticalScroll: PropTypes.func,
    rowsCount: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    rowHeightGetter: PropTypes.func,
    subRowHeight: PropTypes.number,
    subRowHeightGetter: PropTypes.func,
   rowExpanded: PropTypes.oneOfType([
     PropTypes.element,
     PropTypes.func,
   ]),
    rowClassNameGetter: PropTypes.func,
    rowKeyGetter: PropTypes.func,
    groupHeaderHeight: PropTypes.number,
    headerHeight: PropTypes.number.isRequired,
    cellGroupWrapperHeight: PropTypes.number,
    footerHeight: PropTypes.number,
    scrollLeft: PropTypes.number,
    scrollToColumn: PropTypes.number,
    scrollTop: PropTypes.number,
    scrollToRow: PropTypes.number,
    onScrollStart: PropTypes.func,
    onScrollEnd: PropTypes.func,
    stopScrollPropagation: PropTypes.bool,
    onContentHeightChange: PropTypes.func,
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseUp: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    onRowTouchStart: PropTypes.func,
    onRowTouchEnd: PropTypes.func,
    onRowTouchMove: PropTypes.func,
    onColumnResizeEndCallback: PropTypes.func,
    onColumnReorderEndCallback: PropTypes.func,
    isColumnResizing: PropTypes.bool,
    isColumnReordering: PropTypes.bool,
    bufferRowCount: PropTypes.number,
  }
  static defaultProps = {
    footerHeight: 0,
    groupHeaderHeight: 0,
    headerHeight: 39,
    showScrollbarX: true,
    showScrollbarY: true,
    touchScrollEnabled: false,
    keyboardScrollEnabled: false,
    keyboardPageEnabled: false,
    stopScrollPropagation: false
  }

  constructor(props){
    super(props);
    this.onRef = this.onRef.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.shouldHandleWheelX = this.shouldHandleWheelX.bind(this);
    this.shouldHandleWheelY = this.shouldHandleWheelY.bind(this);
    this.onVerticalScroll = this.onVerticalScroll.bind(this);
    this.onHorizontalScroll = this.onHorizontalScroll.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.calculateState = this.calculateState.bind(this);
    this.didScrollStopSync = this.didScrollStopSync.bind(this);
    this.onColumnReorder = this.onColumnReorder.bind(this);
    this.renderRows = this.renderRows.bind(this);
    this.showScrollbarY = this.showScrollbarY.bind(this);
    this.onColumnReorderMove = this.onColumnReorderMove.bind(this);
    this.onColumnReorderEnd = this.onColumnReorderEnd.bind(this);
    this.populateColumnsAndColumnData = this.populateColumnsAndColumnData.bind(this);
    this.areColumnSettingsIdentical = this.areColumnSettingsIdentical.bind(this);
    this.splitColumnTypes = this.splitColumnTypes.bind(this);
    this.selectColumnElement = this.selectColumnElement.bind(this);
    this.didScrollStart = this.didScrollStart.bind(this);
    this.reportContentHeight = this.reportContentHeight.bind(this);
    this.state ={}
  }

  componentWillMount() {
    var props = this.props;

    var viewportHeight =
      (props.height === undefined ? props.maxHeight : props.height) -
      (props.headerHeight || 0) -
      (props.footerHeight || 0) -
      (props.groupHeaderHeight || 0);
    this.scrollHelper = new FixedDataTableScrollHelper(
      props.rowsCount,
      props.rowHeight,
      viewportHeight,
      props.rowHeightGetter,
      props.subRowHeight,
      props.subRowHeightGetter,
    );

    this.didScrollStop = debounceCore(this.didScrollStopSync, 200, this);

    this.wheelHandler = new ReactWheelHandler(
      this.onScroll,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      props.stopScrollPropagation
    );
    this.touchHandler = new ReactTouchHandler(
      this.onScroll,
      this.shouldHandleTouchX,
      this.shouldHandleTouchY,
      props.stopScrollPropagation
    );

    this.setState(this.calculateState(props));
  }

  componentDidMount() {
    this.reportContentHeight();
  }

  componentWillReceiveProps(nextProps) {
    // var newOverflowX = nextProps.overflowX;
    // var newOverflowY = nextProps.overflowY;

    // In the case of controlled scrolling, notify.
    if (this.props.ownerHeight !== nextProps.ownerHeight ||
        this.props.scrollTop !== nextProps.scrollTop ||
        this.props.scrollLeft !== nextProps.scrollLeft) {
      this.didScrollStart();
    }

    // Cancel any pending debounced scroll handling and handle immediately.
    this.didScrollStop.reset();
    this.didScrollStopSync();

    this.setState(this.calculateState(nextProps, this.state));
  }

  componentWillUnmount() {
    this.wheelHandler = null;
    this.touchHandler = null;

    // Cancel any pending debounced scroll handling and handle immediately.
    this.didScrollStop.reset();
    this.didScrollStopSync();
  }

  componentDidUpdate() {
    this.reportContentHeight();
  }

  shouldHandleTouchX(delta) {
    return this.props.touchScrollEnabled && this.shouldHandleWheelX(delta);
  }

  shouldHandleTouchY(delta) {
    return this.props.touchScrollEnabled && this.shouldHandleWheelY(delta);
  }

  shouldHandleWheelX(delta) {
    if (this.props.overflowX === 'hidden') {
      return false;
    }

    delta = Math.round(delta);
    if (delta === 0) {
      return false;
    }

    return (
      (delta < 0 && this.state.scrollX > 0) ||
      (delta >= 0 && this.state.scrollX < this.state.maxScrollX)
    );
  }

  shouldHandleWheelY(delta) {
    if (this.props.overflowY === 'hidden' || delta === 0) {
      return false;
    }

    delta = Math.round(delta);
    if (delta === 0) {
      return false;
    }

    return (
      (delta < 0 && this.state.scrollY > 0) ||
      (delta >= 0 && this.state.scrollY < this.state.maxScrollY)
    );
  }

  onKeyDown(event) {
    if (this.props.keyboardPageEnabled) {
      switch (event.key) {
        case 'PageDown':
          this.onScroll(0, this.scrollbarYHeight);
          event.preventDefault();
          break;

        case 'PageUp':
          this.onScroll(0, this.scrollbarYHeight * -1);
          event.preventDefault();
          break;

        default:
          break;
      }
    }
    if (this.props.keyboardScrollEnabled) {
      switch (event.key) {

        case 'ArrowDown':
          this.onScroll(0, ARROW_SCROLL_SPEED);
          event.preventDefault();
          break;

        case 'ArrowUp':
          this.onScroll(0, ARROW_SCROLL_SPEED * -1);
          event.preventDefault();
          break;

        case 'ArrowRight':
          this.onScroll(ARROW_SCROLL_SPEED, 0);
          event.preventDefault();
          break;

        case 'ArrowLeft':
          this.onScroll(ARROW_SCROLL_SPEED * -1, 0);
          event.preventDefault();
          break;

        default:
          break;
      }
    }
  }

  reportContentHeight() {
    var scrollContentHeight = this.state.scrollContentHeight;
    var reservedHeight = this.state.reservedHeight;
    var requiredHeight = scrollContentHeight + reservedHeight;
    var contentHeight;
    var useMaxHeight = this.props.height === undefined;
    if (useMaxHeight && this.props.maxHeight > requiredHeight) {
      contentHeight = requiredHeight;
    } else if (this.state.height > requiredHeight && this.props.ownerHeight) {
      contentHeight = Math.max(requiredHeight, this.props.ownerHeight);
    } else {
      contentHeight = this.state.height + this.state.maxScrollY;
    }
    if (contentHeight !== this.contentHeight &&
        this.props.onContentHeightChange) {
      this.props.onContentHeightChange(contentHeight);
    }
    this.contentHeight = contentHeight;
  }

  onRef(div) {
    if (this.props.stopReactWheelPropagation) {
      this.wheelHandler.setRoot(div);
    }
  }

  _onColumnResize(combinedWidth,leftOffset,cellWidth,cellMinWidth,cellMaxWidth,columnKey,event) {
    var coordinates = FixedDataTableEventHelper.getCoordinatesFromEvent(event);
    var x = coordinates.x;
    var y = coordinates.y;

    this.setState({
      isColumnResizing: true,
      columnResizingData: {
        left: leftOffset + combinedWidth - cellWidth,
        width: cellWidth,
        minWidth: cellMinWidth,
        maxWidth: cellMaxWidth,
        initialEvent: {
          clientX: x,
          clientY: y,
          preventDefault: emptyFunction
        },
        key: columnKey
      }
    });
  }

  onColumnReorder(columnKey,width,left,event) {
    var isFixed = this.state.headFixedColumns.some(function(column) {
      return column.props.columnKey === columnKey;
    });

    this.setState({
      isColumnReordering: true,
      columnReorderingData: {
        dragDistance: 0,
        isFixed: isFixed,
        scrollStart: this.state.scrollX,
        columnKey: columnKey,
        columnWidth: width,
        originalLeft: left,
        columnsBefore: [],
        columnsAfter: []
      }
    });
  }

  onColumnReorderMove(
    deltaX
  ) {
    //NOTE Need to clone this object when use pureRendering
    var reorderingData = Object.assign({}, this.state.columnReorderingData);
    reorderingData.dragDistance = deltaX;
    reorderingData.columnBefore = undefined;
    reorderingData.columnAfter = undefined;

    var isFixedColumn = this.state.columnReorderingData.isFixed;
    var scrollX = this.state.scrollX;

    if (!isFixedColumn) {
      //Relative dragX position on scroll
      var dragX = reorderingData.originalLeft - reorderingData.scrollStart + reorderingData.dragDistance;

      var fixedColumnsWidth = this.state.bodyFixedColumns.reduce((sum, column) => sum + column.props.width, 0);
      var relativeWidth = this.props.width - fixedColumnsWidth;

      //Scroll the table left or right if we drag near the edges of the table
      if (dragX > relativeWidth - DRAG_SCROLL_BUFFER) {
        scrollX = Math.min(scrollX + DRAG_SCROLL_SPEED, this.state.maxScrollX);
      } else if (dragX <= DRAG_SCROLL_BUFFER) {
        scrollX = Math.max(scrollX - DRAG_SCROLL_SPEED, 0);
      }

      reorderingData.dragDistance += this.state.scrollX - reorderingData.scrollStart;
    }

    this.setState({
      scrollX: scrollX,
      columnReorderingData: reorderingData
    });
  }

  onColumnReorderEnd(
    props,
    event
  ) {

    var columnBefore = this.state.columnReorderingData.columnBefore;
    var columnAfter = this.state.columnReorderingData.columnAfter;
    var reorderColumn = this.state.columnReorderingData.columnKey;
    var cancelReorder = this.state.columnReorderingData.cancelReorder;

    this.setState({
      isColumnReordering: false,
      columnReorderingData: {}
    });

    if (cancelReorder) {
      return
    }

    this.props.onColumnReorderEndCallback({
      columnBefore, columnAfter, reorderColumn
    });

    var onHorizontalScroll = this.props.onHorizontalScroll;
    if (this.state.columnReorderingData.scrollStart !== this.state.scrollX && onHorizontalScroll) {
      onHorizontalScroll(this.state.scrollX)
    };
  }

  areColumnSettingsIdentical(
    oldColumns,
    newColumns
  ){
    if (oldColumns.length !== newColumns.length) {
      return false;
    }
    for (var index = 0; index < oldColumns.length; ++index) {
      if (!shallowEqual(
          oldColumns[index].props,
          newColumns[index].props
      )) {
        return false;
      }
    }
    return true;
  }

  populateColumnsAndColumnData(
    columns,
    columnGroups,
    oldState
  ){
    var canReuseColumnSettings = false;
    var canReuseColumnGroupSettings = false;

    if (oldState && oldState.columns) {
      canReuseColumnSettings =
        this.areColumnSettingsIdentical(columns, oldState.columns);
    }
    if (oldState && oldState.columnGroups && columnGroups) {
      canReuseColumnGroupSettings =
        this.areColumnSettingsIdentical(columnGroups, oldState.columnGroups);
    }

    var columnInfo = {};
    if (canReuseColumnSettings) {
      columnInfo.bodyFixedColumns = oldState.bodyFixedColumns;
      columnInfo.bodyFixedRightColumns = oldState.bodyFixedRightColumns;
      columnInfo.bodyScrollableColumns = oldState.bodyScrollableColumns;
      columnInfo.headFixedColumns = oldState.headFixedColumns;
      columnInfo.headFixedRightColumns = oldState.headFixedRightColumns;
      columnInfo.headScrollableColumns = oldState.headScrollableColumns;
      columnInfo.footFixedColumns = oldState.footFixedColumns;
      columnInfo.footFixedRightColumns = oldState.footFixedRightColumns;
      columnInfo.footScrollableColumns = oldState.footScrollableColumns;
    } else {
      var bodyColumnTypes = this.splitColumnTypes(columns);
      columnInfo.bodyFixedColumns = bodyColumnTypes.fixed;
      columnInfo.bodyFixedRightColumns = bodyColumnTypes.fixedRight;
      columnInfo.bodyScrollableColumns = bodyColumnTypes.scrollable;

      var headColumnTypes = this.splitColumnTypes(
        this.selectColumnElement(HEADER, columns)
      );
      columnInfo.headFixedColumns = headColumnTypes.fixed;
      columnInfo.headFixedRightColumns = headColumnTypes.fixedRight;
      columnInfo.headScrollableColumns = headColumnTypes.scrollable;

      var footColumnTypes = this.splitColumnTypes(
        this.selectColumnElement(FOOTER, columns)
      );
      columnInfo.footFixedColumns = footColumnTypes.fixed;
      columnInfo.footFixedRightColumns = footColumnTypes.fixedRight;
      columnInfo.footScrollableColumns = footColumnTypes.scrollable;
    }

    if (canReuseColumnGroupSettings) {
      columnInfo.groupHeaderFixedColumns = oldState.groupHeaderFixedColumns;
      columnInfo.groupHeaderFixedRightColumns = oldState.groupHeaderFixedRightColumns;
      columnInfo.groupHeaderScrollableColumns =
        oldState.groupHeaderScrollableColumns;
    } else {
      if (columnGroups) {
        var groupHeaderColumnTypes = this.splitColumnTypes(
          this.selectColumnElement(HEADER, columnGroups)
        );
        columnInfo.groupHeaderFixedColumns = groupHeaderColumnTypes.fixed;
        columnInfo.groupHeaderFixedRightColumns = groupHeaderColumnTypes.fixedRight;
        columnInfo.groupHeaderScrollableColumns =
          groupHeaderColumnTypes.scrollable;
      }
    }

    return columnInfo;
  }

  calculateState(props, /*?object*/ oldState) {
    invariant(
      props.height !== undefined || props.maxHeight !== undefined,
      'You must set either a height or a maxHeight'
    );

    var children = [];
    ReactChildren.forEach(props.children, (child, index) => {
      if (child == null) {
        return;
      }
      invariant(
        child.type.__TableColumnGroup__ ||
        child.type.__TableColumn__,
        'child type should be <FixedDataTableColumn /> or ' +
        '<FixedDataTableColumnGroup />'
      );
      children.push(child);
    });

    var scrollState;
    var firstRowIndex = (oldState && oldState.firstRowIndex) || 0;
    var firstRowOffset = (oldState && oldState.firstRowOffset) || 0;
    var scrollY = oldState ? oldState.scrollY : 0;
    var scrollX = oldState ? oldState.scrollX : 0;

    var lastScrollLeft = oldState ? oldState.scrollLeft : 0;
    if (props.scrollLeft !== undefined && props.scrollLeft !== lastScrollLeft) {
      scrollX = props.scrollLeft;
    }

    if (oldState && (props.rowsCount !== oldState.rowsCount || props.rowHeight !== oldState.rowHeight || props.height !== oldState.height)) {
      // Number of rows changed, try to scroll to the row from before the change
      var viewportHeight =
        (props.height === undefined ? props.maxHeight : props.height) -
        (props.headerHeight || 0) -
        (props.footerHeight || 0) -
        (props.groupHeaderHeight || 0);

      var oldViewportHeight = this.scrollHelper._viewportHeight;

      this.scrollHelper = new FixedDataTableScrollHelper(
        props.rowsCount,
        props.rowHeight,
        viewportHeight,
        props.rowHeightGetter,
        props.subRowHeight,
        props.subRowHeightGetter,
      );
      scrollState = this.scrollHelper.scrollToRow(firstRowIndex, firstRowOffset);
      firstRowIndex = scrollState.index;
      firstRowOffset = scrollState.offset;
      scrollY = scrollState.position;
    } else if (oldState) {
      if (props.rowHeightGetter !== oldState.rowHeightGetter) {
        this.scrollHelper.setRowHeightGetter(props.rowHeightGetter);
      }
      if (props.subRowHeightGetter !== oldState.subRowHeightGetter) {
        this.scrollHelper.setSubRowHeightGetter(props.subRowHeightGetter);
      }
    }

    // Figure out if the vertical scrollbar will be visible first,
    // because it will determine the width of the table
    var useGroupHeader = false;
    var groupHeaderHeight = 0;

    if (children.length && children[0].type.__TableColumnGroup__) {
      useGroupHeader = true;
      groupHeaderHeight = props.groupHeaderHeight;
    }

    var useMaxHeight = props.height === undefined;
    var height = Math.round(useMaxHeight ? props.maxHeight : props.height);
    var totalHeightReserved = props.footerHeight + props.headerHeight +
        groupHeaderHeight + 2 * BORDER_HEIGHT;
    var bodyHeight = height - totalHeightReserved;
    var scrollContentHeight = this.scrollHelper.getContentHeight();
    var totalHeightNeeded = scrollContentHeight + totalHeightReserved;
    var maxScrollY = Math.max(0, scrollContentHeight - bodyHeight);

    // If vertical scrollbar is necessary, adjust the table width to give it room
    var adjustedWidth = props.width;
    if (maxScrollY) {
      adjustedWidth = adjustedWidth - Scrollbar.SIZE - 1;
    }

    var lastScrollToRow  = oldState ? oldState.scrollToRow : undefined;
    if (props.scrollToRow != null && (props.scrollToRow !== lastScrollToRow || viewportHeight !== oldViewportHeight)) {
      scrollState = this.scrollHelper.scrollRowIntoView(props.scrollToRow);
      firstRowIndex = scrollState.index;
      firstRowOffset = scrollState.offset;
      scrollY = scrollState.position;
    }

    var lastScrollTop = oldState ? oldState.scrollTop : undefined;
    if (props.scrollTop != null && props.scrollTop !== lastScrollTop) {
      scrollState = this.scrollHelper.scrollTo(props.scrollTop);
      firstRowIndex = scrollState.index;
      firstRowOffset = scrollState.offset;
      scrollY = scrollState.position;
    }

    var columnResizingData;
    var continuingResizing = props.isColumnResizing === undefined &&
      oldState && oldState.isColumnResizing;
    if (props.isColumnResizing || continuingResizing) {
      columnResizingData = oldState && oldState.columnResizingData;
    } else {
      columnResizingData = EMPTY_OBJECT;
    }

    var columns;
    var columnGroups;

    if (useGroupHeader) {
      var columnGroupSettings =
        FixedDataTableWidthHelper.adjustColumnGroupWidths(
          children,
          adjustedWidth
      );
      columns = columnGroupSettings.columns;
      columnGroups = columnGroupSettings.columnGroups;
    } else {
      columns = FixedDataTableWidthHelper.adjustColumnWidths(
        children,
        adjustedWidth
      );
    }

    var columnInfo = this.populateColumnsAndColumnData(
      columns,
      columnGroups,
      oldState
    );

    var lastScrollToColumn = oldState ? oldState.scrollToColumn : undefined;
    if (props.scrollToColumn !== null
        && props.scrollToColumn !== lastScrollToColumn
        && columnInfo.bodyScrollableColumns.length > 0) {
      // If selected column is a fixed column, don't scroll
      var fixedColumnsCount = columnInfo.bodyFixedColumns.length;
      if (props.scrollToColumn >= fixedColumnsCount) {
        var totalFixedColumnsWidth = 0;
        var i, column;
        for (i = 0; i < columnInfo.bodyFixedColumns.length; ++i) {
          column = columnInfo.bodyFixedColumns[i];
          totalFixedColumnsWidth += column.props.width;
        }

        var j;
        for(j = 0; j < columnInfo.bodyFixedRightColumns.length; ++j) {
          column = columnInfo.bodyFixedRightColumns[j];
          totalFixedColumnsWidth += column.props.width;
        }

        // Convert column index (0 indexed) to scrollable index (0 indexed)
        // and clamp to max scrollable index
        var scrollableColumnIndex = Math.min(
          props.scrollToColumn - fixedColumnsCount,
          columnInfo.bodyScrollableColumns.length - 1,
        );

        // Sum width for all columns before column
        var previousColumnsWidth = 0;
        for (i = 0; i < scrollableColumnIndex; ++i) {
          column = columnInfo.bodyScrollableColumns[i];
          previousColumnsWidth += column.props.width;
        }

        // Get width of scrollable columns in viewport
        var availableScrollWidth = adjustedWidth - totalFixedColumnsWidth;

        // Get width of specified column
        var selectedColumnWidth = columnInfo.bodyScrollableColumns[
          scrollableColumnIndex
        ].props.width;

        // Must scroll at least far enough for end of column (prevColWidth + selColWidth)
        // to be in viewport (availableScrollWidth = viewport width)
        var minAcceptableScrollPosition =
          previousColumnsWidth + selectedColumnWidth - availableScrollWidth;

        // If scrolled less than minimum amount, scroll to minimum amount
        // so column on right of viewport
        if (scrollX < minAcceptableScrollPosition) {
          scrollX = minAcceptableScrollPosition;
        }

        // If scrolled more than previous columns, at least part of column will be offscreen to left
        // Scroll so column is flush with left edge of viewport
        if (scrollX > previousColumnsWidth) {
          scrollX = previousColumnsWidth;
        }
      }
    }

    var scrollContentWidth =
      FixedDataTableWidthHelper.getTotalWidth(columns);

    var horizontalScrollbarVisible = scrollContentWidth > adjustedWidth &&
      props.overflowX !== 'hidden' && props.showScrollbarX !== false;

    if (horizontalScrollbarVisible) {
      bodyHeight -= Scrollbar.SIZE;
      totalHeightNeeded += Scrollbar.SIZE;
      totalHeightReserved += Scrollbar.SIZE;
      const notAdjusted = adjustedWidth === props.width;
      maxScrollY = Math.max(0, scrollContentHeight - bodyHeight);
      if (notAdjusted && maxScrollY) {
        adjustedWidth = adjustedWidth - Scrollbar.SIZE - 1;
      }
    }

    var maxScrollX = Math.max(0, scrollContentWidth - adjustedWidth);
    scrollX = Math.min(scrollX, maxScrollX);
    scrollY = Math.min(scrollY, maxScrollY);

    if (!maxScrollY) {
      if (useMaxHeight) {
        height = totalHeightNeeded;
      }
      bodyHeight = totalHeightNeeded - totalHeightReserved;
    }

    this.scrollHelper.setViewportHeight(bodyHeight);

    var scrollTop = Math.abs(firstRowOffset - this.scrollHelper.getRowPosition(firstRowIndex));
    if (scrollTop !== scrollY) {
      scrollTop = maxScrollY;
      scrollState = this.scrollHelper.scrollTo(scrollTop);
      firstRowIndex = scrollState.index;
      firstRowOffset = scrollState.offset;
      scrollY = scrollState.position;
    }

    var cellGroupWrapperHeight = props.cellGroupWrapperHeight;
    var newState = {
      isColumnResizing: oldState && oldState.isColumnResizing,
      ...columnInfo,
      ...props,
      columns,
      columnGroups,
      columnResizingData,
      firstRowIndex,
      firstRowOffset,
      horizontalScrollbarVisible,
      maxScrollX,
      maxScrollY,
      reservedHeight: totalHeightReserved,
      scrollContentHeight,
      scrollX,
      scrollY,
      bodyHeight,
      height,
      cellGroupWrapperHeight,
      groupHeaderHeight,
      useGroupHeader,
    };

    return newState;
  }

  showScrollbarY(state) {
    return state.maxScrollY > 0 && state.overflowY !== 'hidden' && state.showScrollbarY !== false;
  }

  selectColumnElement(type, columns) {
    var newColumns = [];
    for (var i = 0; i < columns.length; ++i) {
      var column = columns[i];
      newColumns.push(React.cloneElement(
        column,
        {
          cell: type ?  column.props[type] : column.props[CELL]
        }
      ));
    }
    return newColumns;
  }

  splitColumnTypes(columns) {
    var fixedColumns = [];
    var fixedRightColumns = [];
    var scrollableColumns = [];
    for (var i = 0; i < columns.length; ++i) {
      if (columns[i].props.fixed) {
        fixedColumns.push(columns[i]);
      } else if (columns[i].props.fixedRight) {
        fixedRightColumns.push(columns[i]);
      } else {
        scrollableColumns.push(columns[i]);
      }
    }
    return {
      fixed: fixedColumns,
      fixedRight: fixedRightColumns,
      scrollable: scrollableColumns,
    };
  }

  onScroll(deltaX, deltaY) {
    if (!this.isScrolling) {
      this.didScrollStart();
    }
    var x = this.state.scrollX;
    if (Math.abs(deltaY) > Math.abs(deltaX) &&
        this.props.overflowY !== 'hidden') {
      var scrollState = this.scrollHelper.scrollBy(Math.round(deltaY));
      var onVerticalScroll = this.props.onVerticalScroll;
      if (onVerticalScroll ? onVerticalScroll(scrollState.position) : true) {
        var maxScrollY = Math.max(
          0,
          scrollState.contentHeight - this.state.bodyHeight
        );
        this.setState({
          firstRowIndex: scrollState.index,
          firstRowOffset: scrollState.offset,
          scrollY: scrollState.position,
          scrollContentHeight: scrollState.contentHeight,
          maxScrollY: maxScrollY,
        });
      }
    } else if (deltaX && this.props.overflowX !== 'hidden') {
      x += deltaX;
      x = x < 0 ? 0 : x;
      x = x > this.state.maxScrollX ? this.state.maxScrollX : x;

      var roundedX = Math.round(x);

      //NOTE (asif) This is a hacky workaround to prevent FDT from setting its internal state
      var onHorizontalScroll = this.props.onHorizontalScroll;
      if (onHorizontalScroll ? onHorizontalScroll(roundedX) : true) {
        this.setState({
          scrollX: roundedX,
        });
      }
    }

    this.didScrollStop();
  }

  onHorizontalScroll(scrollPos) {
    if (scrollPos === this.state.scrollX) {
      return;
    }

    if (!this.isScrolling) {
      this.didScrollStart();
    }

    var roundedScrollPos = Math.round(scrollPos);

    var onHorizontalScroll = this.props.onHorizontalScroll;
    if (onHorizontalScroll ? onHorizontalScroll(roundedScrollPos) : true) {
      this.setState({
        scrollX: roundedScrollPos,
      });
    }
    this.didScrollStop();
  }

  onVerticalScroll(scrollPos) {
    if (scrollPos === this.state.scrollY) {
      return;
    }

    if (!this.isScrolling) {
      this.didScrollStart();
    }
    var scrollState = this.scrollHelper.scrollTo(Math.round(scrollPos));

    var onVerticalScroll = this.props.onVerticalScroll;
    if (onVerticalScroll ? onVerticalScroll(scrollState.position) : true) {
      this.setState({
        firstRowIndex: scrollState.index,
        firstRowOffset: scrollState.offset,
        scrollY: scrollState.position,
        scrollContentHeight: scrollState.contentHeight,
      });
      this.didScrollStop();
    }
  }

  didScrollStart() {
    if (this.isScrolling) {
      return;
    }

    this.isScrolling = true;
    if (this.props.onScrollStart) {
      this.props.onScrollStart(this.state.scrollX, this.state.scrollY, this.state.firstRowIndex);
    }
  }
  didScrollStopSync() {
    if (!this.isScrolling) {
      return;
    }

    this.isScrolling = false;
    this.setState({redraw: true});
    if (this.props.onScrollEnd) {
      this.props.onScrollEnd(this.state.scrollX, this.state.scrollY, this.state.firstRowIndex);
    }
  }

  renderRows(offsetTop) {
    var state = this.state;
    var showScrollbarY = this.showScrollbarY(state);

    return (
      <FixedDataTableBufferedRows
        isScrolling={this.isScrolling}
        defaultRowHeight={state.rowHeight}
        firstRowIndex={state.firstRowIndex}
        firstRowOffset={state.firstRowOffset}
        fixedColumns={state.bodyFixedColumns}
        fixedRightColumns={state.bodyFixedRightColumns}
        height={state.bodyHeight}
        offsetTop={offsetTop}
        onRowClick={state.onRowClick}
        onRowDoubleClick={state.onRowDoubleClick}
        onRowContextMenu={state.onRowContextMenu}
        onRowMouseDown={state.onRowMouseDown}
        onRowMouseUp={state.onRowMouseUp}
        onRowMouseEnter={state.onRowMouseEnter}
        onRowMouseLeave={state.onRowMouseLeave}
        onRowTouchStart={state.touchScrollEnabled ? state.onRowTouchStart : null}
        onRowTouchEnd={state.touchScrollEnabled ? state.onRowTouchEnd : null}
        onRowTouchMove={state.touchScrollEnabled ? state.onRowTouchMove : null}
        rowClassNameGetter={state.rowClassNameGetter}
        rowsCount={state.rowsCount}
        rowGetter={state.rowGetter}
        rowHeightGetter={state.rowHeightGetter}
        subRowHeight={state.subRowHeight}
        subRowHeightGetter={state.subRowHeightGetter}
        rowExpanded={state.rowExpanded}
        rowKeyGetter={state.rowKeyGetter}
        scrollLeft={state.scrollX}
        scrollableColumns={state.bodyScrollableColumns}
        showLastRowBorder={true}
        width={state.width}
        rowPositionGetter={this.scrollHelper.getRowPosition}
        bufferRowCount={this.state.bufferRowCount}
        showScrollbarY={showScrollbarY}
      />
    );
  }

  render() {
    var state = this.state;
    var props = this.props;

    var onColumnReorder = props.onColumnReorderEndCallback ? this.onColumnReorder : null;
    var maxScrollY = this.state.maxScrollY;
    var showScrollbarX = state.maxScrollX > 0 && state.overflowX !== 'hidden' && state.showScrollbarX !== false;
    var showScrollbarY = this.showScrollbarY(state);

    var groupHeader;
    if (state.useGroupHeader) {
      groupHeader = (
        <FixedDataTableRow
          key="group_header"
          isScrolling={this.isScrolling}
          className={joinClasses(
            cx(`${styles.fixedDataTableLayoutHeader}`),
            cx(`${styles.publicFixedDataTableHeader}`),
          )}
          width={state.width}
          height={state.groupHeaderHeight}
          cellGroupWrapperHeight={state.cellGroupWrapperHeight}
          index={0}
          zIndex={1}
          offsetTop={0}
          scrollLeft={state.scrollX}
          fixedColumns={state.groupHeaderFixedColumns}
          fixedRightColumns={state.groupHeaderFixedRightColumns}
          scrollableColumns={state.groupHeaderScrollableColumns}
          onColumnResize={this.onColumnResize}
          onColumnReorder={onColumnReorder}
          onColumnReorderMove={this.onColumnReorderMove}
          showScrollbarY={showScrollbarY}
        />
      );
    }

    var scrollbarXHeight = showScrollbarX ? Scrollbar.SIZE : 0;
    var scrollbarYHeight = state.height - scrollbarXHeight -
        (2 * BORDER_HEIGHT) - state.footerHeight;

    var headerOffsetTop = state.useGroupHeader ? state.groupHeaderHeight : 0;
    var bodyOffsetTop = headerOffsetTop + state.headerHeight;
    scrollbarYHeight -= bodyOffsetTop;
    var bottomSectionOffset = 0;
    var footOffsetTop = props.maxHeight != null
      ? bodyOffsetTop + state.bodyHeight
      : bodyOffsetTop + scrollbarYHeight;
    var rowsContainerHeight = footOffsetTop + state.footerHeight;

    if (props.ownerHeight !== undefined && props.ownerHeight < state.height) {
      bottomSectionOffset = props.ownerHeight - state.height;

      footOffsetTop = Math.min(
        footOffsetTop,
        props.ownerHeight - state.footerHeight - scrollbarXHeight
      );

      scrollbarYHeight = Math.max(0, footOffsetTop - bodyOffsetTop);
    }
    this.scrollbarYHeight = scrollbarYHeight;

    var verticalScrollbar;
    if (showScrollbarY) {
      verticalScrollbar =
        <Scrollbar
          size={scrollbarYHeight}
          contentSize={scrollbarYHeight + maxScrollY}
          onScroll={this.onVerticalScroll}
          verticalTop={bodyOffsetTop}
          position={state.scrollY}
          touchEnabled={state.touchScrollEnabled}
        />;
    }

    var horizontalScrollbar;
    if (showScrollbarX) {
      var scrollbarXWidth = state.width;
      horizontalScrollbar =
        <HorizontalScrollbar
          contentSize={scrollbarXWidth + state.maxScrollX}
          offset={bottomSectionOffset}
          onScroll={this.onHorizontalScroll}
          position={state.scrollX}
          size={scrollbarXWidth}
          touchEnabled={state.touchScrollEnabled}
        />;
    }

    var dragKnob =
      <FixedDataTableColumnResizeHandle
        height={state.height}
        initialWidth={state.columnResizingData.width || 0}
        minWidth={state.columnResizingData.minWidth || 0}
        maxWidth={state.columnResizingData.maxWidth || Number.MAX_VALUE}
        visible={!!state.isColumnResizing}
        leftOffset={state.columnResizingData.left || 0}
        knobHeight={state.headerHeight}
        initialEvent={state.columnResizingData.initialEvent}
        onColumnResizeEnd={props.onColumnResizeEndCallback}
        columnKey={state.columnResizingData.key}
        touchEnabled={state.touchScrollEnabled}
      />;

    var footer = null;
    if (state.footerHeight) {
      footer =
        <FixedDataTableRow
          key="footer"
          isScrolling={this.isScrolling}
          className={joinClasses(
            cx(`${styles.fixedDataTableLayoutFooter}`),
            cx(`${styles.publicFixedDataTableFooter}`),
          )}
          width={state.width}
          height={state.footerHeight}
          index={-1}
          zIndex={1}
          offsetTop={footOffsetTop}
          fixedColumns={state.footFixedColumns}
          fixedRightColumns={state.footFixedRightColumns}
          scrollableColumns={state.footScrollableColumns}
          scrollLeft={state.scrollX}
          showScrollbarY={showScrollbarY}
        />;
    }

    var rows = this.renderRows(bodyOffsetTop);

    var header =
      <FixedDataTableRow
        key="header"
        isScrolling={this.isScrolling}
        className={joinClasses(
          cx(`${styles.fixedDataTableLayoutHeader}`),
          cx(`${styles.publicFixedDataTableHeader}`),
        )}
        width={state.width}
        height={state.headerHeight}
        cellGroupWrapperHeight={state.cellGroupWrapperHeight}
        index={-1}
        zIndex={1}
        offsetTop={headerOffsetTop}
        scrollLeft={state.scrollX}
        fixedColumns={state.headFixedColumns}
        fixedRightColumns={state.headFixedRightColumns}
        scrollableColumns={state.headScrollableColumns}
        touchEnabled={state.touchScrollEnabled}
        onColumnResize={this.onColumnResize}
        onColumnReorder={onColumnReorder}
        onColumnReorderMove={this.onColumnReorderMove}
        onColumnReorderEnd={this.onColumnReorderEnd}
        isColumnReordering={!!state.isColumnReordering}
        columnReorderingData={state.columnReorderingData}
        showScrollbarY={showScrollbarY}
      />;

    var topShadow;
    var bottomShadow;
    if (state.scrollY) {
      topShadow =
        <div
          className={joinClasses(
            cx(`${styles.fixedDataTableLayoutTopShadow}`),
            cx(`${styles.publicFixedDataTableTopShadow}`),
          )}
          style={{top: bodyOffsetTop}}
        />;
    }

    if (
      (state.ownerHeight != null &&
        state.ownerHeight < state.height &&
        state.scrollContentHeight + state.reservedHeight > state.ownerHeight) ||
      state.scrollY < maxScrollY
    ) {
      bottomShadow =
        <div
          className={joinClasses(
            cx('fixedDataTableLayoutBottomShadow'),
            cx('publicFixedDataTableBottomShadow'),
          )}
          style={{top: footOffsetTop}}
        />;
    }
    var tabIndex = null
    if (this.props.keyboardPageEnabled || this.props.keyboardScrollEnabled) {
      tabIndex = 0
    }
    return (
      <div
        className={joinClasses(
          this.state.className,
          cx('fixedDataTableLayoutMain'),
          cx('publicFixedDataTableMain'),
        )}
        tabIndex={tabIndex}
        onKeyDown={this.onKeyDown}
        onWheel={this.wheelHandler.onWheel}
        onTouchStart={this.touchHandler.onTouchStart}
        onTouchEnd={this.touchHandler.onTouchEnd}
        onTouchMove={this.touchHandler.onTouchMove}
        onTouchCancel={this.touchHandler.onTouchCancel}
        ref={this.onRef}
        style={{height: state.height, width: state.width}}>
        <div
          className={cx('fixedDataTableLayoutRowsContainer')}
          style={{height: rowsContainerHeight, width: state.width}}>
          {dragKnob}
          {groupHeader}
          {header}
          {rows}
          {footer}
          {topShadow}
          {bottomShadow}
        </div>
        {verticalScrollbar}
        {horizontalScrollbar}
      </div>
    );
  }

}

class HorizontalScrollbar extends React.Component {

  static propTypes = {
    contentSize: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    onScroll: PropTypes.func.isRequired,
    position: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
  }

  componentWillMount() {
    this.initialRender = true;
  }

  componentDidMount() {
    this.initialRender = false;
  }

  render() {
    var outerContainerStyle = {
      height: Scrollbar.SIZE,
      width: this.props.size,
    };
    var innerContainerStyle = {
      height: Scrollbar.SIZE,
      position: 'absolute',
      overflow: 'hidden',
      width: this.props.size,
    };
    FixedDataTableTranslateDOMPosition(
      innerContainerStyle,
      0,
      this.props.offset,
      this.initialRender,
    );

    return (
      <div
        className={joinClasses(
          cx('fixedDataTableLayoutHorizontalScrollbar'),
          cx('publicFixedDataTableHorizontalScrollbar'),
        )}
        style={outerContainerStyle}>
        <div style={innerContainerStyle}>
          <Scrollbar
            {...this.props}
            isOpaque={true}
            orientation="horizontal"
            offset={undefined}
          />
        </div>
      </div>
    );
  }
}

export default  FixedDataTable;