var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import map from 'lodash/fp/map';
import keyBy from 'lodash/fp/keyBy';
import last from 'lodash/fp/last';
import hash from 'object-hash';
import findIndex from 'lodash/fp/findIndex';
import values from 'lodash/fp/values';
import EventEmmitter from 'events';
import $ from 'jquery';
import Q from 'q';

export default {
  install: function install(Vue, options) {
    var modals = new EventEmmitter();
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
          var Modal = _ref.Modal,
              data = _ref.data,
              id = _ref.id,
              title = _ref.title;
          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title }
          }, [h(Modal, { props: data })]);
        });
        return h('div', null, modals(values(this.modals)));
      },

      computed: {
        modals: function modals() {
          return keyBy(function (_ref2) {
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
            var index = findIndex(function (_ref4) {
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
            var id = last(stack)[0];
            modals.emit('dismiss', id);
          }
        };
        modals.on('open', function (event) {
          return stack.push([event.id, event]);
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
      var _ref6$data = _ref6.data,
          data = _ref6$data === undefined ? {} : _ref6$data,
          modal = _ref6.modal;

      return Q.Promise(function (resolve, reject, notify) {
        modal(function (Modal) {
          var id = hash({ Modal: Modal, data: data });
          notify(id);
          modals.emit('open', { id: id, Modal: Modal, data: data, resolve: resolve, reject: reject });
        });
      });
    };
  }
};