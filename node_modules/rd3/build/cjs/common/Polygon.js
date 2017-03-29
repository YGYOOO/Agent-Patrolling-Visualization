'use strict';

var React = require('react');

module.exports = React.createClass({
  displayName: 'exports',


  // TODO: PropTypes.any
  propTypes: {
    structure: React.PropTypes.any,
    id: React.PropTypes.any,
    vnode: React.PropTypes.any
  },

  _animateCircle: function _animateCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'active';
    });
    // this.props.pubsub.emit('animate', this.props.id);
  },
  _restoreCircle: function _restoreCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'inactive';
    });
    // this.props.pubsub.emit('restore', this.props.id);
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return '';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    return React.createElement('path', {
      onMouseOver: this._animateCircle,
      onMouseOut: this._restoreCircle,
      fill: 'white',
      opacity: '0',
      d: this._drawPath(this.props.vnode)
    });
  }
});