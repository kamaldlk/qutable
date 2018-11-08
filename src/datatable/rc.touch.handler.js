import {emptyFunction} from './vendor/core/emptyfunction';
import {requestAnimationFrame as requestAnimationFramePolyfill} from './vendor/core/requestanimationframepolyfill';

var MOVE_AMPLITUDE = 1.6;
var DECELERATION_AMPLITUDE = 1.6;
var DECELERATION_FACTOR = 325;
var TRACKER_TIMEOUT = 100;

export class ReactTouchHandler {
  constructor(
    onTouchScroll,
    handleScrollX,
    handleScrollY,
    stopPropagation
  ) {

    // The animation frame id for the drag scroll
    this.dragAnimationId = null;

    // The interval id for tracking the drag velocity
    this.trackerId = null;

    // Used to track the drag scroll delta while waiting for an animation frame
    this.deltaX = 0;
    this.deltaY = 0;

    // The last touch we processed while dragging.  Used to compute the delta and velocity above
    this.lastTouchX = 0;
    this.lastTouchY = 0;

    // Used to track a moving average of the scroll velocity while dragging
    this.velocityX = 0;
    this.velocityY = 0;

    // An accummulated drag scroll delta used to calculate velocity
    this.accumulatedDeltaX = 0;
    this.accumulatedDeltaY = 0;

    // Timestamp from the last interval frame we used to track velocity
    this.lastFrameTimestamp = Date.now();

    // Timestamp from the last animation frame we used to autoscroll after drag stop
    this.autoScrollTimestamp = Date.now();

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

    // TODO (jordan) Is configuring this necessary
    if (typeof stopPropagation !== 'function') {
      stopPropagation = stopPropagation ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    this.handleScrollX = handleScrollX;
    this.handleScrollY = handleScrollY;
    this.stopPropagation = stopPropagation;
    this.onTouchScrollCallback = onTouchScroll;

    this.didTouchMove = this.didTouchMove.bind(this);
    this.track = this.track.bind(this);
    this.autoScroll = this.autoScroll.bind(this);
    this.startAutoScroll = this.startAutoScroll.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
  }

  onTouchStart(/*object*/ event) {

    // Start tracking drag delta for scrolling
    this.lastTouchX = event.touches[0].pageX;
    this.lastTouchY = event.touches[0].pageY;

    // Reset our velocity and intermediate data used to compute velocity
    this.velocityX = 0;
    this.velocityY = 0;
    this.accumulatedDeltaX = 0;
    this.accumulatedDeltaY = 0;
    this.lastFrameTimestamp = Date.now();

    // Setup interval for tracking velocity
    clearInterval(this.trackerId);
    this.trackerId = setInterval(this.track, TRACKER_TIMEOUT);

    if (this.stopPropagation()) {
      event.stopPropagation();
    }
  }

  onTouchEnd(/*object*/ event) {

    // Stop tracking velocity
    clearInterval(this.trackerId);
    this.trackerId = null;

    // Initialize decelerating autoscroll on drag stop
    requestAnimationFramePolyfill(this.startAutoScroll);

    if (this.stopPropagation()) {
      event.stopPropagation();
    }
  }

  onTouchCancel(/*object*/ event) {

    // Stop tracking velocity
    clearInterval(this.trackerId);
    this.trackerId = null;

    if (this.stopPropagation()) {
      event.stopPropagation();
    }
  }

  onTouchMove(/*object*/ event) {

    var moveX = event.touches[0].pageX;
    var moveY = event.touches[0].pageY;

    // Compute delta scrolled since last drag
    // Mobile, scrolling is inverted
    this.deltaX = MOVE_AMPLITUDE * (this.lastTouchX - moveX);
    this.deltaY = MOVE_AMPLITUDE * (this.lastTouchY - moveY);

    var handleScrollX = this.handleScrollX(this.deltaX, this.deltaY);
    var handleScrollY = this.handleScrollY(this.deltaY, this.deltaX);
    if (!handleScrollX && !handleScrollY) {
      return;
    }

    // If we can handle scroll update last touch for computing delta
    if (handleScrollX) {
      this.lastTouchX = moveX;
    } else {
      this.deltaX = 0;
    }
    if (handleScrollY) {
      this.lastTouchY = moveY;
    } else {
      this.deltaY = 0;
    }

    event.preventDefault();

    // Ensure minimum delta magnitude is met to avoid jitter
    var changed = false;
    if (Math.abs(this.deltaX) > 2 || Math.abs(this.deltaY) > 2) {
      if (this.stopPropagation()) {
        event.stopPropagation();
      }
      changed = true;
    }

    // Request animation frame to trigger scroll of computed delta
    if (changed === true && this.dragAnimationId === null) {
      this.dragAnimationId = requestAnimationFramePolyfill(this.didTouchMove);
    }
  }

  /**
   * Fire scroll callback based on computed drag delta.
   * Also track accummulated delta so we can calculate velocity
   */
  didTouchMove() {
    this.dragAnimationId = null;

    this.onTouchScrollCallback(this.deltaX, this.deltaY);
    this.accumulatedDeltaX += this.deltaX;
    this.accumulatedDeltaY += this.deltaY;
    this.deltaX = 0;
    this.deltaY = 0;
  }
  track() {
    var now = Date.now();
    var elapsed = now - this.lastFrameTimestamp;
    var oldVelocityX = this.velocityX;
    var oldVelocityY = this.velocityY;
    var weight = 0.8;
    if (elapsed < TRACKER_TIMEOUT) {
      weight *= (elapsed / TRACKER_TIMEOUT);
    }
    if (oldVelocityX === 0 && oldVelocityY === 0) {
      weight = 1;
    }
    this.velocityX = weight * (TRACKER_TIMEOUT * this.accumulatedDeltaX / (1 + elapsed));
    if (weight < 1) {
      this.velocityX += (1 - weight) * oldVelocityX;
    }

    this.velocityY = weight * (TRACKER_TIMEOUT * this.accumulatedDeltaY / (1 + elapsed));
    if (weight < 1) {
      this.velocityY += (1 - weight) * oldVelocityY;
    }

    this.accumulatedDeltaX = 0;
    this.accumulatedDeltaY = 0;
    this.lastFrameTimestamp = now;
  }
  startAutoScroll() {
    this.autoScrollTimestamp = Date.now();
    if (this.deltaX > 0 || this.deltaY > 0) {
      this.didTouchMove()
    }
    this.track();
    this.autoScroll();
  }

  autoScroll() {
    var elapsed = Date.now() - this.autoScrollTimestamp;
    var factor = DECELERATION_AMPLITUDE * Math.exp(-elapsed / DECELERATION_FACTOR);
    var deltaX = factor * this.velocityX;
    var deltaY = factor * this.velocityY;

    if (Math.abs(deltaX) <= 5 || !this.handleScrollX(deltaX, deltaY)) {
      deltaX = 0;
    }
    if (Math.abs(deltaY) <= 5 || !this.handleScrollY(deltaY, deltaX)) {
      deltaY = 0;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      this.onTouchScrollCallback(deltaX, deltaY);
      requestAnimationFramePolyfill(this.autoScroll);
    }
  }
}
