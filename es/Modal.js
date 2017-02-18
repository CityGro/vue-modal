function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import $ from 'jquery';
import Vue from 'vue';
import map from 'lodash/fp/map';

/**
 * style this component! use bootstrap 3 modal classes
 * @function
 * @param {string} id
 * @param {{}[]}
 */
export default Vue.component('cg-modal', {
  name: 'cg-modal',
  props: {
    id: {
      type: String,
      required: true
    },
    title: {
      required: true
    },
    buttons: {
      required: true
    },
    size: {
      type: String
    },
    modals: {
      type: Object,
      required: true
    },
    result: {
      type: Object,
      default: function _default() {
        return { key: 'ok' };
      }
    }
  },
  methods: {
    close: function close(result) {
      result = result || this.result;
      this.modals.emit('close', { id: this.id, result: result });
    },
    dismiss: function dismiss(result) {
      result = result || this.result;
      this.modals.emit('dismiss', { id: this.id, result: result });
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
  },
  render: function render(h) {
    var self = this;
    var header = this.title ? h('div', {
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
        click: function click() {
          return self.dismiss();
        }
      }
    }, '×')]), h('h3', { class: { 'modal-title': true } }, self.title)]) : null;
    var footer = this.buttons ? h('div', { class: { 'modal-footer': true } }, map(function (button) {
      return h('button', {
        class: _defineProperty({
          'btn': true
        }, button.class, true),
        on: {
          click: button.reject ? function () {
            return self.dismiss({ key: button.key });
          } : function () {
            return self.close({ key: button.key });
          }
        }
      }, button.label);
    })(this.buttons)) : null;
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
    }, header || footer ? [header, h('div', { class: { 'modal-body': true } }, [self.$slots.default]), footer] : self.$slots.default)])]);
  }
});