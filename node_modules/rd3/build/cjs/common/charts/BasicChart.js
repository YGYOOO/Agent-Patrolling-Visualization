'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'BasicChart',

  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    height: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    svgClassName: React.PropTypes.string,
    title: React.PropTypes.node,
    titleClassName: React.PropTypes.string,
    width: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-basic-chart',
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: ''
    };
  },
  _renderTitle: function _renderTitle() {
    var props = this.props;

    if (props.title !== '') {
      return React.createElement(
        'h4',
        {
          className: props.titleClassName
        },
        props.title
      );
    }
    return null;
  },
  _renderChart: function _renderChart() {
    var props = this.props;

    return React.createElement(
      'svg',
      {
        className: props.svgClassName,
        height: props.height,
        viewBox: props.viewBox,
        width: props.width
      },
      props.children
    );
  },
  render: function render() {
    var props = this.props;

    return React.createElement(
      'div',
      {
        className: props.className
      },
      this._renderTitle(),
      this._renderChart()
    );
  }
});