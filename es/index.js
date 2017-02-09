import map from 'lodash/fp/map';
import without from 'lodash/fp/without';
import first from 'lodash/fp/first';
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
        var self = this;
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
        return h('div', null, flow(map(function (item) {
          return last(item);
        }), without([undefined, null]), modals)(self.stack));
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
            var index = findIndex(function (modal) {
              return first(modal) === id;
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
    Vue.prototype.$openModal = function (_ref2) {
      var _ref2$title = _ref2.title,
          title = _ref2$title === undefined ? '' : _ref2$title,
          _ref2$data = _ref2.data,
          data = _ref2$data === undefined ? {} : _ref2$data,
          modal = _ref2.modal;

      return Q.Promise(function (resolve, reject) {
        modal(function (Modal) {
          var id = hash({ Modal: Modal, data: data });
          modals.emit('open', { id: id, title: title, Modal: Modal, data: data, resolve: resolve, reject: reject });
        });
      });
    };
  }
};