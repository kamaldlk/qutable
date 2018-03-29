import React from 'react';
import PropTypes from 'prop-types';
const RowRenderer = props => {
  const { as: Tag, cellAs: Cell, className, row, selected, onSelectChanged } = props;
  return (
    <Tag className={className}>
      <Cell className="action-cell cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelectChanged(row, e.target.checked)}
        />
      </Cell>
      {props.children}
    </Tag>
  );
};

RowRenderer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array
  ]),
  Tag: PropTypes.PropTypes.string,
  as: PropTypes.PropTypes.string,
  cellAs: PropTypes.PropTypes.string,
  className: PropTypes.PropTypes.string,
  row: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectChanged: PropTypes.func
};

export default RowRenderer;
