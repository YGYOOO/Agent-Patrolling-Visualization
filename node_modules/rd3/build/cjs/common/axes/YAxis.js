'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var d3 = require('d3');
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = React.createClass({

  displayName: 'YAxis',

  propTypes: {
    fill: React.PropTypes.string,
    stroke: React.PropTypes.string,
    strokeWidth: React.PropTypes.string,
    tickStroke: React.PropTypes.string,
    tickTextStroke: React.PropTypes.string,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    horizontalChart: React.PropTypes.bool,
    yAxisClassName: React.PropTypes.string,
    yAxisLabel: React.PropTypes.string,
    yAxisOffset: React.PropTypes.number,
    yAxisTickValues: React.PropTypes.array,
    xOrient: React.PropTypes.oneOf(['top', 'bottom']),
    yOrient: React.PropTypes.oneOf(['left', 'right']),
    yScale: React.PropTypes.func.isRequired,
    gridVertical: React.PropTypes.bool,
    gridVerticalStroke: React.PropTypes.string,
    gridVerticalStrokeWidth: React.PropTypes.number,
    gridVerticalStrokeDash: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: '#000',
      strokeWidth: '1',
      tickStroke: '#000',
      yAxisClassName: 'rd3-y-axis',
      yAxisLabel: '',
      yAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = void 0;
    if (props.yOrient === 'right') {
      t = 'translate(' + (props.yAxisOffset + props.width) + ', 0)';
    } else {
      t = 'translate(' + props.yAxisOffset + ', 0)';
    }

    var tickArguments = void 0;
    if (props.yAxisTickCount) {
      tickArguments = [props.yAxisTickCount];
    }

    if (props.yAxisTickInterval) {
      tickArguments = [d3.time[props.yAxisTickInterval.unit], props.yAxisTickInterval.interval];
    }

    return React.createElement(
      'g',
      {
        className: props.yAxisClassName,
        transform: t
      },
      React.createElement(AxisTicks, {
        innerTickSize: props.tickSize,
        orient: props.yOrient,
        orient2nd: props.xOrient,
        tickArguments: tickArguments,
        tickFormatting: props.tickFormatting,
        tickStroke: props.tickStroke,
        tickTextStroke: props.tickTextStroke,
        tickValues: props.yAxisTickValues,
        scale: props.yScale,
        height: props.height,
        width: props.width,
        horizontalChart: props.horizontalChart,
        gridHorizontal: props.gridHorizontal,
        gridHorizontalStroke: props.gridHorizontalStroke,
        gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
        gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
      }),
      React.createElement(AxisLine, _extends({
        orient: props.yOrient,
        outerTickSize: props.tickSize,
        scale: props.yScale,
        stroke: props.stroke
      }, props)),
      React.createElement(Label, {
        height: props.height,
        horizontalChart: props.horizontalChart,
        label: props.yAxisLabel,
        margins: props.margins,
        offset: props.yAxisLabelOffset,
        orient: props.yOrient
      })
    );
  }
});