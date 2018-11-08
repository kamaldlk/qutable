
import React from 'react';
import PropTypes from 'prop-types';
import {DOMMouseMoveTracker} from './vendor/dom/dom.mousemovetracker';
import {Locale} from './vendor/core/locale';
import {clamp} from './vendor/core/clamp';
import {cx} from './vendor/core/cx';

class FixedDataTableColumnResizeHandle extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    leftOffset: PropTypes.number.isRequired,
    knobHeight: PropTypes.number.isRequired,
    initialWidth: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    initialEvent: PropTypes.object,
    onColumnResizeEnd: PropTypes.func,
    columnKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    touchEnabled: PropTypes.bool,
  }

  constructor(props){
    super(props);
    this.state ={
      width: 0,
      cursorDelta: 0
    }
    this.onMove = this.onMove.bind(this);
    this.onColumnResizeEnd = this.onColumnResizeEnd.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.initialEvent && !this.mouseMoveTracker.isDragging()) {
      this.mouseMoveTracker.captureMouseMoves(newProps.initialEvent);
      this.setState({
        width: newProps.initialWidth,
        cursorDelta: newProps.initialWidth
      });
    }
  }

  componentDidMount() {
    this.mouseMoveTracker = new DOMMouseMoveTracker(
      this.onMove,
      this.onColumnResizeEnd,
      document.body,
      this.props.touchEnabled
    );
  }

  componentWillUnmount() {
    this.mouseMoveTracker.releaseMouseMoves();
    this.mouseMoveTracker = null;
  }

  render() {
    var style = {
      width: this.state.width,
      height: this.props.height,
    };
    if (Locale.isRTL()) {
      style.right = this.props.leftOffset;
    } else {
      style.left = this.props.leftOffset;
    }
    return (
      <div
        className={cx({
          'fixedDataTableColumnResizerLineLayoutMain': true,
          'fixedDataTableColumnResizerLineLayoutHiddenElem': !this.props.visible,
          'publicFixedDataTableColumnResizerLineMain': true,
        })}
        style={style}>
        <div
          className={cx('fixedDataTableColumnResizerLineLayoutMouseArea')}
          style={{height: this.props.height}}
        />
      </div>
    );
  }

  onMove(deltaX) {
    if (Locale.isRTL()) {
      deltaX = -deltaX;
    }
    var newWidth = this.state.cursorDelta + deltaX;
    var newColumnWidth =
      clamp(newWidth, this.props.minWidth, this.props.maxWidth);

    this.setState({
      width: newColumnWidth,
      cursorDelta: newWidth
    });
  }

  onColumnResizeEnd() {
    this.mouseMoveTracker.releaseMouseMoves();
    this.props.onColumnResizeEnd(
      this.state.width,
      this.props.columnKey
    );
  }
}

export default FixedDataTableColumnResizeHandle;
