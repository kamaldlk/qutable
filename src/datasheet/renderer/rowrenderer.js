import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/datasheet.css';
import { rowDragSource, rowDropTarget } from '../dnd/drag.drop';

const RowRenderer = rowDropTarget(rowDragSource((props) => {
  const { as: Tag, cellAs: Cell, className, row, selected, onSelectChanged,
    connectDropTarget, connectDragPreview, connectDragSource, rowIndex } = props;
  return connectDropTarget(connectDragPreview(
    <Tag className={className}>
      {connectDragSource(<Cell className={`${styles.actionCell} ${styles.cell} ${styles.rowHandle}`} key="$$actionCell">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelectChanged(row, e.target.checked)}
        />
      </Cell>)}
      {props.children}
    </Tag>
  ));
}));

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
  selected: PropTypes.bool,
  onSelectChanged: PropTypes.func
};

export default RowRenderer;
