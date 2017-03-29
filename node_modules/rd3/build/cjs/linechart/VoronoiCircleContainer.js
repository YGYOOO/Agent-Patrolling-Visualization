'use strict';

var React = require('react');

var _require = require('react-dom');

var findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var VoronoiCircle = require('./VoronoiCircle');

module.exports = React.createClass({

  displayName: 'VornoiCircleContainer',

  propTypes: {
    circleRadius: React.PropTypes.any,
    circleFill: React.PropTypes.any,
    onMouseOver: React.PropTypes.any,
    dataPoint: React.PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4',
      hoverAnimation: true
    };
  },
  getInitialState: function getInitialState() {
    return {
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill
    };
  },
  _animateCircle: function _animateCircle() {
    var rect = findDOMNode(this).getElementsByTagName('circle')[0].getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      circleRadius: this.props.circleRadius * (5 / 4),
      circleFill: shade(this.props.circleFill, 0.2)
    });
  },
  _restoreCircle: function _restoreCircle() {
    this.setState({
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill
    });
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return 'M Z';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCircle;
      handleMouseLeave = this._restoreCircle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement(
      'g',
      null,
      React.createElement(VoronoiCircle, {
        handleMouseOver: handleMouseOver,
        handleMouseLeave: handleMouseLeave,
        voronoiPath: this._drawPath(props.vnode),
        cx: props.cx,
        cy: props.cy,
        circleRadius: this.state.circleRadius,
        circleFill: this.state.circleFill
      })
    );
  }
});