import React from 'react';
import PropTypes from 'prop-types';

const theme = {
  primary: "#43A047",
  secondary: "#ddd",
  color: "#333"
};

const getStyle = (style) => {
  var type = {
    fill: {
      background: theme.primary,
      borderColor: theme.primary,
      color: theme.color
    },
    outline: {
      borderColor: theme.primary,
      color: theme.color
    }
  };

  return type[style] || {};
};

function Button({ style = {}, children, styleType = "", ...props }) {
  var defaultStyle = {
    padding: "1rem 1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid",
    borderColor: "#ddd",
    color: "#333",
    background: "transparent",
    width: "10rem",
    fontSize: "1.4rem",
    cursor: "pointer"
  };

  var themeOption = getStyle(styleType);

  defaultStyle = Object.assign({}, defaultStyle, themeOption, style);
  return <button style={ defaultStyle } { ...props }>{ children }</button>;
}
Button.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node,
  styleType: PropTypes.oneOf([
    "fill",
    "outline"
  ])
};

export default Button;
