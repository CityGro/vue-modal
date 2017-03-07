function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Vue from 'vue';
import map from 'lodash/fp/map';
import includes from 'lodash/fp/includes';

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
      type: Array
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
    },
    static: {
      required: true
    }
  },
  data: function data() {
    return {
      loading: true
    };
  },
  mounted: function mounted() {
    this.loading = false;
  },

  methods: {
    /**
     * close the modal (resolve)
     * @param {{key: string}|string} result
     */
    close: function close(result) {
      if (result === undefined) {
        result = this.result;
      } else {
        result = { key: result };
      }
      this.modals.emit('close', { id: this.id, result: result });
    },

    /**
     * close the modal (reject)
     * @param {{key: string}|string} result
     */
    dismiss: function dismiss(result) {
      if (result === undefined) {
        result = this.result;
      } else {
        result = { key: result };
      }
      this.modals.emit('dismiss', { id: this.id, result: result });
    }
  },
  render: function render(h) {
    var self = this;
    var header = this.title ? h('div', {
      class: {
        'modal-header': true
      }
    }, [h('a', {
      class: { 'close': true },
      attrs: {
        'aria-label': 'Close'
      }
    }, self.static === 'all' ? [] : [h('span', {
      attrs: {
        'aria-hidden': true
      },
      on: {
        click: function click() {
          if (self.static !== 'all') {
            self.dismiss();
          }
        }
      }
    }, '×')]), h('h3', { class: { 'modal-title': true } }, self.title)]) : null;
    var footer = this.buttons ? h('div', { class: { 'modal-footer': true } }, map(function (button) {
      return h('a', {
        class: _defineProperty({
          'btn': true
        }, button.class, true),
        on: {
          click: function click() {
            if (button.reject) {
              self.dismiss({ key: button.key, label: button.label });
            } else {
              self.close({ key: button.key, label: button.label });
            }
          }
        }
      }, button.label);
    })(this.buttons)) : null;
    return h('div', {
      class: {
        modal: true,
        fade: self.loading,
        show: !self.loading
      },
      on: {
        click: function click() {
          if (!self.static) {
            self.dismiss();
          }
        }
      }
    }, [h('div', {
      class: {
        'modal-dialog': true,
        'modal-lg': includes('lg')(self.size),
        'modal-sm': includes('sm')(self.size),
        'modal-full': includes('full')(self.size),
        'modal-tall': includes('tall')(self.size)
      },
      on: {
        click: function click(event) {
          event.stopPropagation();
        }
      }
    }, [header || footer ? h('div', {
      class: {
        'modal-content': true
      }
    }, [header, h('div', { class: { 'modal-body': true } }, [self.$slots.default]), footer]) : self.$slots.default])]);
  }
});