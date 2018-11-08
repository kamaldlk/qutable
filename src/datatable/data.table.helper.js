import React from 'react';
import FixedDataTableColumnGroup from './data.table.column.group';
import FixedDataTableColumn from './data.table.column';
import {Locale} from './vendor/core/locale';
var DIR_SIGN = (Locale.isRTL() ? -1 : +1);
var CELL_VISIBILITY_TOLERANCE = 5;
function renderToString(value){
  if (value === null || value === undefined) {
    return '';
  } else {
    return String(value);
  }
}

function forEachColumn(children, callback) {
  React.Children.forEach(children, (child) => {
    if (child.type === FixedDataTableColumnGroup) {
      forEachColumn(child.props.children, callback);
    } else if (child.type === FixedDataTableColumn) {
      callback(child);
    }
  });
}

function mapColumns(children, callback) {
  var newChildren = [];
  React.Children.forEach(children, originalChild => {
    var newChild = originalChild;
    if (originalChild.type === FixedDataTableColumnGroup) {
      var haveColumnsChanged = false;
      var newColumns = [];

      forEachColumn(originalChild.props.children, originalcolumn => {
        var newColumn = callback(originalcolumn);
        if (newColumn !== originalcolumn) {
          haveColumnsChanged = true;
        }
        newColumns.push(newColumn);
      });
      if (haveColumnsChanged) {
        newChild = React.cloneElement(originalChild, {
          children: newColumns,
        });
      }
    } else if (originalChild.type === FixedDataTableColumn) {
      newChild = callback(originalChild);
    }

    newChildren.push(newChild);
  });

  return newChildren;
}

var FixedDataTableHelper = {
  DIR_SIGN,
  CELL_VISIBILITY_TOLERANCE,
  renderToString,
  forEachColumn,
  mapColumns,
};

export {FixedDataTableHelper};
