import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';
class AutoPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childBox: null,
      parentBox: null
    };
  }

  componentDidMount() {
    const childBox = ReactDOM.findDOMNode(this.child).getBoundingClientRect();
    const parentBox = ReactDOM.findDOMNode(this.base).getBoundingClientRect();
    this.setState({ childBox, parentBox });
  }
  getStyle() {
    const childBox = this.state.childBox;

    if (!childBox) {
      return {
        position: 'absolute',
        opacity: 0
      };
    }

    const anchorBox = this.props.anchorBox;
    const parentBox = this.state.parentBox;
    let left = anchorBox.left - parentBox.left + (anchorBox.width || 0);
    let top = anchorBox.top - parentBox.top;

    if (left + childBox.width > parentBox.width) {
      left = left - childBox.width - (anchorBox.width || 0);
    }
    if (top + childBox.height > parentBox.height) {
      top = top - childBox.height + (anchorBox.height || 0);
    }
    const style = {};
    style.left = left;
    style.top = top;
    style.position = 'absolute';
    style.opacity = 1;
    return style;
  }

  getChildren() {
    return (
      <div ref={(node) => {this.child = node;}} style={ this.getStyle() }>
        { this.props.children }
      </div>
    );
  }


  render() {
    return (
      <div ref={(node) => {this.base = node;}} className={`${styles.autoPositionbase}`}>
        { this.getChildren() }
      </div>
    );
  }
}

AutoPosition.propTypes = {
  anchorBox: PropTypes.object
};

AutoPosition.defaultProps = {
  anchorBox: { width: 0, height: 0, top: 0, left: 0 }
};

AutoPosition.propTypes = {
  children: PropTypes.node
};
export default AutoPosition;
