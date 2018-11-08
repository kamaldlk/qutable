import React from 'react';
import PropTypes from 'prop-types';
import Isvg from 'react-inlinesvg';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
import { CheckBox } from '../../widgets/index';
import { DragSource, DropTarget } from 'react-dnd';
var ItemTypes = {
  CELL: 'cell'
};
var dndData = {
  from: 0,
  to: 0
};
class RowIndex extends React.Component {
  // handleviewForm = (row) => {
  //   if(row) {
  //     this.props.history.push(`/process/${this.props.modelId}/form/${row.getValue("_ResourceId")}/${row.getValue("Id")}`);
  //   }
  // }
  getStyle() {
    const styles = {};
    styles['height'] = this.props.rowHeight + 'px';
    styles['lineHeight'] = this.props.rowHeight + 'px';
    return styles;
  }

  render() {
    const { getStyle, selectedFactor, rowSelection, selectedIds,
      handleCheckBoxChanges, rowHeight, connectDropTarget,
      connectDragSource, connectDragPreview, isDragging,
      handleDND, ...props } = this.props;


    let isSelected = this.props.selectedIds.indexOf(this.props.row.id) > -1;
    const className = classSet({
      [styles.rowSelected]: this.props.selected,
      [styles.rowSelectedHover]: isSelected
    });
    return this.props.connectDropTarget(this.props.connectDragSource(
      <div
        { ...props }
        className={`${styles.rowIndex} ${className}`}>
        {(this.props.rowSelection === this.props.row.id || isSelected) &&
        <div className={`${styles.rowdgdragrowhandle}`}/>}
        {((this.props.rowSelection === this.props.row.id) || isSelected) && <div className={`${styles.rowIndexCheckBox}`} >
          <CheckBox
            value={isSelected}
            name={'grid' + this.props.index} onChange={() => this.props.handleCheckBoxChanges()}/>
        </div>}
        {((this.props.rowSelection !== this.props.row.id) && this.props.selectedIds.indexOf(this.props.row.id) === -1) && <div className={`${styles.rowindexValues} ${className}`} style={this.getStyle()}>
          {this.props.index == null ? '' : this.props.index + 1}
        </div>}
      </div>
    ));
  }
}

RowIndex.propTypes = {
  index: PropTypes.number,
  selected: PropTypes.bool,
  errors: PropTypes.object,
  getStyle: PropTypes.func,
  row: PropTypes.object,
  selectedFactor: PropTypes.number,
  history: PropTypes.object,
  column: PropTypes.object,
  rowSelection: PropTypes.string,
  selectedIds: PropTypes.array,
  rowHeight: PropTypes.number,
  handleCheckBoxChanges: PropTypes.func,
  connectDropTarget: PropTypes.func,
  connectDragSource: PropTypes.func,
  handleDND: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  data: PropTypes.array
};

RowIndex.defaultProps = {
  selectedFactor: 12

};
var source = {
  beginDrag: function(props, monitor, component) {
    dndData.from = props.index;
    return {};
  },
  endDrag: function(props, monitor, component) {
    if (!monitor.didDrop()) {
      return;
    }
  }
};

const target = {
  drop: function(props, monitor, component) {
    dndData.to = props.index;
    let rowTarget = { data: props.data, from: dndData.from, to: dndData.to };
    props.handleDND(rowTarget);
  }
};

function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

function sourceCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}
var DragDataCell = DragSource(ItemTypes.CELL, source, sourceCollect)(RowIndex);
DragDataCell = DropTarget(ItemTypes.CELL, target, targetCollect)(DragDataCell);

export default DragDataCell;
