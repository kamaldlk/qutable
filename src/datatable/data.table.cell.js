
import React from 'react';
import PropTypes from 'prop-types';
import FixedDataTableCellDefault from './data.table.cell.default';
import FixedDataTableColumnReorderHandle from './data.table.column.reorder.handle';
import {FixedDataTableHelper} from './data.table.helper';
import {cx} from './vendor/core/cx';
import {joinClasses} from './vendor/core/joinclasses';
import {shallowEqual} from './vendor/core/shallowequal';

var DIR_SIGN = FixedDataTableHelper.DIR_SIGN;

class FixedDataTableCell extends React.Component {
  static propTypes_DISABLED_FOR_PERFORMANCE = {
    isScrolling: PropTypes.bool,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    className: PropTypes.string,
    highlighted: PropTypes.bool,
    width: PropTypes.number.isRequired,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    height: PropTypes.number.isRequired,
    cell: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.func,
    ]),
    columnKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    rowIndex: PropTypes.number.isRequired,
    onColumnResize: PropTypes.func,
    onColumnReorder: PropTypes.func,
    left: PropTypes.number,
    pureRendering: PropTypes.bool,
    touchEnabled: PropTypes.bool
  }

  static defaultProps = {
    align: 'left',
    highlighted: false,
  }

  constructor(props){
    super(props)
    this.state ={
      isReorderingThisColumn: false,
      displacement: 0,
      reorderingDisplacement: 0
    }
    this.onColumnResizerMouseDown = this.onColumnResizerMouseDown.bind(this);
    this.onColumnReorderMouseDown = this.onColumnReorderMouseDown.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isScrolling && this.props.rowIndex === nextProps.rowIndex) {
      return false;
    }

    //Performance check not enabled
    if (!nextProps.pureRendering) {
      return true;
    }

    const { cell: oldCell, isScrolling: oldIsScrolling, ...oldProps } = this.props;
    const { cell: newCell, isScrolling: newIsScrolling, ...newProps } = nextProps;

    if (!shallowEqual(oldProps, newProps)) {
      return true;
    }

    if (!oldCell || !newCell || oldCell.type !== newCell.type) {
      return true;
    }

    if (!shallowEqual(oldCell.props, newCell.props)) {
      return true;
    }

    return false;
  }

  componentWillReceiveProps(props) {
    var left = props.left + this.state.displacement;

    var newState = {
      isReorderingThisColumn: false
    };

    if (props.isColumnReordering) {
      var originalLeft = props.columnReorderingData.originalLeft;
      var reorderCellLeft = originalLeft + props.columnReorderingData.dragDistance;
      var farthestPossiblePoint = props.columnGroupWidth - props.columnReorderingData.columnWidth;

      // ensure the cell isn't being dragged out of the column group
      reorderCellLeft = Math.max(reorderCellLeft, 0);
      reorderCellLeft = Math.min(reorderCellLeft, farthestPossiblePoint);

      if (props.columnKey === props.columnReorderingData.columnKey) {
        newState.displacement = reorderCellLeft - props.left;
        newState.isReorderingThisColumn = true;

      } else {
        var reorderCellRight = reorderCellLeft + props.columnReorderingData.columnWidth;
        var reorderCellCenter = reorderCellLeft + (props.columnReorderingData.columnWidth / 2);
        var centerOfThisColumn = left + (props.width / 2);

        var cellIsBeforeOneBeingDragged = reorderCellCenter > centerOfThisColumn;
        var cellWasOriginallyBeforeOneBeingDragged = originalLeft > props.left;
        var changedPosition = false;


        //var dragPoint, thisCellPoint;
        if (cellIsBeforeOneBeingDragged) {
          if (reorderCellLeft < centerOfThisColumn) {
            changedPosition = true;
            if (cellWasOriginallyBeforeOneBeingDragged) {
              newState.displacement = props.columnReorderingData.columnWidth;
            } else {
              newState.displacement = 0;
            }
          }
        } else {
          if (reorderCellRight > centerOfThisColumn) {
            changedPosition = true;
            if (cellWasOriginallyBeforeOneBeingDragged) {
              newState.displacement = 0;
            } else {
              newState.displacement = props.columnReorderingData.columnWidth * -1;
            }
          }
        }

        if (changedPosition) {
          if (cellIsBeforeOneBeingDragged) {
            if (!props.columnReorderingData.columnAfter) {
              props.columnReorderingData.columnAfter = props.columnKey;
            }
          } else {
            props.columnReorderingData.columnBefore = props.columnKey;
          }
        } else if (cellIsBeforeOneBeingDragged) {
          props.columnReorderingData.columnBefore = props.columnKey;
        } else if (!props.columnReorderingData.columnAfter) {
          props.columnReorderingData.columnAfter = props.columnKey;
        }

      }
    } else {
      newState.displacement = 0;
    }

    this.setState(newState);
  }


  render() {

    var {height, width, columnKey, ...props} = this.props;

    var style = {
      height,
      width,
    };

    if (DIR_SIGN === 1) {
      style.left = props.left;
    } else {
      style.right = props.left;
    }

    if (this.state.isReorderingThisColumn) {
      style.transform = `translateX(${this.state.displacement}px) translateZ(0)`;
      style.zIndex = 1;
    }

    var className = joinClasses(
      cx({
        'fixedDataTableCellLayoutMain': true,
        'fixedDataTableCellLayoutLastChild': props.lastChild,
        'fixedDataTableCellLayoutAlignRight': props.align === 'right',
        'fixedDataTableCellLayoutAlignCenter': props.align === 'center',
        'publicFixedDataTableCellAlignRight': props.align === 'right',
        'publicFixedDataTableCellHighlighted': props.highlighted,
        'publicFixedDataTableCellMain': true,
        'publicFixedDataTableCellHasReorderHandle': !!props.onColumnReorder,
        'publicFixedDataTableCellReordering': this.state.isReorderingThisColumn,
      }),
      props.className,
    );

    var columnResizerComponent;
    if (props.onColumnResize) {
      var columnResizerStyle = {
        height
      };
      function suppress(event) {
        event.preventDefault();
        event.stopPropagation();
      };
      columnResizerComponent = (
        <div
          className={cx('fixedDataTableCellLayoutColumnResizerContainer')}
          style={columnResizerStyle}
          onMouseDown={this.onColumnResizerMouseDown}
          onTouchStart={this.props.touchEnabled ? this.onColumnResizerMouseDown : null}
          onTouchEnd={this.props.touchEnabled ? suppress : null}
          onTouchMove={this.props.touchEnabled ? suppress : null}>
          <div
            className={joinClasses(
              cx('fixedDataTableCellLayoutColumnResizerKnob'),
              cx('publicFixedDataTableCellColumnResizerKnob'),
            )}
            style={columnResizerStyle}
          />
        </div>
      );
    }

    var columnReorderComponent;
    if (props.onColumnReorder) { //header row
      columnReorderComponent = (
        <FixedDataTableColumnReorderHandle
          columnKey={this.columnKey}
          touchEnabled={this.props.touchEnabled}
          onMouseDown={this.onColumnReorderMouseDown}
          onTouchStart={this.onColumnReorderMouseDown}
          height={height}
          {...this.props}
        />
      );
    }

    var cellProps = {
      columnKey,
      height,
      width
    };

    if (props.rowIndex >= 0) {
      cellProps.rowIndex = props.rowIndex;
    }

    var content;
    if (React.isValidElement(props.cell)) {
      content = React.cloneElement(props.cell, cellProps);
    } else if (typeof props.cell === 'function') {
      content = props.cell(cellProps);
    } else {
      content = (
        <FixedDataTableCellDefault
          {...cellProps}>
          {props.cell}
        </FixedDataTableCellDefault>
      );
    }

    return (
      <div className={className} style={style}>
        {columnResizerComponent}
        {columnReorderComponent}
        {content}
      </div>
    );
  }

  onColumnResizerMouseDown(event) {
    this.props.onColumnResize(
      this.props.left,
      this.props.width,
      this.props.minWidth,
      this.props.maxWidth,
      this.props.columnKey,
      event
    );
    /**
     * This prevents the rows from moving around when we resize the
     * headers on touch devices.
     */
    if (this.props.touchEnabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onColumnReorderMouseDown(event) {
    this.props.onColumnReorder(
      this.props.columnKey,
      this.props.width,
      this.props.left,
      event
    );
  }
}

export default FixedDataTableCell;
