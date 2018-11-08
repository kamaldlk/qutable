
import React from 'react';
import PropTypes from 'prop-types';
import FixedDataTableCell from './data.table.cell';
import {FixedDataTableHelper} from './data.table.helper';
import {cx} from './vendor/core/cx';
import {FixedDataTableTranslateDOMPosition} from './data.table.translate.dom.position';

var DIR_SIGN = FixedDataTableHelper.DIR_SIGN;

class FixedDataTableCellGroupImpl extends React.Component{
  static propTypes_DISABLED_FOR_PERFORMANCE=  {
    columns: PropTypes.array.isRequired,
    isScrolling: PropTypes.bool,
    left: PropTypes.number,
    onColumnResize: PropTypes.func,
    onColumnReorder: PropTypes.func,
    onColumnReorderMove: PropTypes.func,
    onColumnReorderEnd: PropTypes.func,
    height: PropTypes.number.isRequired,
    cellGroupWrapperHeight: PropTypes.number,
    rowHeight: PropTypes.number.isRequired,
    rowIndex: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    zIndex: PropTypes.number.isRequired,
    touchEnabled: PropTypes.bool
  }

  constructor(props){
    super(props)
    this.renderCell = this.renderCell.bind(this);
    this.getColumnsWidth = this.getColumnsWidth.bind(this);
  }

  componentWillMount() {
    this.initialRender = true;
  }

  componentDidMount() {
    this.initialRender = false;
  }

  render(){
    var props = this.props;
    var columns = props.columns;
    var cells = new Array(columns.length);

    var contentWidth = this.getColumnsWidth(columns);

    var isColumnReordering = props.isColumnReordering && columns.reduce(function (acc, column) {
      return acc || props.columnReorderingData.columnKey === column.props.columnKey;
    }, false);

    var currentPosition = 0;
    for (var i = 0, j = columns.length; i < j; i++) {
      var columnProps = columns[i].props;
      var recycable = columnProps.allowCellsRecycling && !isColumnReordering;
      if (!recycable || (
            currentPosition - props.left <= props.width &&
            currentPosition - props.left + columnProps.width >= 0)) {
        var key = columnProps.columnKey || 'cell_' + i;
        cells[i] = this.renderCell(
          props.rowIndex,
          props.rowHeight,
          columnProps,
          currentPosition,
          key,
          contentWidth,
          isColumnReordering
        );
      }
      currentPosition += columnProps.width;
    }
    var style = {
      height: props.height,
      position: 'absolute',
      width: contentWidth,
      zIndex: props.zIndex,
    };
    FixedDataTableTranslateDOMPosition(style, -1 * DIR_SIGN * props.left, 0, this.initialRender);

    return (
      <div
        className={cx('fixedDataTableCellGroupLayoutCellGroup')}
        style={style}>
        {cells}
      </div>
    );
  }

  renderCell(
   rowIndex,
   height,
   columnProps,
   left,
   key,
   columnGroupWidth,
   isColumnReordering,
  ){

    var cellIsResizable = columnProps.isResizable &&
      this.props.onColumnResize;
    var onColumnResize = cellIsResizable ? this.props.onColumnResize : null;

    var cellIsReorderable = columnProps.isReorderable && this.props.onColumnReorder && rowIndex === -1 && columnGroupWidth !== columnProps.width;
    var onColumnReorder = cellIsReorderable ? this.props.onColumnReorder : null;

    var className = columnProps.cellClassName;
    var pureRendering = columnProps.pureRendering || false;

    return (
      <FixedDataTableCell
        isScrolling={this.props.isScrolling}
        align={columnProps.align}
        className={className}
        height={height}
        key={key}
        maxWidth={columnProps.maxWidth}
        minWidth={columnProps.minWidth}
        touchEnabled={this.props.touchEnabled}
        onColumnResize={onColumnResize}
        onColumnReorder={onColumnReorder}
        onColumnReorderMove={this.props.onColumnReorderMove}
        onColumnReorderEnd={this.props.onColumnReorderEnd}
        isColumnReordering={isColumnReordering}
        columnReorderingData={this.props.columnReorderingData}
        rowIndex={rowIndex}
        columnKey={columnProps.columnKey}
        width={columnProps.width}
        left={left}
        cell={columnProps.cell}
        columnGroupWidth={columnGroupWidth}
        pureRendering={pureRendering}
      />
    );
  }

  getColumnsWidth(columns){
    var width = 0;
    for (var i = 0; i < columns.length; ++i) {
      width += columns[i].props.width;
    }
    return width;
  }
}

class FixedDataTableCellGroup extends React.Component {
  static propTypes_DISABLED_FOR_PERFORMANCE = {
    isScrolling: PropTypes.bool,
    height: PropTypes.number.isRequired,
    offsetLeft: PropTypes.number,
    left: PropTypes.number,
    zIndex: PropTypes.number.isRequired,
  }

  static defaultProps = {
    left: 0,
    offsetLeft: 0,
  }

  shouldComponentUpdate(nextProps){
    return (
      !nextProps.isScrolling ||
      this.props.rowIndex !== nextProps.rowIndex ||
      this.props.left !== nextProps.left
    );
  }

  render(){
    var {offsetLeft, ...props} = this.props;

    var style = {
      height: props.cellGroupWrapperHeight || props.height,
      width: props.width
    };

    if (DIR_SIGN === 1) {
      style.left = offsetLeft;
    } else {
      style.right = offsetLeft;
    }

    var onColumnResize = props.onColumnResize ? this.onColumnResize : null;

    return (
      <div
        style={style}
        className={cx('fixedDataTableCellGroupLayoutCellGroupWrapper')}>
        <FixedDataTableCellGroupImpl
          {...props}
          onColumnResize={onColumnResize}
        />
      </div>
    );
  }

  onColumnResize(
   left,
   width,
   minWidth,
   maxWidth,
   columnKey,
   event
  ) {
    this.props.onColumnResize && this.props.onColumnResize(
      this.props.offsetLeft,
      left - this.props.left + width,
      width,
      minWidth,
      maxWidth,
      columnKey,
      event
    );
  }
}


export default FixedDataTableCellGroup;
