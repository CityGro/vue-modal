import map from 'lodash/fp/map'
import first from 'lodash/fp/first'
import last from 'lodash/fp/last'
import hash from 'object-hash'
import findIndex from 'lodash/fp/findIndex'
import EventEmmitter from 'events'
import fromPairs from 'lodash/fp/fromPairs'
import $ from 'jquery'
import Q from 'q'

export default {
  install (Vue) {
    const modals = new EventEmmitter()
    let stack = []
    /**
     * style this component! use bootstrap 3 modal classes
     * @function
     */
    const ModalWrapper = Vue.component('modal-wrapper', {
      render (h) {
        const self = this
        return h('div', {
          class: {
            modal: true,
            show: true
          }
        }, [
          h('div', {
            class: {
              'modal-dialog': true,
              'modal-lg': self.size === 'lg',
              'modal-sm': self.size === 'sm',
              'modal-full': self.size === 'full'
            }
          }, [
            h('div', {
              class: {
                'modal-content': true
              }
            }, (self.ignoreScaffolding) ? [self.$slots.default] : [
              h('div', {
                class: {
                  'modal-header': true
                }
              }, [
                h('button', {
                  class: {'close': true},
                  attrs: {
                    'type': 'button',
                    'aria-label': 'Close'
                  }
                }, [
                  h('span', {
                    attrs: {
                      'aria-hidden': true
                    },
                    on: {
                      click: self.dismiss
                    }
                  }, '×')
                ]),
                h('h3', {class: {'modal-title': true}}, self.title)
              ]),
              h('div', {class: {'modal-body': true}}, [self.$slots.default]),
              h('div', {class: {'modal-footer': true}}, [
                h('button', {
                  class: {
                    'btn': true,
                    'btn-primary': true
                  },
                  on: {
                    click: self.close
                  }
                }, self.confirmationLabel)
              ])
            ])
          ])
        ])
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
        close () {
          modals.emit('close', this.id)
        },
        dismiss () {
          modals.emit('dismiss', this.id)
        }
      },
      mounted () {
        const input = $(this.$el).find('.modal-dialog').first()
        /**
         *
         * @param event
         */
        const onClick = (event) => {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            this.close()
          }
        }
        setTimeout(() => {
          $(document).on('click', onClick)
        }, 0)
        this._unsubscribe = () => {
          $(document).off('click', onClick)
        }
      },
      beforeDestroy () {
        this._unsubscribe()
      }
    })
    /**
     * place this somewhere in your component hierarchy, modals will render here.
     * @function
     * @param {Boolean} disableLoadingIndicator - disable built-in loading indicator
     */
    Vue.component('modal-view', {
      render (h) {
        const overlay = (this.loading) ? [
          h('div', {
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
          }, [
            h('i', {
              class: {
                'fa': true,
                'fa-spinner': true,
                'fa-spin': true
              },
              style: {
                'font-size': '5em',
                'margin-top': '25%'
              }
            })
          ])
        ] : []
        return h('div', null, overlay.concat(map(({id, title, confirmationLabel, ignoreScaffolding, size, Modal, data}) => {
          return h(ModalWrapper, {
            attrs: {id},
            props: {title, confirmationLabel, size, ignoreScaffolding}
          }, [
            h(Modal, {props: data})
          ])
        })(this.modals)))
      },
      props: {
        disableLoadingIndicator: {
          type: Boolean,
          default: false
        }
      },
      data () {
        return {
          modals: this.getModals(),
          loading: false
        }
      },
      methods: {
        getModals () {
          return fromPairs(stack)
        }
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate () {
        /**
         *
         * @param method
         */
        const onDestroy = (method) => (id) => {
          const index = findIndex((modal) => first(modal) === id)(stack)
          if (stack[index]) {
            if (method === 'close') {
              stack[index][1].resolve()
            } else if (method === 'dismiss') {
              stack[index][1].reject()
            }
            stack.splice(index, 1)
            this.modals = this.getModals()
            this.$forceUpdate()
          }
        }
        /**
         *
         * @param event
         */
        const onKeydown = (event) => {
          if (event.keyCode == 27) { // eslint-disable-line eqeqeq
            try {
              const id = last(stack)[0]
              modals.emit('dismiss', id)
            } catch (e) {
            }
          }
        }
        /**
         * update modal data onOpen
         */
        modals.on('open', () => {
          this.modals = this.getModals()
        })
        /**
         * update loading state
         */
        modals.on('progress', (loading) => {
          this.loading = this.loading || loading
        })
        /**
         * close the modal (resolve)
         */
        modals.on('close', onDestroy('close'))
        /**
         * dismiss the modal (reject)
         */
        modals.on('dismiss', onDestroy('dismiss'))
        /**
         * press escape to close
         */
        $(document).on('keydown', onKeydown)
        this._unsubscribe = () => {
          modals.off('open')
          modals.off('close')
          modals.off('dismiss')
          $(document).off('keydown', onKeydown)
        }
      },
      beforeDestroy () {
        this._unsubscribe()
      }
    })
    /**
     * @param {object} options
     * @param {boolean} options.ignoreScaffolding - do not include header or footer elements
     * @param {function} options.modal - async require
     * @param {object} options.data - data to pass into the modal instance
     * @param {string} options.confirmationLabel - label for confirmation button
     * @param {string} options.title - modal title
     */
    Vue.prototype.$openModal = function ({
      confirmationLabel = 'okay',
      data = {},
      ignoreScaffolding = false,
      modal,
      size = '',
      title = ''
    }) {
      return Q.Promise((resolve, reject, notify) => {
        let status = {loading: true}
        const poll = setInterval(() => {
          notify(status)
          modals.emit('progress', status.loading)
        }, 100)
        try {
          modal((Modal) => {
            status.loading = false
            const id = hash({Modal, data})
            resolve({
              modal: Modal,
              result: Q.Promise((resolve, reject) => {
                stack.push([id, {id, title, confirmationLabel, size, ignoreScaffolding, Modal, data, resolve, reject}])
                modals.emit('open', id)
                clearInterval(poll)
              })
            })
          })
        } catch (e) {
          reject(e)
        }
      })
    }
  }
}
