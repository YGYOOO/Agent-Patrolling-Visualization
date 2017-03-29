'use strict';

var React = require('react');
var CandlestickContainer = require('./CandlestickContainer');

module.exports = React.createClass({

  displayName: 'DataSeries',

  propTypes: {
    fillUp: React.PropTypes.string.isRequired,
    fillDown: React.PropTypes.string.isRequired
  },

  render: function render() {
    var props = this.props;

    var xRange = props.xScale.range();
    var width = Math.abs(xRange[0] - xRange[1]);
    var candleWidth = width / (props.data.length + 2) * 0.5;

    var dataSeriesArray = props.data.map(function (d, idx) {
      // Candles
      var ohlc = props.yAccessor(d);
      var candleX = props.xScale(props.xAccessor(d)) - 0.5 * candleWidth;
      var candleY = props.yScale(Math.max(ohlc.open, ohlc.close));
      var candleHeight = Math.abs(props.yScale(ohlc.open) - props.yScale(ohlc.close));
      var wickY2 = props.yScale(ohlc.low);
      var candleFill = ohlc.open <= ohlc.close ? props.fillUp : props.fillDown;

      // Wicks
      var wickX1 = props.xScale(props.xAccessor(d));
      var wickY1 = props.yScale(ohlc.high);
      var wickX2 = wickX1;

      return React.createElement(CandlestickContainer, {
        key: idx,
        candleFill: candleFill,
        candleHeight: candleHeight,
        candleWidth: candleWidth,
        candleX: candleX,
        candleY: candleY,
        wickX1: wickX1,
        wickX2: wickX2,
        wickY1: wickY1,
        wickY2: wickY2,
        hoverAnimation: props.hoverAnimation
      });
    }, this);

    return React.createElement(
      'g',
      null,
      dataSeriesArray
    );
  }
});