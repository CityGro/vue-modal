'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveContent = undefined;

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _ContentWrapper = require('./ContentWrapper');

var _ContentWrapper2 = _interopRequireDefault(_ContentWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * wraps string and VueComponents in an async require compatible callback function
 *
 * @param {string|function} content
 * @returns {function}
 */
var resolveContent = exports.resolveContent = function resolveContent(content) {
  if ((0, _isString2.default)(content)) {
    return function (cb) {
      return cb((0, _ContentWrapper2.default)(content));
    };
  } else if (typeof content === 'function') {
    if (content.name === 'VueComponent') {
      return function (cb) {
        return cb(content);
      };
    } else {
      return content;
    }
  }
};