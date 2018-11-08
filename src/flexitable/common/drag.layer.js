import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragLayer } from 'react-dnd';


const DragFieldPreview = ({ style, field, ...props }) => {
  style = {
    ...style,
    background: "#fff",
    boxShadow: "0px 0px 3px",
    padding: "1rem"
  };
  return (
    <div style={style}>
      <p key="1" style={{ marginBottom: "1rem" }}>test</p>
      <div key="2" style={{ border: "1px solid #000" }}/>
    </div>
  );
};

DragFieldPreview.propTypes = {
  style: PropTypes.object,
  field: PropTypes.object.isRequired
};

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100000
};

function getItemStyles(props) {
  let { initialOffset, currentOffset, diffOffset, parentOffset } = props;
  if (!initialOffset || !currentOffset || !diffOffset) {
    return {
      display: 'none'
    };
  }

  initialOffset = parentOffset || initialOffset;

  let { x, y } = { x: currentOffset.x - initialOffset.x, y: currentOffset.y - initialOffset.y };

  const transform = `translate(${x}px, ${y}px)`;
  return {
    WebkitTransform: transform,
    transform
  };
}

const connectFunc = (monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getClientOffset(),
  diffOffset: monitor.getDifferenceFromInitialOffset(),
  isDragging: monitor.isDragging()
});
class CustomDragLayer extends Component {
  static propTypes = {
    item: PropTypes.object,
    itemType: PropTypes.string,
    initialOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired,
    parentOffset: PropTypes.object
  };

  renderItem(type, item) {
    let baseFieldWidth = 13;
    let width = baseFieldWidth * item.Span + "rem";
    switch (type) {
    case 'Field':
      if(!item.Type) {
        return null;
      }
      return <DragFieldPreview field={item} style={{ minWidth: width }}/>;
    default:
      return null;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    );
  }
}

export default DragLayer(connectFunc)(CustomDragLayer);
