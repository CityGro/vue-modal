'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $ = _interopDefault(require('jquery'));
var EventEmmitter = _interopDefault(require('events'));
var Vue = _interopDefault(require('vue'));
var includes = _interopDefault(require('lodash/includes'));
var Q = _interopDefault(require('q'));
var assign = _interopDefault(require('lodash/assign'));
var clone = _interopDefault(require('lodash/clone'));
var findIndex = _interopDefault(require('lodash/fp/findIndex'));
var first = _interopDefault(require('lodash/fp/first'));
var flatten = _interopDefault(require('lodash/flattenDeep'));
var isString = _interopDefault(require('lodash/isString'));
var last = _interopDefault(require('lodash/fp/last'));
var toNumber = _interopDefault(require('lodash/toNumber'));
var uniqueId = _interopDefault(require('lodash/uniqueId'));
var isFunction = _interopDefault(require('lodash/isFunction'));
var property = _interopDefault(require('lodash/property'));

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
var ModalWrapper = Vue.component('cg-modal-wrapper', {
  name: 'cg-modal-wrapper',
  props: {
    modalId: {
      type: String,
      required: true
    },
    title: {
      required: false
    },
    buttons: {
      required: false
    },
    size: {
      type: Array
    },
    result: {
      type: Object,
      default: function _default() {
        return { key: 'ok' };
      }
    },
    instance: {
      type: Function
    },
    static: {
      default: false,
      required: false
    }
  },
  data: function data() {
    return {
      transition: false
    };
  },
  created: function created() {
    if (this.instance) {
      this.instance(this);
    }
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
      this.$emit('close', { id: this.modalId, result: result });
    },

    /**
     * close the modal (reject)
     * @param {{key: string}|string} result
     */
    dismiss: function dismiss(result) {
      if (result === undefined) {
        result = this.result;
      }
      this.$emit('dismiss', { id: this.modalId, result: result });
    }
  },
  render: function render(h) {
    var _this2 = this;

    var header = null;
    var footer = null;
    if (this.title) {
      // create header if a title is specified
      var headerContent = [];
      if (!this.static) {
        headerContent = [h('span', {
          attrs: {
            'aria-hidden': true
          },
          on: {
            click: function click() {
              if (!_this2.static) {
                _this2.dismiss();
              }
            }
          }
        }, '×')];
      }
      header = h('div', {
        class: {
          'modal-header': true
        }
      }, [h('button', {
        class: { 'close': true },
        attrs: {
          'aria-label': 'Close'
        }
      }, headerContent), h('h3', { class: { 'modal-title': true } }, this.title)]);
    }
    if (this.buttons) {
      // create footer if there are buttons defined
      footer = h('div', {
        class: {
          'modal-footer': true
        }
      }, this.buttons.map(function (button) {
        return h('button', {
          class: defineProperty({
            'btn': true
          }, button.class, true),
          ref: button.focus === true ? 'focus' : undefined,
          on: {
            click: function click(event) {
              if (event.x !== 0 && event.y !== 0) {
                if (button.reject) {
                  _this2.dismiss({ key: button.key, label: button.label });
                } else {
                  _this2.close({ key: button.key, label: button.label });
                }
              }
            }
          }
        }, button.label);
      }));
    }
    var content = this.$slots.default;
    if (header || footer) {
      content = [h('div', {
        class: {
          'modal-content': true
        }
      }, [header, h('div', { class: { 'modal-body': true } }, this.$slots.default), footer])];
    }
    return h('div', {
      class: {
        modal: true,
        fade: true,
        'in': this.transition
      },
      style: {
        display: 'flex'
      },
      on: {
        click: function click() {
          if (!_this2.static) {
            _this2.dismiss();
          }
        }
      }
    }, [h('div', {
      class: {
        'modal-dialog': true,
        'modal-lg': includes(this.size, 'lg'),
        'modal-sm': includes(this.size, 'sm'),
        'modal-full': includes(this.size, 'full'),
        'modal-tall': includes(this.size, 'tall')
      },
      on: {
        click: function click(event) {
          event.stopPropagation();
        }
      }
    }, content)]);
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
  } else if (isFunction(content)) {
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
        var viewOptions = {
          class: {
            'modal-view': true
          }
        };
        var wrappedModals = this.modals.map(function (options) {
          var componentOptions = {
            attrs: {
              id: options.id
            },
            on: {
              close: function close(event) {
                modals.emit('close', event);
              },
              dismiss: function dismiss(event) {
                modals.emit('dismiss', event);
              }
            },
            props: {
              modalId: options.id,
              title: options.title,
              buttons: options.buttons,
              size: options.size,
              instance: options.instance,
              static: options.static
            },
            class: options.class
          };
          var props = options.props;
          var children = [h(options.Modal, { props: props })];
          return h(ModalWrapper, componentOptions, children);
        });
        return h('div', viewOptions, wrappedModals);
      },
      data: function data() {
        return {
          modals: this.getModals(),
          loading: false
        };
      },

      methods: {
        getModals: function getModals() {
          return stack.map(function (_ref) {
            var _ref2 = slicedToArray(_ref, 2),
                id = _ref2[0],
                options = _ref2[1];

            return clone(options);
          });
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
          return function (_ref3) {
            var id = _ref3.id,
                result = _ref3.result;

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
              _this.$emit(method);
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
          _this.$emit('open');
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
    var $openModal = function $openModal(options) {
      if (!options.content) {
        throw new Error('options.content is a required argument!', options);
      }
      var result = Q.defer();
      var instance = Q.defer();
      var status = { loading: true };
      var poll = setInterval(function () {
        modals.emit('progress', status.loading);
      }, 10);
      return {
        result: result.promise,
        instance: instance.promise,
        close: function close(options) {
          var close = Q.defer();
          instance.promise.then(function (componentInstance) {
            close.resolve(componentInstance.close(options));
          });
          return close.promise;
        },
        dismiss: function dismiss(options) {
          var dismiss = Q.defer();
          instance.promise.then(function (componentInstance) {
            dismiss.resolve(componentInstance.dismiss(options));
          });
          return dismiss.promise;
        },
        mounted: Q.Promise(function (resolve, reject) {
          try {
            if (document.activeElement && document.activeElement.blur) {
              document.activeElement.blur();
            }
            resolveContent(options.content)(function (Modal) {
              Modal = Modal.default ? Modal.default : Modal;
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
                  instance: instance.resolve,
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
    Vue$$1.$openModal = $openModal;
    Vue$$1.mixin({
      methods: { $openModal: $openModal }
    });
    console.log('installed @citygro/vue-modal');
  }
};

module.exports = index;
