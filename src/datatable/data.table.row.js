import React from 'react';
import PropTypes from 'prop-types';
import FixedDataTableCellGroup from './data.table.cell.group';
import Scrollbar from './scrollbar';

import {cx} from './vendor/core/cx';
import {joinClasses} from './vendor/core/joinclasses';
import {FixedDataTableTranslateDOMPosition} from './data.table.translate.dom.position';
var HEADER_BORDER_BOTTOM_WIDTH = 1;
class FixedDataTableRowImpl extends React.Component {

  mouseLeaveIndex = null;

  static propTypes = {
    isScrolling: PropTypes.bool,
    fixedColumns: PropTypes.array.isRequired,
    fixedRightColumns: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    cellGroupWrapperHeight: PropTypes.number,
    subRowHeight: PropTypes.number,
    rowExpanded: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    index: PropTypes.number.isRequired,
    scrollableColumns: PropTypes.array.isRequired,
    scrollLeft: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onContextMenu: PropTypes.func,
    onColumnResize: PropTypes.func,
    isColumnReordering: PropTypes.bool,
    onColumnReorder: PropTypes.func,
    onColumnReorderMove: PropTypes.func,
    onColumnReorderEnd: PropTypes.func,
    touchEnabled: PropTypes.bool,
  };

  constructor(props){
    super(props)
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderColumnsRightShadow = this.renderColumnsRightShadow.bind(this);
    this.renderFixedRightColumnsShadow = this.renderFixedRightColumnsShadow.bind(this);
    this.renderColumnsLeftShadow = this.renderColumnsLeftShadow.bind(this);
    this.getRowExpanded = this.getRowExpanded.bind(this);
    this.getColumnsWidth = this.getColumnsWidth.bind(this);
  }


