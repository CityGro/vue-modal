'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * style this component! use bootstrap 3 modal classes
 * @function
 * @param {string} id
 * @param {{}[]}
 */
exports.default = _vue2.default.component('cg-modal', {
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
    },
    static: {
      required: true
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
    }, [h('span', {
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
    var footer = this.buttons ? h('div', { class: { 'modal-footer': true } }, (0, _map2.default)(function (button) {
      return h('a', {
        class: _defineProperty({
          'btn': true
        }, button.class, true),
        on: {
          click: function click() {
            if (self.static !== 'all') {
              if (button.reject) {
                self.dismiss({ key: button.key });
              } else {
                self.close({ key: button.key });
              }
            }
          }
        }
      }, button.label);
    })(this.buttons)) : null;
    return h('div', {
      class: {
        modal: true,
        show: true
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
        'modal-lg': self.size === 'lg',
        'modal-sm': self.size === 'sm',
        'modal-full': self.size === 'full'
      },
      on: {
        click: function click(event) {
          event.stopPropagation();
        }
      }
    }, [h('div', {
      class: {
        'modal-content': true
      }
    }, header || footer ? [header, h('div', { class: { 'modal-body': true } }, [self.$slots.default]), footer] : self.$slots.default)])]);
  }
});