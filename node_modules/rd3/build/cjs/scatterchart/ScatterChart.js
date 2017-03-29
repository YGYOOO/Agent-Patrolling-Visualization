'use strict';

var React = require('react');

var _require = require('../common');

var Chart = _require.Chart;
var XAxis = _require.XAxis;
var YAxis = _require.YAxis;
var Tooltip = _require.Tooltip;

var DataSeries = require('./DataSeries');
var utils = require('../utils');

var _require2 = require('../mixins');

var CartesianChartPropsMixin = _require2.CartesianChartPropsMixin;
var DefaultAccessorsMixin = _require2.DefaultAccessorsMixin;
var ViewBoxMixin = _require2.ViewBoxMixin;
var TooltipMixin = _require2.TooltipMixin;


module.exports = React.createClass({

  displayName: 'ScatterChart',

  propTypes: {
    circleRadius: React.PropTypes.number,
    className: React.PropTypes.string,
    hoverAnimation: React.PropTypes.bool,
    margins: React.PropTypes.object,
    xAxisClassName: React.PropTypes.string,
    xAxisStrokeWidth: React.PropTypes.number,
    yAxisClassName: React.PropTypes.string,
    yAxisStrokeWidth: React.PropTypes.number
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      className: 'rd3-scatterchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 50, left: 45 },
      xAxisClassName: 'rd3-scatterchart-xaxis',
      xAxisStrokeWidth: 1,
      yAxisClassName: 'rd3-scatterchart-yaxis',
      yAxisStrokeWidth: 1
    };
  },


  _calculateScales: utils.calculateScales,

  render: function render() {
    var props = this.props;
    var data = props.data;

    if (!data || data.length < 1) {
      return null;
    }

    var _getDimensions = this.getDimensions();

    var innerWidth = _getDimensions.innerWidth;
    var innerHeight = _getDimensions.innerHeight;
    var trans = _getDimensions.trans;
    var svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;

    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);
    var xScale = scales.xScale;
    var yScale = scales.yScale;

    return React.createElement(
      'span',
      { onMouseLeave: this.onMouseLeave },
      React.createElement(
        Chart,
        {
          colors: props.colors,
          colorAccessor: props.colorAccessor,
          data: data,
          height: props.height,
          legend: props.legend,
          sideOffset: props.sideOffset,
          margins: props.margins,
          title: props.title,
          viewBox: this.getViewBox(),
          width: props.width,
          shouldUpdate: !this.state.changeState
        },
        React.createElement(
          'g',
          {
            className: props.className,
            transform: trans
          },
          React.createElement(XAxis, {
            data: data,
            height: innerHeight,
            horizontalChart: props.horizontal,
            margins: svgMargins,
            stroke: props.axesColor,
            strokeWidth: props.xAxisStrokeWidth.toString(),
            tickFormatting: props.xAxisFormatter,
            tickStroke: props.xAxisTickStroke,
            tickTextStroke: props.xAxisTickTextStroke,
            width: innerWidth,
            xAxisClassName: props.xAxisClassName,
            xAxisLabel: props.xAxisLabel,
            xAxisLabelOffset: props.xAxisLabelOffset,
            xAxisOffset: props.xAxisOffset,
            xAxisTickInterval: props.xAxisTickInterval,
            xAxisTickValues: props.xAxisTickValues,
            xOrient: props.xOrient,
            yOrient: yOrient,
            xScale: xScale,
            gridVertical: props.gridVertical,
            gridVerticalStroke: props.gridVerticalStroke,
            gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
            gridVerticalStrokeDash: props.gridVerticalStrokeDash
          }),
          React.createElement(YAxis, {
            data: data,
            width: innerWidth,
            height: innerHeight,
            horizontalChart: props.horizontal,
            margins: svgMargins,
            stroke: props.axesColor,
            strokeWidth: props.yAxisStrokeWidth.toString(),
            tickFormatting: props.yAxisFormatter,
            tickStroke: props.yAxisTickStroke,
            tickTextStroke: props.yAxisTickTextStroke,
            yAxisClassName: props.yAxisClassName,
            yAxisLabel: props.yAxisLabel,
            yAxisLabelOffset: props.yAxisLabelOffset,
            yAxisOffset: props.yAxisOffset,
            yAxisTickValues: props.yAxisTickValues,
            yAxisTickCount: props.yAxisTickCount,
            yScale: yScale,
            xOrient: props.xOrient,
            yOrient: yOrient,
            gridHorizontal: props.gridHorizontal,
            gridHorizontalStroke: props.gridHorizontalStroke,
            gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
            gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
          }),
          React.createElement(DataSeries, {
            circleRadius: props.circleRadius,
            colors: props.colors,
            colorAccessor: props.colorAccessor,
            data: allValues,
            height: innerHeight,
            hoverAnimation: props.hoverAnimation,
            width: innerWidth,
            xAccessor: function xAccessor(coord) {
              return coord.x;
            },
            xScale: xScale,
            yAccessor: function yAccessor(coord) {
              return coord.y;
            },
            yScale: yScale,
            onMouseOver: this.onMouseOver
          })
        )
      ),
      props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null
    );
  }
});