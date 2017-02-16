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
  install (Vue, options) {
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
              'modal-sm': self.size === 'sm'
            }
          }, [
            h('div', {
              class: {
                'modal-content': true
              }
            }, [
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
      beforeCreate () {
        modals.on('open', () => {
          this.$forceUpdate()
        })
      },
      mounted () {
        const input = $(this.$el).find('.modal-dialog').first()
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
     */
    Vue.component('modal-view', {
      render (h) {
        return h('div', null, map(({id, title, confirmationLabel, size, Modal, data}) => {
          return h(ModalWrapper, {
            attrs: {id},
            props: {title, confirmationLabel, size}
          }, [
            h(Modal, {props: data})
          ])
        })(this.modals))
      },
      data () {
        return {modal: this.getModals()}
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
        const onKeydown = (event) => {
          if (event.keyCode == 27) { // eslint-disable-line eqeqeq
            try {
              const id = last(stack)[0]
              modals.emit('dismiss', id)
            } catch (e) {}
          }
        }
        modals.on('open', () => {
          this.modals = this.getModals()
          this.$forceUpdate()
        })
        modals.on('close', onDestroy('close'))
        modals.on('dismiss', onDestroy('dismiss'))
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
     * @param {object} options.data - data to pass into the modal instance
     * @param {function} options.modal - async require
     * @param {string} options.title - modal title
     * @param {string} options.confirmationLabel - label for confirmation button
     */
    Vue.prototype.$openModal = function ({title = '', confirmationLabel = 'okay', size = '', data = {}, modal}) {
      return Q.Promise((resolve, reject) => {
        modal((Modal) => {
          const id = hash({Modal, data})
          stack.push([id, {id, title, confirmationLabel, size, Modal, data, resolve, reject}])
          modals.emit('open', id)
        })
      })
    }
  }
}
