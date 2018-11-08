
var slashReplaceRegex = /\//g;
var cache = {};

function getClassName(className) {
  if (cache[className]) {
    return cache[className];
  }

  cache[className] = className.replace(slashReplaceRegex, '_');
  return cache[className];
}

export function cx(classNames) {
  var classNamesArray;
  if (typeof classNames == 'object') {
    classNamesArray = Object.keys(classNames).filter(function(className) {
      return classNames[className];
    });
  } else {
    classNamesArray = Array.prototype.slice.call(arguments);
  }

  return classNamesArray.map(getClassName).join(' ');

}