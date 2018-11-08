var CSS_VARS = {
  'scrollbar-face-active-color': '#7d7d7d',
  'scrollbar-face-color': '#c2c2c2',
  'scrollbar-face-margin': '4px',
  'scrollbar-face-radius': '6px',
  'scrollbar-size': '15px',
  'scrollbar-size-large': '17px',
  'scrollbar-track-color': '#fff',
  'border-color': '#d3d3d3',
  'fbui-white': '#fff',
  'fbui-desktop-background-light': '#f6f7f8',
};

 function cssVar(name) {
  if (CSS_VARS.hasOwnProperty(name)) {
    return CSS_VARS[name];
  }
  throw new Error(
    'cssVar("' + name + '"): Unexpected class transformation.'
  );
}
cssVar.CSS_VARS = CSS_VARS;
export {cssVar}

