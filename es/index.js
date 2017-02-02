import map from 'lodash/fp/map';
import hash from 'object-hash';
import values from 'lodash/fp/values';
import EventEmmitter from 'events';
import $ from 'jquery';

export default {
  install: function install(Vue, options) {
    var modals = new EventEmmitter();
    /**
     * style this component! use `.modal`, `.modal-container`, and `.modal-wrapper`
     * @function
     */
    var ModalWrapper = Vue.component('modal-wrapper', {
      // eslint-disable-line no-unused-vars
      render: function render(h) {
        return h('div', { class: { modal: true } }, [h('div', { class: { 'modal-container': true } }, [h('div', { class: { 'modal-wrapper': true } }, [this.$slots.default])])]);
      },

      props: {
        id: {
          type: String,
          required: true
        }
      },
      methods: {
        close: function close() {
          modals.emit('destroy', this.id);
        }
      },
      mounted: function mounted() {
        var _this = this;

        var input = $(this.$el).find('.modal-wrapper').first();
        var onClick = function onClick(event) {
          if (!input.is(event.target) && input.has(event.target).length === 0 && _this.showDropdown) {
            _this.close();
          }
        };
        $(document).on('click', onClick);
        var onKeydown = function onKeydown(event) {
          if (_this.showDropdown && event.keyCode === 27) {
            _this.close();
          }
        };
        $(document).on('keydown', onKeydown);
        this._unsubscribe = function () {
          $(document).off('click', onClick);
          $(document).off('keydown', onKeydown);
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
              id = _ref.id;
          return h(ModalWrapper, {
            attrs: { id: id }
          }, [h(Modal, { props: data })]);
        });
        return h('div', null, modals(values(this.modals)));
      },
      data: function data() {
        return { modals: {} };
      },

      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate: function beforeCreate() {
        var _this2 = this;

        var onOpen = function onOpen(event) {
          Vue.set(_this2.modals, event.id, event);
        };
        modals.on('open', onOpen);
        var onDestroy = function onDestroy(id) {
          Vue.delete(_this2.modals, id);
        };
        modals.on('destroy', onDestroy);
        this._unsubscribe = function () {
          modals.off('open', onOpen);
          modals.off('destroy', onDestroy);
        };
      },
      beforeDestroy: function beforeDestroy() {
        this._unsubscribe();
      }
    });
    /**
     * @param {Object} options
     * @param {Object} options.data - data to pass into the modal instance
     * @param {Function} options.modal - async require
     */
    Vue.prototype.$openModal = function (_ref2) {
      var _ref2$data = _ref2.data,
          data = _ref2$data === undefined ? {} : _ref2$data,
          modal = _ref2.modal;

      modal(function (Modal) {
        modals.emit('open', { Modal: Modal, data: data, id: hash({ Modal: Modal, data: data }) });
      });
    };
  }
};