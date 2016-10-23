'use strict';

var _ = require('lodash');

function assign(objA, objB){
  return _.assign({}, objB, objA);
}

module.exports = assign;
