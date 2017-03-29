'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'VoronoiCircle',

  // TODO: Check prop types
  propTypes: {
    handleMouseOver: React.PropTypes.any,
    handleMouseLeave: React.PropTypes.any,
    voronoiPath: React.PropTypes.any,
    cx: React.PropTypes.any,
    cy: React.PropTypes.any,
    circleRadius: React.PropTypes.any,
    circleFill: React.PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4'
    };
  },
  render: function render() {
    return React.createElement(
      'g',
      null,
      React.createElement('path', {
        onMouseOver: this.props.handleMouseOver,
        onMouseLeave: this.props.handleMouseLeave,
        fill: 'transparent',
        d: this.props.voronoiPath
      }),
      React.createElement('circle', {
        onMouseOver: this.props.handleMouseOver,
        onMouseLeave: this.props.handleMouseLeave,
        cx: this.props.cx,
        cy: this.props.cy,
        r: this.props.circleRadius,
        fill: this.props.circleFill,
        className: 'rd3-linechart-circle'
      })
    );
  }
});