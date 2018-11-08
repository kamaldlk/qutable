
import React from 'react';
import PropTypes from 'prop-types';
import {DOMMouseMoveTracker} from './vendor/dom/dom.mousemovetracker';
import {FixedDataTableEventHelper} from './data.table.event.helper';

import {cx} from './vendor/core/cx';

class FixedDataTableColumnReorderHandle extends React.Component{
   static propTypes = {
    onColumnReorderEnd: PropTypes.func,
    columnKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    touchEnabled: PropTypes.bool,
  }
  constructor(props){
    super(props)
    this.state = {
      dragDistance: 0
    }
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onColumnReorderEnd = this.onColumnReorderEnd.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentWillReceiveProps(newProps) {
  }

  componentWillUnmount() {
    if (this.mouseMoveTracker) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  render() {
    var style = {
      height: this.props.height,
    };
    return (
      <div
        className={cx({
          'fixedDataTableCellLayoutColumnReorderContainer': true,
          'fixedDataTableCellLayoutColumnReorderContainerActive': false,
        })}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.props.touchEnabled ? this.onMouseDown : null}
        onTouchEnd={this.props.touchEnabled ? e => e.stopPropagation() : null}
        onTouchMove={this.props.touchEnabled ? e => e.stopPropagation() : null}
        style={style}>
      </div>
    );
  }

  onMouseDown(event) {
    var targetRect = event.target.getBoundingClientRect();
    var coordinates = FixedDataTableEventHelper.getCoordinatesFromEvent(event);

    var mouseLocationInElement = coordinates.x - targetRect.offsetLeft;
    var mouseLocationInRelationToColumnGroup = mouseLocationInElement + event.target.parentElement.offsetLeft;

    this.mouseMoveTracker = new DOMMouseMoveTracker(
      this.onMove,
      this.onColumnReorderEnd,
      document.body,
      this.props.touchEnabled
    );
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      dragDistance: 0
    });
    this.props.onMouseDown({
      columnKey: this.props.columnKey,
      mouseLocation: {
        dragDistance: 0,
        inElement: mouseLocationInElement,
        inColumnGroup: mouseLocationInRelationToColumnGroup
      }
    });

    this.distance = 0;
    this.animating = true;
    this.frameId = requestAnimationFrame(this.updateState);

    /**
     * This prevents the rows from moving around when we drag the
     * headers on touch devices.
     */
    if(this.props.touchEnabled) {
      event.stopPropagation();
    }
  }

  onMove(deltaX) {
    this.distance = this.state.dragDistance + deltaX;
  }

  onColumnReorderEnd(cancelReorder) {
    this.animating = false;
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.mouseMoveTracker.releaseMouseMoves();
    this.props.columnReorderingData.cancelReorder = cancelReorder;
    this.props.onColumnReorderEnd();
  }

  updateState() {
    if (this.animating) {
      this.frameId = requestAnimationFrame(this.updateState)
    }
    this.setState({
      dragDistance: this.distance
    });
    this.props.onColumnReorderMove(this.distance);
  }
}

export default FixedDataTableColumnReorderHandle;
