
import React, { Component, Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
const CellRenderer = props => {
  const {
    as: Tag, cell, row, col, columns, attributesRenderer,
    selected, editing, updated, style,
    ...rest
  } = props;

  // hey, how about some custom attributes on our cell?
  const attributes = cell.attributes || {};
  // ignore default style handed to us by the component and roll our own
  attributes.style = { width: columns[col].Width + 'px' };
  if (col === 0) {
    attributes.title = cell.label;
  }
  return (
    <Tag {...rest} {...attributes}>
      {props.children}
    </Tag>
  );
};
CellRenderer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array
  ]),
  as: PropTypes.PropTypes.string,
  cellAs: PropTypes.PropTypes.string,
  headerAs: PropTypes.PropTypes.string,
  bodyAs: PropTypes.PropTypes.string,
  rowAs: PropTypes.PropTypes.string,
  className: PropTypes.PropTypes.string,
  selected: PropTypes.bool.isRequired,
  onSelectAllChanged: PropTypes.func,
  columns: PropTypes.array.isRequired,
  selections: PropTypes.array,
  col: PropTypes.number,
  row: PropTypes.number,
  cell: PropTypes.object,
  attributesRenderer: PropTypes.func,
  editing: PropTypes.bool,
  updated: PropTypes.bool,
  style: PropTypes.object
};

export default CellRenderer;
