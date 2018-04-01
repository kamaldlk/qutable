
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/datasheet.css';
import { colDragSource, colDropTarget } from '../dnd/drag.drop';

const HeaderData = colDropTarget(colDragSource((props) => {
  const { col, connectDragSource, connectDropTarget, isOver } = props;
  const className = isOver ? styles.cell + " " + styles.readOnly + " " +
  styles.dropTarget : styles.cell + " " + styles.readOnly;
  return connectDropTarget(
    connectDragSource(
      <th className={className} style={{ width: col.Width + 'px' }}>{col.Name}</th>
    ));
}));

const SheetRenderer = props => {
  const { as: Tag, headerAs: Header, bodyAs: Body, rowAs: Row, cellAs: Cell,
    className, columns, selections, onSelectAllChanged, onColumnDrop } = props;
  return (
    <Tag className={className}>
      <Header className={`${styles.dataHeader}`}>
        <Row>
          <Cell className={`${styles.actionCell} ${styles.cell}`}>
            <input
              type="checkbox"
              checked={selections.every(s => s)}
              onChange={e => onSelectAllChanged(e.target.checked)}
            />
          </Cell>
          {
            columns.map((col, index) => (
              <HeaderData key={col.Name} col={col} columnIndex={index} onColumnDrop={onColumnDrop} />
            ))
          }
        </Row>
      </Header>
      <Body className={`${styles.dataBody}`}>
        {props.children}
      </Body>
    </Tag>
  );
};


SheetRenderer.propTypes = {
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
  selected: PropTypes.bool,
  onSelectAllChanged: PropTypes.func,
  columns: PropTypes.array.isRequired,
  selections: PropTypes.array,
  onColumnDrop: PropTypes.func
};

export default SheetRenderer;
