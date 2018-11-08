import {ExecutionEnvironment} from './execution.environment';

import {camelize} from './camelize';
import {invariant} from './invariant';

var memoized = {};
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
var prefixRegex = new RegExp('^(' + prefixes.join('|') + ')');
var testStyle =
  ExecutionEnvironment.canUseDOM ? document.createElement('div').style : {};

function getWithPrefix(name) {
  for (var i = 0; i < prefixes.length; i++) {
    var prefixedName = prefixes[i] + name;
    if (prefixedName in testStyle) {
      return prefixedName;
    }
  }
  return null;
}

export function getVendorPrefixedName(property) {
  var name = camelize(property);
  if (memoized[name] === undefined) {
    var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    if (prefixRegex.test(capitalizedName)) {
      invariant(
        false,
        'getVendorPrefixedName must only be called with unprefixed' +
        'CSS property names. It was called with %s', property
      );
    }
    memoized[name] =
      (name in testStyle) ? name : getWithPrefix(capitalizedName);
  }
  return memoized[name];
}
