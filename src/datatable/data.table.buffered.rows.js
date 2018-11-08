import React from 'react';
import PropTypes from 'prop-types';

import {FixedDataTableRow} from './data.table.row';
import {FixedDataTableRowBuffer} from './data.table.row.buffer';
import {cx} from './vendor/core/cx';
import {emptyFunction} from './vendor/core/emptyfunction';
import {joinClasses} from './vendor/core/joinclasses';

class FixedDataTableBufferedRows extends React.Component {
  static propTypes = {
    bufferRowCount: PropTypes.number,
    isScrolling: PropTypes.bool,
    defaultRowHeight: PropTypes.number.isRequired,
    firstRowIndex: PropTypes.number.isRequired,
    firstRowOffset: PropTypes.number.isRequired,
    fixedColumns: PropTypes.array.isRequired,
    fixedRightColumns: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    offsetTop: PropTypes.number.isRequired,
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
    rowClassNameGetter: PropTypes.func,
    rowsCount: PropTypes.number.isRequired,
    rowHeightGetter: PropTypes.func,
    subRowHeight: PropTypes.number,
    subRowHeightGetter: PropTypes.func,
    rowExpanded: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    rowKeyGetter: PropTypes.func,
    rowPositionGetter: PropTypes.func.isRequired,
    scrollLeft: PropTypes.number.isRequired,
    scrollableColumns: PropTypes.array.isRequired,
    showLastRowBorder: PropTypes.bool,
    width: PropTypes.number.isRequired,
  }

  constructor(props){
    super(props)
    this.getRowHeight = this.getRowHeight.bind(this);
    this.updateBuffer = this.updateBuffer.bind(this);
    this.getSubRowHeight = this.getSubRowHeight.bind(this);
    this.rowBuffer =
      new FixedDataTableRowBuffer(
        this.props.rowsCount,
        this.props.defaultRowHeight,
        this.props.height,
        this.getRowHeight,
        this.props.bufferRowCount
      );
    this.state ={
      rowsToRender: this.rowBuffer.getRows(
        this.props.firstRowIndex,
        this.props.firstRowOffset)
    }
  }

  componentWillMount() {
    this.staticRowArray = [];
    this.initialRender = true;
  }

  componentDidMount() {
    setTimeout(this.updateBuffer, 1000);
    this.initialRender = false;
  }

  componentWillReceiveProps( nextProps) {
    if (nextProps.rowsCount !== this.props.rowsCount ||
        nextProps.defaultRowHeight !== this.props.defaultRowHeight ||
        nextProps.height !== this.props.height) {
      this.rowBuffer =
        new FixedDataTableRowBuffer(
          nextProps.rowsCount,
          nextProps.defaultRowHeight,
          nextProps.height,
          this.getRowHeight,
          this.props.bufferRowCount
        );
    }
    if (this.props.isScrolling && !nextProps.isScrolling) {
      this.updateBuffer();
    } else {
      this.setState({
        rowsToRender: this.rowBuffer.getRows(
          nextProps.firstRowIndex,
          nextProps.firstRowOffset
        ),
      });
    }
  }

  updateBuffer() {
    if (this.rowBuffer) {
      this.setState({
        rowsToRender: this.rowBuffer.getRowsWithUpdatedBuffer(),
      });
    }
  }

  shouldComponentUpdate(){
    // Don't add PureRenderMixin to this component please.
    return true;
  }

  componentWillUnmount() {
    this.rowBuffer = null;
    this.staticRowArray.length = 0;
  }

  render()  {
    var props = this.props;
    var rowClassNameGetter = props.rowClassNameGetter || emptyFunction;
    var rowPositionGetter = props.rowPositionGetter;

    var rowsToRender = this.state.rowsToRender || [];

    //Sort the rows, we slice first to avoid changing original
    var sortedRowsToRender = rowsToRender.slice().sort((a, b) => a - b);
    var rowPositions = {};

    //Row position calculation requires that rows are calculated in order
    sortedRowsToRender.forEach((rowIndex) => {
      rowPositions[rowIndex] = rowPositionGetter(rowIndex);
    });

    this.staticRowArray.length = rowsToRender.length;

    var baseOffsetTop = props.firstRowOffset - props.rowPositionGetter(props.firstRowIndex) + props.offsetTop;

    for (var i = 0; i < rowsToRender.length; ++i) {
      var rowIndex = rowsToRender[i];
      var currentRowHeight = this.getRowHeight(rowIndex);
      var currentSubRowHeight = this.getSubRowHeight(rowIndex);
      var rowOffsetTop = baseOffsetTop + rowPositions[rowIndex];
      var rowKey = props.rowKeyGetter ? props.rowKeyGetter(rowIndex) : i;

      var hasBottomBorder =
        rowIndex === props.rowsCount - 1 && props.showLastRowBorder;

      this.staticRowArray[i] =
        <FixedDataTableRow
          key={rowKey}
          isScrolling={props.isScrolling}
          index={rowIndex}
          width={props.width}
          height={currentRowHeight}
          subRowHeight={currentSubRowHeight}
          rowExpanded={props.rowExpanded}
          scrollLeft={Math.round(props.scrollLeft)}
          offsetTop={Math.round(rowOffsetTop)}
          fixedColumns={props.fixedColumns}
          fixedRightColumns={props.fixedRightColumns}
          scrollableColumns={props.scrollableColumns}
          onClick={props.onRowClick}
          onDoubleClick={props.onRowDoubleClick}
          onContextMenu={props.onRowContextMenu}
          onMouseDown={props.onRowMouseDown}
          onMouseUp={props.onRowMouseUp}
          onMouseEnter={props.onRowMouseEnter}
          onMouseLeave={props.onRowMouseLeave}
          onTouchStart={props.onRowTouchStart}
          onTouchEnd={props.onRowTouchEnd}
          onTouchMove={props.onRowTouchMove}
          showScrollbarY={props.showScrollbarY}
          className={joinClasses(
            rowClassNameGetter(rowIndex),
            cx('publicFixedDataTableBodyRow'),
            cx({
              'fixedDataTableLayoutHasBottomBorder': hasBottomBorder,
              'publicFixedDataTableHasBottomBorder': hasBottomBorder,
            })
          )}
        />;
    }

    return <div>{this.staticRowArray}</div>;
  }

  getRowHeight(index){
    return this.props.rowHeightGetter ?
      this.props.rowHeightGetter(index) :
      this.props.defaultRowHeight;
  }

  getSubRowHeight(index) {
    return this.props.subRowHeightGetter ?
      this.props.subRowHeightGetter(index) :
      this.props.subRowHeight;
  }
}

export default FixedDataTableBufferedRows;
