'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var shade = require('../utils').shade;
var Cell = require('./Cell');

module.exports = React.createClass({

  displayName: 'CellContainer',

  propTypes: {
    fill: React.PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _animateCell: function _animateCell() {
    this.setState({
      fill: shade(this.props.fill, 0.05)
    });
  },
  _restoreCell: function _restoreCell() {
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    return React.createElement(Cell, _extends({}, props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateCell : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreCell : null
    }));
  }
});