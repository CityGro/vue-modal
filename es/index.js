var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import map from 'lodash/fp/map';
import last from 'lodash/fp/last';
import flow from 'lodash/fp/flow';
import hash from 'object-hash';
import findIndex from 'lodash/fp/findIndex';
import EventEmmitter from 'events';
import $ from 'jquery';
import Q from 'q';

export default {
  install: function install(Vue, options) {
    var modals = new EventEmmitter();
    var _stack = [];
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

        var input = $(this.$el).find('.modal-wrapper').first();
        var onClick = function onClick(event) {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            _this.close();
          }
        };
        $(document).on('click', onClick);
        this._unsubscribe = function () {
          $(document).off('click', onClick);
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
        var modals = map(function (_ref) {
          var id = _ref.id,
              title = _ref.title,
              Modal = _ref.Modal,
              data = _ref.data;
          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title }
          }, [h(Modal, { props: data })]);
        });
        return h('div', null, flow(map(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              id = _ref3[0],
              modal = _ref3[1];

          return modal;
        }), modals)(this.stack));
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
            var index = findIndex(function (_ref4) {
              var _ref5 = _slicedToArray(_ref4, 1),
                  _id = _ref5[0];

              return id === _id;
            })(_stack);
            if (method === 'close') {
              _stack[index][1].resolve();
            } else if (method === 'dismiss') {
              _stack[index][1].reject();
            }
            delete _stack[index];
            _this2.$forceUpdate();
          };
        };
        var onKeydown = function onKeydown(event) {
          if (event.keyCode == 27) {
            // eslint-disable-line eqeqeq
            var id = last(_stack)[0];
            modals.emit('dismiss', id);
          }
        };
        modals.on('open', function (event) {
          _stack.push([event.id, event]);
          _this2.$forceUpdate();
        });
        modals.on('close', onDestroy('close'));
        modals.on('dismiss', onDestroy('dismiss'));
        $(document).on('keydown', onKeydown);
        this._unsubscribe = function () {
          modals.off('open');
          modals.off('close');
          modals.off('dismiss');
          $(document).off('keydown', onKeydown);
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
      var _ref6$title = _ref6.title,
          title = _ref6$title === undefined ? '' : _ref6$title,
          _ref6$data = _ref6.data,
          data = _ref6$data === undefined ? {} : _ref6$data,
          modal = _ref6.modal;

      return Q.Promise(function (resolve, reject) {
        modal(function (Modal) {
          var id = hash({ Modal: Modal, data: data });
          modals.emit('open', { id: id, title: title, Modal: Modal, data: data, resolve: resolve, reject: reject });
        });
      });
    };
  }
};