'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _findIndex = require('lodash/fp/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

var _first = require('lodash/fp/first');

var _first2 = _interopRequireDefault(_first);

var _fromPairs = require('lodash/fp/fromPairs');

var _fromPairs2 = _interopRequireDefault(_fromPairs);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _last = require('lodash/fp/last');

var _last2 = _interopRequireDefault(_last);

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _flattenDeep = require('lodash/flattenDeep');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _property = require('lodash/property');

var _property2 = _interopRequireDefault(_property);

var _uniqueId = require('lodash/uniqueId');

var _uniqueId2 = _interopRequireDefault(_uniqueId);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _Modal = require('./Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  install: function install(Vue) {
    var modals = new _events2.default();
    var stack = [];
    /**
     * place this somewhere in your component hierarchy, modals will render here.
     * @function
     * @param {Boolean} disableLoadingIndicator - disable built-in loading indicator
     */
    Vue.component('modal-view', {
      render: function render(h) {
        var overlay = this.loading ? [h('div', {
          class: {
            'modal-loading': true
          },
          style: {
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'height': '100vh',
            'width': '100vw',
            'background-color': 'rgba(0, 0, 0, 0.5)',
            'text-align': 'center'
          }
        }, [h('i', {
          class: {
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true
          },
          style: {
            'font-size': '5em',
            'margin-top': '25%'
          }
        })])] : [];
        return h('div', {
          class: {
            'modal-view': true
          }
        }, overlay.concat((0, _map2.default)(function (options) {
          return h(_Modal2.default, {
            attrs: { id: options.id },
            props: {
              title: options.title,
              buttons: options.buttons,
              size: options.size,
              modals: modals,
              static: options.static
            },
            class: options.class
          }, [h(options.Modal, { props: options.props })]);
        })(this.modals)));
      },

      props: {
        disableLoadingIndicator: {
          type: Boolean,
          default: false
        }
      },
      data: function data() {
        return {
          modals: this.getModals(),
          loading: false
        };
      },

      methods: {
        getModals: function getModals() {
          return (0, _fromPairs2.default)(stack);
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this = this;

        /**
         *
         * @param method
         */
        var onDestroy = function onDestroy(method) {
          return function (_ref) {
            var id = _ref.id,
                result = _ref.result;

            var index = (0, _findIndex2.default)(function (modal) {
              return (0, _first2.default)(modal) === id;
            })(stack);
            if (stack[index]) {
              if (method === 'close') {
                stack[index][1].resolve(result);
              } else if (method === 'dismiss') {
                stack[index][1].reject(result);
              }
              stack.splice(index, 1);
              _this.modals = _this.getModals();
            }
          };
        };
        /**
         *
         * @param event
         */
        var onKeydown = function onKeydown(event) {
          if (event.keyCode == 27) {
            // eslint-disable-line eqeqeq
            try {
              var id = (0, _last2.default)(stack)[0];
              modals.emit('dismiss', id);
            } catch (e) {}
          }
        };
        /**
         * update modal data onOpen
         */
        modals.on('open', function () {
          _this.modals = _this.getModals();
        });
        /**
         * update loading state
         */
        modals.on('progress', function (loading) {
          _this.loading = loading;
        });
        /**
         * close the modal (resolve)
         */
        modals.on('close', onDestroy('close'));
        /**
         * dismiss the modal (reject)
         */
        modals.on('dismiss', onDestroy('dismiss'));
        /**
         * press escape to close
         */
        (0, _jquery2.default)(document).on('keydown', onKeydown);
        this._unsubscribe = function () {
          modals.off('open');
          modals.off('close');
          modals.off('dismiss');
          (0, _jquery2.default)(document).off('keydown', onKeydown);
        };
      },
      beforeDestroy: function beforeDestroy() {
        this._unsubscribe();
      }
    });
    /**
     * @param {object} options
     * @param {{label: string, key: any, class: string, reject: boolean}[]|boolean} options.buttons - define buttons to inject into the footer
     * @param {string|function} options.content - string, VueComponent, or async require
     * @param {object} options.props - data to pass into the modal instance
     * @param {string|null} options.title - modal title
     * @param {string|string[]|void} options.size - modal size (one of 'sm', 'lg', or 'full' or multiple in an array)
     * @param {string|null} options.static - modal dismissal options (one of null, 'backdrop', 'full')
     * @param {object|null} options.class - additional classes to add to the modal-dialog
     */
    Vue.prototype.$openModal = function (options) {
      var _this2 = this;

      if (!options.content) {
        throw new Error('options.content is a required argument!', options);
      }
      var result = _q2.default.defer();
      var status = { loading: true };
      var poll = setInterval(function () {
        modals.emit('progress', status.loading);
      }, 200);
      return {
        result: result.promise,
        mounted: _q2.default.Promise(function (resolve, reject) {
          try {
            (0, _utils.resolveContent)(options.content)(function (Modal) {
              status.loading = false;
              modals.emit('progress', status.loading);
              if ((0, _property2.default)('options.$modalOptions')(Modal)) {
                options = (0, _assign2.default)({}, Modal.options.$modalOptions, options);
              }
              if (options.buttons === undefined && (0, _isString2.default)(options.content)) {
                options.buttons = true;
              } else if (options.buttons === undefined) {
                options.buttons = false;
              }
              if (options.buttons === true) {
                options.buttons = [{ label: 'ok', key: 'ok', class: 'btn-primary' }];
              }
              if (options.props === undefined) {
                options.props = {};
              }
              if (options.static === undefined) {
                options.static = null;
              }
              if (options.title === undefined) {
                options.title = null;
              }
              if (options.class === undefined) {
                options.class = {};
              }
              var id = (0, _uniqueId2.default)('@citygro/vue-modal-');
              stack.push([id, {
                Modal: Modal,
                buttons: options.buttons,
                id: id,
                props: options.props,
                reject: result.reject,
                resolve: result.resolve,
                size: (0, _flattenDeep2.default)([options.size]),
                static: options.static,
                title: options.title,
                class: options.class
              }]);
              modals.emit('open', id);
              clearInterval(poll);
              _this2.$nextTick(function () {
                resolve(Modal);
              });
            });
          } catch (e) {
            reject(e);
          }
        })
      };
    };
  }
};