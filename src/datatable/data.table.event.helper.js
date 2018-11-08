function getCoordinatesFromEvent(event) {
    var x = 0;
    var y = 0;

    if ((!event.clientX || !event.clientY)) {
        if (event.touches && event.touches.length > 0) {
            var touch = event.touches[0];
            x = touch.clientX;
            y = touch.clientY;
        }
    } else {
        x = event.clientX;
        y = event.clientY;
    }

    return { x, y };
}

var FixedDataTableEventHelper = {
    getCoordinatesFromEvent,
  };

export { FixedDataTableEventHelper };
