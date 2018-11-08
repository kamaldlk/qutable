import {emptyFunction} from './vendor/core/emptyfunction';
import {normalizeWheel} from './vendor/dom/normalize.wheel';
import {requestAnimationFrame as requestAnimationFramePolyfill} from './vendor/core/requestanimationframepolyfill';

class ReactWheelHandler {
  constructor(
    onWheel,
    handleScrollX,
    handleScrollY,
    stopPropagation
  ) {
    this.animationFrameID = null;
    this.deltaX = 0;
    this.deltaY = 0;
    this.didWheel = this.didWheel.bind(this);
    this.rootRef = null;
    if (typeof handleScrollX !== 'function') {
      handleScrollX = handleScrollX ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof handleScrollY !== 'function') {
      handleScrollY = handleScrollY ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof stopPropagation !== 'function') {
      stopPropagation = stopPropagation ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    this.handleScrollX = handleScrollX;
    this.handleScrollY = handleScrollY;
    this.stopPropagation = stopPropagation;
    this.onWheelCallback = onWheel;
    this.onWheel = this.onWheel.bind(this);
  }

  contains(target) {
    var parent = target;
    while (parent !== document.body) {
      if (parent === this.rootRef) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  onWheel(event) {
    var normalizedEvent = normalizeWheel(event);
    var deltaX = this.deltaX + normalizedEvent.pixelX;
    var deltaY = this.deltaY + normalizedEvent.pixelY;
    var handleScrollX = this.handleScrollX(deltaX, deltaY);
    var handleScrollY = this.handleScrollY(deltaY, deltaX);
    if (!handleScrollX && !handleScrollY) {
      return;
    }

    if (this.rootRef && !this.contains(event.target)) {
      return;
    }

    this.deltaX += handleScrollX ? normalizedEvent.pixelX : 0;
    this.deltaY += handleScrollY ? normalizedEvent.pixelY : 0;
    event.preventDefault();

    var changed;
    if (this.deltaX !== 0 || this.deltaY !== 0) {
      if (this.stopPropagation()) {
        event.stopPropagation();
      }
      changed = true;
    }

    if (changed === true && this.animationFrameID === null) {
      this.animationFrameID = requestAnimationFramePolyfill(this.didWheel);
    }
  }

  setRoot(rootRef) {
    this.rootRef = rootRef;
  }

  didWheel() {
    this.animationFrameID = null;
    this.onWheelCallback(this.deltaX, this.deltaY);
    this.deltaX = 0;
    this.deltaY = 0;
  }
}

export default ReactWheelHandler;
