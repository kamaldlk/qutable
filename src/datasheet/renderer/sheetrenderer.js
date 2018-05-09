
import React, { PureComponent } from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import ColumnResizer from "./column.resize";
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

export default class SheetRenderer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    //const resizer = document.querySelectorAll(".table");
    const resizer = new ColumnResizer(document.getElementById("mytable"), {
      liveDrag: true,
      resizeMode: 'overflow'
    });
    console.log('resizer', resizer);
    if (this.props.resizable) {
      this.enableResize();
    }
  }
  componentWillUpdate() {
    if (this.props.resizable) {
      this.disableResize();
    }
  }
  componentDidUpdate() {
    if (this.props.resizable) {
      this.enableResize();
    }
  }
  componentWillUnmount() {
    if (this.props.resizable) {
      this.disableResize();
    }
  }

  enableResize() {
    const normalRemote = ReactDOM.findDOMNode(this).querySelector(
      `#${this.bodyId}`
    );
    const options = this.props.resizerOptions;
    options.remoteTable = normalRemote;
    if (!this.resizer) {
      this.resizer = new ColumnResizer(
        ReactDOM.findDOMNode(this).querySelector(`#${this.headerId}`),
        options
      );
    } else {
      this.resizer.reset(options);
    }
  }

  disableResize() {
    if (this.resizer) {
      // This will return the current state of the
      // options including column widths.
      // These widths can be saved so the table
      // can be initialized with them.
      this.resizer.reset({ disable: true });
    }
  }

  render() {
    const { as: Tag, headerAs: Header, bodyAs: Body, rowAs: Row, cellAs: Cell,
      className, columns, selections, onSelectAllChanged, onColumnDrop } = this.props;
    return (
      <Tag className={className} id="mytable">
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
          {this.props.children}
        </Body>
      </Tag>
    );
  }
}
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
  onColumnDrop: PropTypes.func,
  resizable: PropTypes.bool,
  resizerOptions: PropTypes.object
};
