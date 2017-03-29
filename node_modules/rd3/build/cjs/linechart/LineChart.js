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

  displayName: 'LineChart',

  propTypes: {
    circleRadius: React.PropTypes.number,
    hoverAnimation: React.PropTypes.bool,
    margins: React.PropTypes.object,
    data: React.PropTypes.array.isRequired
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      className: 'rd3-linechart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 50, left: 45 },
      xAxisClassName: 'rd3-linechart-xaxis',
      yAxisClassName: 'rd3-linechart-yaxis',
      data: []
    };
  },


  _calculateScales: utils.calculateScales,

  render: function render() {
    var props = this.props;

    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    var _getDimensions = this.getDimensions();

    var innerWidth = _getDimensions.innerWidth;
    var innerHeight = _getDimensions.innerHeight;
    var trans = _getDimensions.trans;
    var svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(props.data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;
    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);

    return React.createElement(
      'span',
      { onMouseLeave: this.onMouseLeave },
      React.createElement(
        Chart,
        {
          viewBox: this.getViewBox(),
          legend: props.legend,
          sideOffset: props.sideOffset,
          data: props.data,
          margins: props.margins,
          colors: props.colors,
          colorAccessor: props.colorAccessor,
          width: props.width,
          height: props.height,
          title: props.title,
          shouldUpdate: !this.state.changeState
        },
        React.createElement(
          'g',
          { transform: trans, className: props.className },
          React.createElement(XAxis, {
            xAxisClassName: props.xAxisClassName,
            strokeWidth: props.xAxisStrokeWidth,
            xAxisTickValues: props.xAxisTickValues,
            xAxisTickCount: props.xAxisTickCount,
            xAxisTickInterval: props.xAxisTickInterval,
            xAxisOffset: props.xAxisOffset,
            xScale: scales.xScale,
            xAxisLabel: props.xAxisLabel,
            xAxisLabelOffset: props.xAxisLabelOffset,
            tickFormatting: props.xAxisFormatter,
            tickStroke: props.xAxisTickStroke,
            tickTextStroke: props.xAxisTickTextStroke,
            xOrient: props.xOrient,
            yOrient: yOrient,
            data: props.data,
            margins: svgMargins,
            width: innerWidth,
            height: innerHeight,
            horizontalChart: props.horizontal,
            stroke: props.axesColor,
            gridVertical: props.gridVertical,
            gridVerticalStroke: props.gridVerticalStroke,
            gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
            gridVerticalStrokeDash: props.gridVerticalStrokeDash
          }),
          React.createElement(YAxis, {
            yAxisClassName: props.yAxisClassName,
            strokeWidth: props.yAxisStrokeWidth,
            yScale: scales.yScale,
            yAxisTickValues: props.yAxisTickValues,
            yAxisTickCount: props.yAxisTickCount,
            yAxisOffset: props.yAxisOffset,
            yAxisLabel: props.yAxisLabel,
            yAxisLabelOffset: props.yAxisLabelOffset,
            tickFormatting: props.yAxisFormatter,
            tickStroke: props.yAxisTickStroke,
            tickTextStroke: props.yAxisTickTextStroke,
            xOrient: props.xOrient,
            yOrient: yOrient,
            margins: svgMargins,
            width: innerWidth,
            height: innerHeight,
            horizontalChart: props.horizontal,
            stroke: props.axesColor,
            gridHorizontal: props.gridHorizontal,
            gridHorizontalStroke: props.gridHorizontalStroke,
            gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
            gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
          }),
          React.createElement(DataSeries, {
            xScale: scales.xScale,
            yScale: scales.yScale,
            xAccessor: props.xAccessor,
            yAccessor: props.yAccessor,
            hoverAnimation: props.hoverAnimation,
            circleRadius: props.circleRadius,
            data: props.data,
            value: allValues,
            interpolationType: props.interpolationType,
            colors: props.colors,
            colorAccessor: props.colorAccessor,
            width: innerWidth,
            height: innerHeight,
            onMouseOver: this.onMouseOver
          })
        )
      ),
      props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null
    );
  }
});