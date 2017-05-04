'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var findIndex = _interopDefault(require('lodash/fp/findIndex'));
var first = _interopDefault(require('lodash/fp/first'));
var fromPairs = _interopDefault(require('lodash/fp/fromPairs'));
var isString = _interopDefault(require('lodash/isString'));
var last = _interopDefault(require('lodash/fp/last'));
var map = _interopDefault(require('lodash/fp/map'));
var flatten = _interopDefault(require('lodash/flattenDeep'));
var assign = _interopDefault(require('lodash/assign'));
var property = _interopDefault(require('lodash/property'));
var uniqueId = _interopDefault(require('lodash/uniqueId'));
var toNumber = _interopDefault(require('lodash/toNumber'));
var EventEmmitter = _interopDefault(require('events'));
var $ = _interopDefault(require('jquery'));
var Q = _interopDefault(require('q'));
var Vue = _interopDefault(require('vue'));
var includes = _interopDefault(require('lodash/fp/includes'));

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/**
 * style this component! use bootstrap 3 modal classes
 * @function
 * @param {string} id
 * @param {{}[]}
 */
var ModalWrapper = Vue.component('cg-modal', {
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
      transition: false
    };
  },
  mounted: function mounted() {
    var _this = this;

    setTimeout(function () {
      _this.transition = true;
    }, 150);
    if (this.$refs.focus && this.$refs.focus.focus) {
      this.$refs.focus.focus();
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.transition = false;
  },

  methods: {
    /**
     * close the modal (resolve)
     * @param {{key: string}|string} result
     */
    close: function close(result) {
      if (result === undefined) {
        result = this.result;
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
      }
      this.modals.emit('dismiss', { id: this.id, result: result });
    }
  },
  render: function render(h) {
    var self = this;
    // create header if a title is specified
    var header = this.title ? h('div', {
      class: {
        'modal-header': true
      }
    }, [h('button', {
      class: { 'close': true },
      attrs: {
        'aria-label': 'Close'
      }
    }, self.static ? [] : [h('span', {
      attrs: {
        'aria-hidden': true
      },
      on: {
        click: function click() {
          if (!self.static) {
            self.dismiss();
          }
        }
      }
    }, '×')]), h('h3', { class: { 'modal-title': true } }, self.title)]) : null;
    // create footer if there are buttons defined
    var footer = this.buttons ? h('div', { class: { 'modal-footer': true } }, map(function (button) {
      return h('button', {
        class: defineProperty({
          'btn': true
        }, button.class, true),
        ref: button.focus === true ? 'focus' : undefined,
        on: {
          click: function click(event) {
            if (event.x !== 0 && event.y !== 0) {
              if (button.reject) {
                self.dismiss({ key: button.key, label: button.label });
              } else {
                self.close({ key: button.key, label: button.label });
              }
            }
          }
        }
      }, button.label);
    })(this.buttons)) : null;
    return h('div', {
      class: {
        modal: true,
        fade: true,
        'in': self.transition
      },
      style: {
        display: 'flex'
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

var ContentWrapper = (function (content) {
  return Vue.component('cg-content-wrapper', {
    name: 'cg-content-wrapper',
    render: function render(h) {
      return h('p', null, content);
    }
  });
});

/**
 * wraps string and VueComponents in an async require compatible callback function
 *
 * @param {string|function} content
 * @returns {function}
 */
var resolveContent = function resolveContent(content) {
  if (isString(content)) {
    return function (cb) {
      return cb(ContentWrapper(content));
    };
  } else if (typeof content === 'function') {
    if (content.name === 'VueComponent') {
      return function (cb) {
        return cb(content);
      };
    } else {
      return content;
    }
  }
};

var getOptions = function getOptions(Modal) {
  var options = property('$modalOptions')(Modal);
  if (!options) {
    options = property('options.$modalOptions')(Modal);
  }
  if (!options) {
    options = {};
  }
  return options;
};

var index = {
  install: function install(Vue$$1) {
    var modals = new EventEmmitter();
    var stack = [];
    /**
     * place this somewhere in your component hierarchy, modals will render here.
     * @function
     * @param {Boolean} disableLoadingIndicator - disable built-in loading indicator
     */
    Vue$$1.component('modal-view', {
      render: function render(h) {
        return h('div', {
          class: {
            'modal-view': true
          }
        }, map(function (options) {
          return h(ModalWrapper, {
            attrs: { id: options.id },
            props: {
              title: options.title,
              buttons: options.buttons,
              size: options.size,
              modals: modals,
              static: options.static
            },
            class: options.class
          }, [h(options.Modal, { props: options.props })]);
        })(this.modals));
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
         * destroy the specified modal
         * @param method
         */
        var onDestroy = function onDestroy(method) {
          return function (_ref) {
            var id = _ref.id,
                result = _ref.result;

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
            }
          };
        };
        /**
         * close the topmost modal when ESC is pressed
         * @param event
         */
        var onKeydown = function onKeydown(event) {
          if (stack.length) {
            var _last = last(stack),
                _last2 = slicedToArray(_last, 2),
                id = _last2[0],
                options = _last2[1];

            switch (toNumber(event.keyCode)) {
              case 27:
                if (!options.static) {
                  modals.emit('dismiss', { id: id });
                }
                break;
            }
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
          _this.loading = loading;
          _this.$emit('progress', _this.loading);
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
          modals.removeAllListeners('open');
          modals.removeAllListeners('close');
          modals.removeAllListeners('dismiss');
          $(document).off('keydown', onKeydown);
        };
      },
      beforeDestroy: function beforeDestroy() {
        this._unsubscribe();
      }
    });
    /**
     * @param {object} options
     * @param {{label: string, key: any, class: string, reject: boolean}[]|boolean} options.buttons - define buttons to inject into the footer
     * @param {string|function} options.content - string, VueComponent, or async require
     * @param {object} options.props - data to pass into the modal instance
     * @param {string|null} options.title - modal title
     * @param {string|string[]|void} options.size - modal size (one of 'sm', 'lg', or 'full' or multiple in an array)
     * @param {boolean} [options.static=false] - force interaction to dismiss
     * @param {object|null} options.class - additional classes to add to the modal-dialog
     */
    var openModal = function openModal(options) {
      if (!options.content) {
        throw new Error('options.content is a required argument!', options);
      }
      var result = Q.defer();
      var status = { loading: true };
      var poll = setInterval(function () {
        modals.emit('progress', status.loading);
      }, 10);
      return {
        result: result.promise,
        mounted: Q.Promise(function (resolve, reject) {
          try {
            resolveContent(options.content)(function (Modal) {
              status.loading = false;
              modals.emit('progress', status.loading);
              clearInterval(poll);
              options = assign({}, getOptions(Modal), options);
              if (options.buttons === undefined && isString(options.content)) {
                options.buttons = true;
              } else if (options.buttons === undefined) {
                options.buttons = false;
              }
              if (options.buttons === true) {
                options.buttons = [{ label: 'ok', key: 'ok', class: 'btn-primary', focus: true }];
              }
              if (options.props === undefined) {
                options.props = {};
              }
              if (options.static === undefined) {
                options.static = false;
              } else {
                options.static = !!options.static;
              }
              if (options.title === undefined) {
                options.title = null;
              }
              if (options.class === undefined) {
                options.class = {};
              }
              var id = uniqueId();
              resolve(Modal);
              setTimeout(function () {
                stack.push([id, {
                  Modal: Modal,
                  buttons: options.buttons,
                  class: options.class,
                  id: id,
                  props: options.props,
                  reject: result.reject,
                  resolve: result.resolve,
                  size: flatten([options.size]),
                  static: options.static,
                  title: options.title
                }]);
                modals.emit('open', id);
              }, 0);
            });
          } catch (e) {
            reject(e);
          }
        })
      };
    };
    Vue$$1.$openModal = openModal;
    Vue$$1.prototype.$openModal = openModal;
  }
};

module.exports = index;
