import {getVendorPrefixedName} from '../core/getvendor.prefixedname';

export const BrowserSupportCore = {
  hasCSSAnimations: function() {
    return !!getVendorPrefixedName('animationName');
  },
  hasCSSTransforms: function() {
    return !!getVendorPrefixedName('transform');
  },
  hasCSS3DTransforms: function() {
    return !!getVendorPrefixedName('perspective');
  },
  hasCSSTransitions: function() {
    return !!getVendorPrefixedName('transition');
  },
};
