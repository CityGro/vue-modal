import map from 'lodash/fp/map';
import first from 'lodash/fp/first';
import last from 'lodash/fp/last';
import hash from 'object-hash';
import findIndex from 'lodash/fp/findIndex';
import EventEmmitter from 'events';
import fromPairs from 'lodash/fp/fromPairs';
import $ from 'jquery';
import Q from 'q';

import ModalWrapper from './Modal';
import { resolveContent } from './utils';

export default {
  install: function install(Vue) {
    var modals = new EventEmmitter();
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
        return h('div', null, overlay.concat(map(function (_ref) {
          var id = _ref.id,
              title = _ref.title,
              buttons = _ref.buttons,
              size = _ref.size,
              Modal = _ref.Modal,
              props = _ref.props;

          return h(ModalWrapper, {
            attrs: { id: id },
            props: { title: title, buttons: buttons, size: size, modals: modals }
          }, [h(Modal, { props: props })]);
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
        var _this = this;

        /**
         *
         * @param method
         */
        var onDestroy = function onDestroy(method) {
          return function (_ref2) {
            var id = _ref2.id,
                result = _ref2.result;

            var index = findIndex(function (modal) {
              return first(modal) === id;
            })(stack);
            if (stack[index]) {
              if (method === 'close') {
                stack[index][1].resolve(result);
              } else if (method === 'dismiss') {
                stack[index][1].reject(result);
              }
              stack.splice(index, 1);
              _this.modals = _this.getModals();
              _this.$forceUpdate();
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
          _this.modals = _this.getModals();
        });
        /**
         * update loading state
         */
        modals.on('progress', function (loading) {
          _this.loading = _this.loading || loading;
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
     * @param {{}[]} options.buttons - define buttons to inject into the footer
     * @param {string|function|object} options.content - async require
     * @param {object} options.props - data to pass into the modal instance
     * @param {string} options.title - modal title
     * @param {string} options.size - modal size (one of 'sm', 'lg', or 'full')
     */
    Vue.prototype.$openModal = function (_ref3) {
      var _this2 = this;

      var _ref3$buttons = _ref3.buttons,
          buttons = _ref3$buttons === undefined ? true : _ref3$buttons,
          _ref3$props = _ref3.props,
          props = _ref3$props === undefined ? {} : _ref3$props,
          content = _ref3.content,
          _ref3$size = _ref3.size,
          size = _ref3$size === undefined ? '' : _ref3$size,
          _ref3$title = _ref3.title,
          title = _ref3$title === undefined ? null : _ref3$title;

      if (!content) {
        throw new Error('options.content is a required argument!', content);
      }
      if (buttons === true) {
        buttons = [{ label: 'ok', key: 'ok', class: 'btn-primary' }];
      }
      var result = Q.defer();
      var status = { loading: true };
      var poll = setInterval(function () {
        modals.emit('progress', status.loading);
      }, 200);
      return {
        result: result.promise,
        mounted: Q.Promise(function (resolve, reject) {
          try {
            resolveContent(content)(function (Modal) {
              status.loading = false;
              var id = hash({ Modal: Modal, props: props });
              stack.push([id, {
                id: id,
                title: title,
                buttons: buttons,
                size: size,
                Modal: Modal,
                props: props,
                resolve: result.resolve,
                reject: result.reject
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