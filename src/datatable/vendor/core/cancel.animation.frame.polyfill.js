export const cancelAnimationFrame =
  global.cancelAnimationFrame       ||
  global.webkitCancelAnimationFrame ||
  global.mozCancelAnimationFrame    ||
  global.oCancelAnimationFrame      ||
  global.msCancelAnimationFrame     ||
  global.clearTimeout;
