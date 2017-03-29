'use strict';

var React = require('react');

module.exports = {
  propTypes: {
    xAccessor: React.PropTypes.func,
    yAccessor: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return d.y;
      }
    };
  }
};