  render() {
    var subRowHeight = this.props.subRowHeight || 0;
    var style = {
      width: this.props.width,
      height: this.props.height + subRowHeight,
    };
    var className = cx({
      'fixedDataTableRowLayoutMain': true,
      'publicFixedDataTableRowMain': true,
      'publicFixedDataTableRowHighlighted': (this.props.index % 2 === 1),
      'publicFixedDataTableRowOdd': (this.props.index % 2 === 1),
      'publicFixedDataTableRowEven': (this.props.index % 2 === 0),
    });
    var fixedColumnsWidth = this.getColumnsWidth(this.props.fixedColumns);
    var fixedColumns =
      <FixedDataTableCellGroup
        key="fixed_cells"
        isScrolling={this.props.isScrolling}
        height={this.props.height}
        cellGroupWrapperHeight={this.props.cellGroupWrapperHeight}
        left={0}
        width={fixedColumnsWidth}
        zIndex={2}
        columns={this.props.fixedColumns}
        touchEnabled={this.props.touchEnabled}
        onColumnResize={this.props.onColumnResize}
        onColumnReorder={this.props.onColumnReorder}
        onColumnReorderMove={this.props.onColumnReorderMove}
        onColumnReorderEnd={this.props.onColumnReorderEnd}
        isColumnReordering={this.props.isColumnReordering}
        columnReorderingData={this.props.columnReorderingData}
        rowHeight={this.props.height}
        rowIndex={this.props.index}
      />;
    var columnsLeftShadow = this.renderColumnsLeftShadow(fixedColumnsWidth);
    var fixedRightColumnsWidth = this.getColumnsWidth(this.props.fixedRightColumns);
    var scrollbarOffset = this.props.showScrollbarY ? Scrollbar.SIZE : 0;
    var fixedRightColumns =
      <FixedDataTableCellGroup
        key="fixed_right_cells"
        isScrolling={this.props.isScrolling}
        height={this.props.height}
        cellGroupWrapperHeight={this.props.cellGroupWrapperHeight}
        offsetLeft={this.props.width - fixedRightColumnsWidth - scrollbarOffset}
        width={fixedRightColumnsWidth}
        zIndex={2}
        columns={this.props.fixedRightColumns}
        touchEnabled={this.props.touchEnabled}
        onColumnResize={this.props.onColumnResize}
        onColumnReorder={this.props.onColumnReorder}
        onColumnReorderMove={this.props.onColumnReorderMove}
        onColumnReorderEnd={this.props.onColumnReorderEnd}
        isColumnReordering={this.props.isColumnReordering}
        columnReorderingData={this.props.columnReorderingData}
        rowHeight={this.props.height}
        rowIndex={this.props.index}
      />;
    var fixedRightColumnsShadow = fixedRightColumnsWidth ?
      this.renderFixedRightColumnsShadow(this.props.width - fixedRightColumnsWidth - scrollbarOffset - 5) : null;
    var scrollableColumns =
      <FixedDataTableCellGroup
        key="scrollable_cells"
        isScrolling={this.props.isScrolling}
        height={this.props.height}
        cellGroupWrapperHeight={this.props.cellGroupWrapperHeight}
        align="right"
        left={this.props.scrollLeft}
        offsetLeft={fixedColumnsWidth}
        width={this.props.width - fixedColumnsWidth - fixedRightColumnsWidth - scrollbarOffset}
        zIndex={0}
        columns={this.props.scrollableColumns}
        touchEnabled={this.props.touchEnabled}
        onColumnResize={this.props.onColumnResize}
        onColumnReorder={this.props.onColumnReorder}
        onColumnReorderMove={this.props.onColumnReorderMove}
        onColumnReorderEnd={this.props.onColumnReorderEnd}
        isColumnReordering={this.props.isColumnReordering}
        columnReorderingData={this.props.columnReorderingData}
        rowHeight={this.props.height}
        rowIndex={this.props.index}
      />;
    var scrollableColumnsWidth = this.getColumnsWidth(this.props.scrollableColumns);
    var columnsRightShadow = this.renderColumnsRightShadow(fixedColumnsWidth + scrollableColumnsWidth);
    var rowExpanded = this.getRowExpanded(subRowHeight);
    var rowExpandedStyle = {
      height: subRowHeight,
      top: this.props.height,
      width: this.props.width,
    };

    var scrollbarSpacer;
    if (this.props.showScrollbarY) {
      var spacerStyles = {
        width: scrollbarOffset,
        height: this.props.height,
        left: this.props.width - scrollbarOffset,
      };
      scrollbarSpacer =
        <div
          style={spacerStyles}
          className={cx('publicFixedDataTableScrollbarSpacer')}
        />;
    }

    return (
      <div
        className={joinClasses(className, this.props.className)}
        onClick={this.props.onClick ? this.onClick : null}
        onDoubleClick={this.props.onDoubleClick ? this.onDoubleClick : null}
        onContextMenu={this.props.onContextMenu ? this.onContextMenu : null}
        onMouseDown={this.props.onMouseDown ? this.onMouseDown : null}
        onMouseUp={this.props.onMouseUp ? this.onMouseUp : null}
        onMouseEnter={this.props.onMouseEnter || this.props.onMouseLeave ? this.onMouseEnter : null}
        onMouseLeave={this.props.onMouseLeave ? this.onMouseLeave : null}
        onTouchStart={this.props.onTouchStart ? this.onTouchStart : null}
        onTouchEnd={this.props.onTouchEnd ? this.onTouchEnd : null}
        onTouchMove={this.props.onTouchMove ? this.onTouchMove : null}
        style={style}>
        <div className={cx('fixedDataTableRowLayoutBody')}>
          {fixedColumns}
          {scrollableColumns}
          {columnsLeftShadow}
          {fixedRightColumns}
          {fixedRightColumnsShadow}
          {scrollbarSpacer}
        </div>
        {rowExpanded && <div
          className={cx('fixedDataTableRowLayoutRowExpanded')}
          style={rowExpandedStyle}>
          {rowExpanded}
        </div>}
        {columnsRightShadow}
      </div>
    );
  }

  getColumnsWidth = (columns) => {
    var width = 0;
    for (var i = 0; i < columns.length; ++i) {
      width += columns[i].props.width;
    }
    return width;
  };

  getRowExpanded = (subRowHeight) => {
    if (this.props.rowExpanded) {
      var rowExpandedProps = {
        rowIndex: this.props.index,
        height: subRowHeight,
        width: this.props.width,
      };

      var rowExpanded;
      if (React.isValidElement(this.props.rowExpanded)) {
        rowExpanded = React.cloneElement(this.props.rowExpanded, rowExpandedProps);
      } else if (typeof this.props.rowExpanded === 'function') {
        rowExpanded = this.props.rowExpanded(rowExpandedProps);
      }

      return rowExpanded;
    }
  }

