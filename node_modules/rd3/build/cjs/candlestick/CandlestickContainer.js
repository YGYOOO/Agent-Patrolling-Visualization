'use strict';

var React = require('react');
var utils = require('../utils');
var Candle = require('./Candle');
var Wick = require('./Wick');

module.exports = React.createClass({

  displayName: 'CandleStickContainer',

  propTypes: {
    candleX: React.PropTypes.number,
    candleY: React.PropTypes.number,
    className: React.PropTypes.string,
    candleFill: React.PropTypes.string,
    candleHeight: React.PropTypes.number,
    candleWidth: React.PropTypes.number,
    wickX1: React.PropTypes.number,
    wickX2: React.PropTypes.number,
    wickY1: React.PropTypes.number,
    wickY2: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-container'
    };
  },
  getInitialState: function getInitialState() {
    // state for animation usage
    return {
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    };
  },
  _animateCandle: function _animateCandle() {
    this.setState({
      candleWidth: this.props.candleWidth * 1.5,
      candleFill: utils.shade(this.props.candleFill, -0.2)
    });
  },
  _restoreCandle: function _restoreCandle() {
    this.setState({
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    });
  },
  render: function render() {
    var props = this.props;
    var state = this.state;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCandle;
      handleMouseLeave = this._restoreCandle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement(
      'g',
      { className: props.className },
      React.createElement(Wick, {
        wickX1: props.wickX1,
        wickX2: props.wickX2,
        wickY1: props.wickY1,
        wickY2: props.wickY2
      }),
      React.createElement(Candle, {
        candleFill: state.candleFill,
        candleWidth: state.candleWidth,
        candleX: props.candleX - (state.candleWidth - props.candleWidth) / 2,
        candleY: props.candleY,
        candleHeight: props.candleHeight,
        handleMouseOver: handleMouseOver,
        handleMouseLeave: handleMouseLeave
      })
    );
  }
});