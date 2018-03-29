
import React from 'react';
import PropTypes from 'prop-types';

const SheetRenderer = props => {
  const { as: Tag, headerAs: Header, bodyAs: Body, rowAs: Row, cellAs: Cell,
    className, columns, selections, onSelectAllChanged } = props;
  return (
    <Tag className={className}>
      <Header className="data-header">
        <Row>
          <Cell className="action-cell cell">
            <input
              type="checkbox"
              checked={selections.every(s => s)}
              onChange={e => onSelectAllChanged(e.target.checked)}
            />
          </Cell>
          {columns.map(column => <Cell className="cell" style={{ width: column.Width + 'px' }} key={column.Name}>{column.Name}</Cell>)}
        </Row>
      </Header>
      <Body className="data-body">
        {props.children}
      </Body>
    </Tag>
  );
};


SheetRenderer.propTypes = {
  children: PropTypes.any,
  as: PropTypes.PropTypes.string,
  cellAs: PropTypes.PropTypes.string,
  headerAs: PropTypes.PropTypes.string,
  bodyAs: PropTypes.PropTypes.string,
  rowAs: PropTypes.PropTypes.string,
  className: PropTypes.PropTypes.string,
  selected: PropTypes.bool,
  onSelectAllChanged: PropTypes.func,
  columns: PropTypes.array.isRequired,
  selections: PropTypes.array
};

export default SheetRenderer;
