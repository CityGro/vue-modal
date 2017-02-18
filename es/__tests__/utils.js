var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global jest, beforeEach, describe, it, expect */

import Vue from 'vue';

import * as utils from '../utils';
import ContentWrapper from '../ContentWrapper';

describe('utils', function () {
  describe('resolveContnent', function () {
    var string = void 0;
    var Component = void 0;
    var callback = void 0;

    beforeEach(function () {
      jest.resetModules();
      string = 'hello world';
      Component = Vue.component('my-component', {
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
          resolve(expect(typeof content === 'undefined' ? 'undefined' : _typeof(content)).toBe(_typeof(ContentWrapper(string))));
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