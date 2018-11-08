import {emptyFunction} from './emptyfunction';
import {nativeRequestAnimationFrame} from './nativerequestanimationframe';

var lastTime = 0;
export const requestAnimationFrame =
  nativeRequestAnimationFrame ||
  function(callback) {
    var currTime = Date.now();
    var timeDelay = Math.max(0, 16 - (currTime - lastTime));
    lastTime = currTime + timeDelay;
    return global.setTimeout(function() {
      callback(Date.now());
    }, timeDelay);
  };
requestAnimationFrame(emptyFunction);