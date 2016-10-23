'use strict';

var _ = require('lodash');

function reach(parts, obj){
  return _.get(obj, parts);
}

module.exports = reach;
