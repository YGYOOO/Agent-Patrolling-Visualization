'use strict';

var React = require('react');
var d3 = require('d3');
var Polygon = require('./Polygon');

module.exports = React.createClass({

  displayName: 'Voronoi',

  // TODO: PropTypes.any
  propTypes: {
    xScale: React.PropTypes.any,
    yScale: React.PropTypes.any,
    width: React.PropTypes.any,
    height: React.PropTypes.any,
    structure: React.PropTypes.any,
    data: React.PropTypes.any
  },

  render: function render() {
    var _this = this;

    var xScale = this.props.xScale;
    var yScale = this.props.yScale;

    var voronoi = d3.geom.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).clipExtent([[0, 0], [this.props.width, this.props.height]]);

    var regions = voronoi(this.props.data).map(function (vnode, idx) {
      return React.createElement(Polygon, { structure: _this.props.structure, key: idx, id: vnode.point.id, vnode: vnode });
    });

    return React.createElement(
      'g',
      null,
      regions
    );
  }
});