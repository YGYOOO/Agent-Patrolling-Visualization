'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'Area',

  propTypes: {
    path: React.PropTypes.string,
    fill: React.PropTypes.string,
    handleMouseOver: React.PropTypes.func,
    handleMouseLeave: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182bd'
    };
  },
  render: function render() {
    return React.createElement('path', {
      className: 'rd3-areachart-area',
      d: this.props.path,
      fill: this.props.fill,
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave
    });
  }
});