  renderColumnsLeftShadow = (left) => {
    var className = cx({
      'fixedDataTableRowLayoutFixedColumnsDivider': left > 0,
      'fixedDataTableRowLayoutColumnsShadow': this.props.scrollLeft > 0,
      'publicFixedDataTableRowFixedColumnsDivider': left > 0,
      'publicFixedDataTableRowColumnsShadow': this.props.scrollLeft > 0,
     });
     var dividerHeight = this.props.cellGroupWrapperHeight ?
       this.props.cellGroupWrapperHeight - HEADER_BORDER_BOTTOM_WIDTH : this.props.height;
     var style = {
       left: left,
       height: dividerHeight
     };
     return <div className={className} style={style} />;
  };

  renderFixedRightColumnsShadow = (left) => {
    var className = cx(
      'fixedDataTableRowLayoutColumnsShadow',
      'fixedDataTableRowLayoutColumnsRightShadow',
      'fixedDataTableRowLayoutFixedColumnsDivider',
      'publicFixedDataTableRowColumnsShadow',
      'publicFixedDataTableRowColumnsRightShadow',
      'publicFixedDataTableRowFixedColumnsDivider'
    );
    var style = {
      height: this.props.height,
      left: left
    };
    return <div className={className} style={style} />;
  };

  renderColumnsRightShadow = (totalWidth) => {
    if (Math.ceil(this.props.scrollLeft + this.props.width) < Math.floor(totalWidth)) {
      var className = cx(
        'fixedDataTableRowLayoutColumnsShadow',
        'fixedDataTableRowLayoutColumnsRightShadow',
        'publicFixedDataTableRowColumnsShadow',
        'publicFixedDataTableRowColumnsRightShadow'
      );
      var style = {
        height: this.props.height
      };
      return <div className={className} style={style} />;
    }
  };

  onClick = (event) => {
    this.props.onClick(event, this.props.index);
  };

  onDoubleClick = (event) => {
    this.props.onDoubleClick(event, this.props.index);
  };

  onContextMenu = (event) => {
    this.props.onContextMenu(event, this.props.index)
  };

  onMouseUp = (event) => {
    this.props.onMouseUp(event, this.props.index);
  };

  onMouseDown = (event) => {
    this.props.onMouseDown(event, this.props.index);
  };

  onMouseEnter = (event) => {
    /**
     * This is necessary so that onMouseLeave is fired with the initial
     * row index since this row could be updated with a different index
     * when scrolling.
     */
    this.mouseLeaveIndex = this.props.index;
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(event, this.props.index);
    }
  };

  onMouseLeave = (event) => {
    if(this.mouseLeaveIndex === null) {
      this.mouseLeaveIndex = this.props.index;
    }
    this.props.onMouseLeave(event, this.mouseLeaveIndex);
    this.mouseLeaveIndex = null;
  };

  onTouchStart = (event) => {
    this.props.onTouchStart(event, this.props.index);
  };

  onTouchEnd = (event) => {
    this.props.onTouchEnd(event, this.props.index);
  };

  onTouchMove = (event) => {
    this.props.onTouchMove(event, this.props.index);
  };
}

class FixedDataTableRow extends React.Component {
  static propTypes = {
    isScrolling: PropTypes.bool,
    height: PropTypes.number.isRequired,
    zIndex: PropTypes.number,
    offsetTop: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  componentWillMount() {
    this.initialRender = true;
  }

  componentDidMount() {
    this.initialRender = false;
  }

  render() {
    var style = {
      width: this.props.width,
      height: this.props.height,
      zIndex: (this.props.zIndex ? this.props.zIndex : 0),
    };
    FixedDataTableTranslateDOMPosition(style, 0, this.props.offsetTop, this.initialRender);

    return (
      <div
        style={style}
        className={cx('fixedDataTableRowLayoutRowWrapper')}>
        <FixedDataTableRowImpl
          {...this.props}
          offsetTop={undefined}
          zIndex={undefined}
        />
      </div>
    );
  }
}


export  {FixedDataTableRow};
