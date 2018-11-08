import _findIndex from 'lodash/findIndex';
function getsortedColumns(data, colId, sortType) {
  var sort = _findIndex(data, function(col) {
    return (col.Id === colId) && (col.SortType === sortType);
  });
  return sort;
}

export {
  getsortedColumns
};
