import map from 'lodash/fp/map';
import first from 'lodash/fp/first';
import last from 'lodash/fp/last';
import hash from 'object-hash';
import findIndex from 'lodash/fp/findIndex';
import EventEmmitter from 'events';
import fromPairs from 'lodash/fp/fromPairs';
import $ from 'jquery';
import Q from 'q';

export default {
  install: function install(Vue, options) {
    var modals = new EventEmmitter();
    var stack = [];
    /**
     * style this component! use bootstrap 3 modal classes
     * @function
     */
    var ModalWrapper = Vue.component('modal-wrapper', {
      render: function render(h) {
        var self = this;
        return h('div', {
          class: {
            modal: true,
            show: true
          }
        }, [h('div', {
          class: {
            'modal-dialog': true,
            'modal-lg': self.size === 'lg',
            'modal-sm': self.size === 'sm'
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
        }, '×')]), h('h3', { class: { 'modal-title': true } }, self.title)]), h('div', { class: { 'modal-body': true } }, [self.$slots.default]), h('div', { class: { 'modal-footer': true } }, [h('button', {
          class: {
            'btn': true,
            'btn-primary': true
          },
          on: {
            click: self.close
          }
        }, self.confirmationLabel)])])])]);
      },

      props: {
        id: {
          type: String,
          required: true
        },
        title: {
          type: String,
          required: true
        },
        confirmationLabel: {
          type: String,
          required: true
        },
        size: {
          type: String
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
      beforeCreate: function beforeCreate() {
        var _this = this;

        modals.on('open', function () {
          _this.$forceUpdate();
        });
      },
      mounted: function mounted() {
        var _this2 = this;

        var input = $(this.$el).find('.modal-dialog').first();
        var onClick = function onClick(event) {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            _this2.close();
          }
        };
        setTimeout(function () {
          $(document).on('click', onClick);
        }, 0);
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
        return h('div', null, map(function (_ref) {
          var id = _ref.id,
              title = _ref.title,
              confirmationLabel = _ref.confirmationLabel,
              size = _ref.size,
              Modal = _ref.Modal,
              data = _ref.data;

          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title, confirmationLabel: confirmationLabel, size: size }
          }, [h(Modal, { props: data })]);
        })(this.modals));
      },
      data: function data() {
        return { modal: this.getModals() };
      },

      methods: {
        getModals: function getModals() {
          return fromPairs(stack);
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this3 = this;

        var onDestroy = function onDestroy(method) {
          return function (id) {
            var index = findIndex(function (modal) {
              return first(modal) === id;
            })(stack);
            if (stack[index]) {
              if (method === 'close') {
                stack[index][1].resolve();
              } else if (method === 'dismiss') {
                stack[index][1].reject();
              }
              stack.splice(index, 1);
              _this3.modals = _this3.getModals();
              _this3.$forceUpdate();
            }
          };
        };
        var onKeydown = function onKeydown(event) {
          if (event.keyCode == 27) {
            // eslint-disable-line eqeqeq
            try {
              var id = last(stack)[0];
              modals.emit('dismiss', id);
            } catch (e) {}
          }
        };
        modals.on('open', function () {
          _this3.modals = _this3.getModals();
          _this3.$forceUpdate();
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
     * @param {string} options.confirmationLabel - label for confirmation button
     */
    Vue.prototype.$openModal = function (_ref2) {
      var _ref2$title = _ref2.title,
          title = _ref2$title === undefined ? '' : _ref2$title,
          _ref2$confirmationLab = _ref2.confirmationLabel,
          confirmationLabel = _ref2$confirmationLab === undefined ? 'okay' : _ref2$confirmationLab,
          _ref2$size = _ref2.size,
          size = _ref2$size === undefined ? '' : _ref2$size,
          _ref2$data = _ref2.data,
          data = _ref2$data === undefined ? {} : _ref2$data,
          modal = _ref2.modal;

      return Q.Promise(function (resolve, reject) {
        modal(function (Modal) {
          var id = hash({ Modal: Modal, data: data });
          stack.push([id, { id: id, title: title, confirmationLabel: confirmationLabel, size: size, Modal: Modal, data: data, resolve: resolve, reject: reject }]);
          modals.emit('open', id);
        });
      });
    };
  }
};