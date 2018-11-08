import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import Card from './datalist';

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = { cards: props.list };
  }

  pushCard(card) {
    let cards = this.state.cards;
    cards.push(card);
    this.setState({ cards });
  }

  removeCard(index) {
    let cards = this.state.cards;
    cards.splice(index, 1);
    this.setState({ cards });
  }

  moveCard(dragIndex, hoverIndex) {
    const { cards } = this.state;
    const dragCard = cards[dragIndex];
    cards.splice(dragIndex, 1); // removing what you are dragging.
    cards.splice(hoverIndex, 0, dragCard); // inserting it into hoverIndex.
    this.setState({ cards });
  }

  render() {
    const { cards } = this.state;
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;
    const style = {
      width: "200px",
      height: "404px",
      border: '1px dashed gray'
    };

    const backgroundColor = isActive ? 'lightgreen' : '#FFF';

    return connectDropTarget(
      <div style={{ ...style, backgroundColor }}>
        {cards.map((card, i) => {
          return (
            <Card
              key={card.id}
              index={i}
              listId={this.props.id}
              card={card}
              removeCard={this.removeCard.bind(this)}
              moveCard={this.moveCard.bind(this)} />
          );
        })}
      </div>
    );
  }
}
Container.propTypes = {
  card: PropTypes.object,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  id: PropTypes.number,
  list: PropTypes.arrayOf

};
const cardTarget = {
  drop(props, monitor, component) {
    const { id } = props;
    const sourceObj = monitor.getItem();
    if (id !== sourceObj.listId) component.pushCard(sourceObj.card);
    return {
      listId: id
    };
  }
};

export default DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Container);
