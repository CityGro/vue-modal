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
  install: function install(Vue) {
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
            'modal-sm': self.size === 'sm',
            'modal-full': self.size === 'full'
          }
        }, [h('div', {
          class: {
            'modal-content': true
          }
        }, self.ignoreScaffolding ? [self.$slots.default] : [h('div', {
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
        },
        ignoreScaffolding: {
          type: Boolean,
          default: false
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

        var input = $(this.$el).find('.modal-dialog').first();
        /**
         *
         * @param event
         */
        var onClick = function onClick(event) {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            _this.close();
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
        return h('div', null, overlay.concat(map(function (_ref) {
          var id = _ref.id,
              title = _ref.title,
              confirmationLabel = _ref.confirmationLabel,
              ignoreScaffolding = _ref.ignoreScaffolding,
              size = _ref.size,
              Modal = _ref.Modal,
              data = _ref.data;

          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title, confirmationLabel: confirmationLabel, size: size, ignoreScaffolding: ignoreScaffolding }
          }, [h(Modal, { props: data })]);
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
          return fromPairs(stack);
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this2 = this;

        /**
         *
         * @param method
         */
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
              _this2.modals = _this2.getModals();
              _this2.$forceUpdate();
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
              var id = last(stack)[0];
              modals.emit('dismiss', id);
            } catch (e) {}
          }
        };
        /**
         * update modal data onOpen
         */
        modals.on('open', function () {
          _this2.modals = _this2.getModals();
        });
        /**
         * update loading state
         */
        modals.on('progress', function (loading) {
          _this2.loading = _this2.loading || loading;
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
     * @param {boolean} options.ignoreScaffolding - do not include header or footer elements
     * @param {function} options.modal - async require
     * @param {object} options.data - data to pass into the modal instance
     * @param {string} options.confirmationLabel - label for confirmation button
     * @param {string} options.title - modal title
     */
    Vue.prototype.$openModal = function (_ref2) {
      var _ref2$confirmationLab = _ref2.confirmationLabel,
          confirmationLabel = _ref2$confirmationLab === undefined ? 'okay' : _ref2$confirmationLab,
          _ref2$data = _ref2.data,
          data = _ref2$data === undefined ? {} : _ref2$data,
          _ref2$ignoreScaffoldi = _ref2.ignoreScaffolding,
          ignoreScaffolding = _ref2$ignoreScaffoldi === undefined ? false : _ref2$ignoreScaffoldi,
          modal = _ref2.modal,
          _ref2$size = _ref2.size,
          size = _ref2$size === undefined ? '' : _ref2$size,
          _ref2$title = _ref2.title,
          title = _ref2$title === undefined ? '' : _ref2$title;

      return Q.Promise(function (resolve, reject, notify) {
        var status = { loading: true };
        var poll = setInterval(function () {
          notify(status);
          modals.emit('progress', status.loading);
        }, 100);
        try {
          modal(function (Modal) {
            status.loading = false;
            var id = hash({ Modal: Modal, data: data });
            resolve({
              modal: Modal,
              result: Q.Promise(function (resolve, reject) {
                stack.push([id, { id: id, title: title, confirmationLabel: confirmationLabel, size: size, ignoreScaffolding: ignoreScaffolding, Modal: Modal, data: data, resolve: resolve, reject: reject }]);
                modals.emit('open', id);
                clearInterval(poll);
              })
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    };
  }
};