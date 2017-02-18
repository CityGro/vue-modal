'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global jest, beforeEach, describe, it, expect */

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _ContentWrapper = require('../ContentWrapper');

var _ContentWrapper2 = _interopRequireDefault(_ContentWrapper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('utils', function () {
  describe('resolveContnent', function () {
    var string = void 0;
    var Component = void 0;
    var callback = void 0;

    beforeEach(function () {
      jest.resetModules();
      string = 'hello world';
      Component = _vue2.default.component('my-component', {
        render: function render(h) {
          return h('span');
        }
      });
      callback = function callback(cb) {
        return cb(Component);
      };
    });

    it('wraps strings', function () {
      expect(utils.resolveContent(string)).toBeInstanceOf(Function);
    });

    it('wraps Components', function () {
      expect(utils.resolveContent(Component)).toBeInstanceOf(Function);
    });

    it('callback resolves string', function () {
      return new Promise(function (resolve) {
        utils.resolveContent(string)(function (content) {
          resolve(expect(typeof content === 'undefined' ? 'undefined' : _typeof(content)).toBe(_typeof((0, _ContentWrapper2.default)(string))));
        });
      });
    });
    it('callback resolves Component', function () {
      return new Promise(function (resolve) {
        utils.resolveContent(Component)(function (content) {
          resolve(expect(typeof content === 'undefined' ? 'undefined' : _typeof(content)).toBe(typeof Component === 'undefined' ? 'undefined' : _typeof(Component)));
        });
      });
    });
    it('callback is un-modified', function () {
      return new Promise(function (resolve) {
        utils.resolveContent(callback)(function (content) {
          resolve(expect(content).toBe(Component));
        });
      });
    });
  });
});