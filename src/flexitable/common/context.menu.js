import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';

class Menu extends React.Component {
  getItems() {
    if (!this.props.items) {
      return;
    }

    return this.props.items.filter((item) => {
      return !!item;
    }).map((item, i) => {
      return (
        <div
          key={i}
          className={`${styles.contextmenuItem}`}
          onClick={ item.onClick } >
          { item.label }
        </div>
      );
    });
  }

  render() {
    return (
      <div className={`${styles.contextmenuBase}`}>
        { this.getItems() }
      </div>
    );
  }
}

Menu.propTypes = {
  items: PropTypes.array
};

export default Menu;
