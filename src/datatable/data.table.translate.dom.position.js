import {translateDOMPositionXY} from './vendor/dom/translate.dom.positionxy';
function FixedDataTableTranslateDOMPosition(style, x, y, initialRender = false) {
  if (initialRender) {
    style.left = x + 'px';
    style.top = y + 'px';
  } else {
    translateDOMPositionXY(style, x, y);
  }

}

export {FixedDataTableTranslateDOMPosition};
