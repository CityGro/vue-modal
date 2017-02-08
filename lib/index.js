'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _keyBy = require('lodash/fp/keyBy');

var _keyBy2 = _interopRequireDefault(_keyBy);

var _last = require('lodash/fp/last');

var _last2 = _interopRequireDefault(_last);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _findIndex = require('lodash/fp/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

var _values = require('lodash/fp/values');

var _values2 = _interopRequireDefault(_values);

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
    var stack = [];
    /**
     * style this component! use `.modal`, `.modal-container`, and `.modal-wrapper`
     * @function
     */
    var ModalWrapper = Vue.component('modal-wrapper', {
      render: function render(h) {
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
            click: this.dismiss()
          }
        }, '×')]), h('h4', { class: { 'modal-title': true } }, this.title)]), h('div', { class: { 'modal-body': true } }, [this.$slots.default]), h('div', { class: { 'modal-footer': true } }, [h('button', {
          class: {
            'btn': true,
            'btn-default': true
          },
          on: {
            click: this.dismiss()
          }
        }, 'Close'), h('button', {
          class: {
            'btn': true,
            'btn-primary': true
          },
          on: {
            click: this.close()
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
        var modals = (0, _map2.default)(function (_ref) {
          var Modal = _ref.Modal,
              data = _ref.data,
              id = _ref.id,
              title = _ref.title;
          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title }
          }, [h(Modal, { props: data })]);
        });
        return h('div', null, modals((0, _values2.default)(this.modals)));
      },

      computed: {
        modals: function modals() {
          return (0, _keyBy2.default)(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 1),
                id = _ref3[0];

            return id;
          })(stack);
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this2 = this;

        var onDestroy = function onDestroy(method) {
          return function (id) {
            var index = (0, _findIndex2.default)(function (_ref4) {
              var _ref5 = _slicedToArray(_ref4, 1),
                  _id = _ref5[0];

              return id === _id;
            })(stack);
            if (method === 'close') {
              stack[index][1].resolve();
            } else if (method === 'dismiss') {
              stack[index][1].reject();
            }
            delete stack[index];
            _this2.$forceUpdate();
          };
        };
        var onKeydown = function onKeydown(event) {
          if (event.keyCode == 27) {
            // eslint-disable-line eqeqeq
            var id = (0, _last2.default)(stack)[0];
            modals.emit('dismiss', id);
          }
        };
        modals.on('open', function (event) {
          return stack.push([event.id, event]);
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
    Vue.prototype.$openModal = function (_ref6) {
      var _ref6$data = _ref6.data,
          data = _ref6$data === undefined ? {} : _ref6$data,
          modal = _ref6.modal;

      return _q2.default.Promise(function (resolve, reject, notify) {
        modal(function (Modal) {
          var id = (0, _objectHash2.default)({ Modal: Modal, data: data });
          notify(id);
          modals.emit('open', { id: id, Modal: Modal, data: data, resolve: resolve, reject: reject });
        });
      });
    };
  }
};