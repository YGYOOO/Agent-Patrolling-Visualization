'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

var _require = require('react-dom');

var findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var Arc = require('./Arc');

module.exports = React.createClass({

  displayName: 'ArcContainer',

  propTypes: {
    fill: React.PropTypes.string,
    onMouseOver: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    dataPoint: React.PropTypes.any },

  // TODO prop type?
  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _animateArc: function _animateArc() {
    var rect = findDOMNode(this).getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _restoreArc: function _restoreArc() {
    this.props.onMouseLeave.call(this);
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    return React.createElement(Arc, _extends({}, this.props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateArc : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreArc : null
    }));
  }
});