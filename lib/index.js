'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _without = require('lodash/fp/without');

var _without2 = _interopRequireDefault(_without);

var _first = require('lodash/fp/first');

var _first2 = _interopRequireDefault(_first);

var _last = require('lodash/fp/last');

var _last2 = _interopRequireDefault(_last);

var _flow = require('lodash/fp/flow');

var _flow2 = _interopRequireDefault(_flow);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _findIndex = require('lodash/fp/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  install: function install(Vue, options) {
    var modals = new _events2.default();
    var _stack = [];
    /**
     * style this component! use `.modal`, `.modal-container`, and `.modal-wrapper`
     * @function
     */
    var ModalWrapper = Vue.component('modal-wrapper', {
      render: function render(h) {
        var self = this;
        return h('div', {
          class: {
            modal: true
          }
        }, [h('div', {
          class: {
            'modal-dialog': true
          }
        }, [h('div', {
          class: {
            'modal-content': true
          }
        }, [h('div', {
          class: {
            'modal-header': true
          }
        }, [h('button', {
          class: { 'close': true },
          attrs: {
            'type': 'button',
            'aria-label': 'Close'
          }
        }, [h('span', {
          attrs: {
            'aria-hidden': true
          },
          on: {
            click: self.dismiss
          }
        }, '×')]), h('h4', { class: { 'modal-title': true } }, this.title)]), h('div', { class: { 'modal-body': true } }, [self.$slots.default]), h('div', { class: { 'modal-footer': true } }, [h('button', {
          class: {
            'btn': true,
            'btn-default': true
          },
          on: {
            click: self.dismiss
          }
        }, 'Close'), h('button', {
          class: {
            'btn': true,
            'btn-primary': true
          },
          on: {
            click: self.close
          }
        }, 'OK')])])])]);
      },

      props: {
        id: {
          type: String,
          required: true
        },
        title: {
          type: String,
          required: true
        }
      },
      methods: {
        close: function close() {
          modals.emit('close', this.id);
        },
        dismiss: function dismiss() {
          modals.emit('dismiss', this.id);
        }
      },
      mounted: function mounted() {
        var _this = this;

        var input = (0, _jquery2.default)(this.$el).find('.modal-wrapper').first();
        var onClick = function onClick(event) {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            _this.close();
          }
        };
        (0, _jquery2.default)(document).on('click', onClick);
        this._unsubscribe = function () {
          (0, _jquery2.default)(document).off('click', onClick);
        };
      },
      beforeDestroy: function beforeDestroy() {
        this._unsubscribe();
      }
    });
    /**
     * place this somewhere in your component hierarchy, modals will render here.
     * @function
     */
    Vue.component('modal-view', {
      render: function render(h) {
        var self = this;
        var modals = (0, _map2.default)(function (_ref) {
          var id = _ref.id,
              title = _ref.title,
              Modal = _ref.Modal,
              data = _ref.data;
          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title }
          }, [h(Modal, { props: data })]);
        });
        return h('div', null, (0, _flow2.default)((0, _map2.default)(function (item) {
          return (0, _last2.default)(item);
        }), (0, _without2.default)([undefined, null]), modals)(self.stack));
      },

      computed: {
        stack: function stack() {
          return _stack;
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this2 = this;

        var onDestroy = function onDestroy(method) {
          return function (id) {
            var index = (0, _findIndex2.default)(function (modal) {
              return (0, _first2.default)(modal) === id;
            })(_stack);
            if (_stack[index]) {
              if (method === 'close') {
                _stack[index][1].resolve();
              } else if (method === 'dismiss') {
                _stack[index][1].reject();
              }
              delete _stack[index];
              _this2.$forceUpdate();
            }
          };
        };
        var onKeydown = function onKeydown(event) {
          if (event.keyCode == 27) {
            // eslint-disable-line eqeqeq
            var id = (0, _last2.default)(_stack)[0];
            modals.emit('dismiss', id);
          }
        };
        modals.on('open', function (event) {
          _stack.push([event.id, event]);
          _this2.$forceUpdate();
        });
        modals.on('close', onDestroy('close'));
        modals.on('dismiss', onDestroy('dismiss'));
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
     * @param {object} options.data - data to pass into the modal instance
     * @param {function} options.modal - async require
     * @param {string} options.title - modal title
     */
    Vue.prototype.$openModal = function (_ref2) {
      var _ref2$title = _ref2.title,
          title = _ref2$title === undefined ? '' : _ref2$title,
          _ref2$data = _ref2.data,
          data = _ref2$data === undefined ? {} : _ref2$data,
          modal = _ref2.modal;

      return _q2.default.Promise(function (resolve, reject) {
        modal(function (Modal) {
          var id = (0, _objectHash2.default)({ Modal: Modal, data: data });
          modals.emit('open', { id: id, title: title, Modal: Modal, data: data, resolve: resolve, reject: reject });
        });
      });
    };
  }
};