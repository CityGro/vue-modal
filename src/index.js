import map from 'lodash/fp/map'
import without from 'lodash/fp/without'
import first from 'lodash/fp/first'
import last from 'lodash/fp/last'
import flow from 'lodash/fp/flow'
import hash from 'object-hash'
import findIndex from 'lodash/fp/findIndex'
import EventEmmitter from 'events'
import $ from 'jquery'
import Q from 'q'

export default {
  install (Vue, options) {
    const modals = new EventEmmitter()
    let stack = []
    /**
     * style this component! use `.modal`, `.modal-container`, and `.modal-wrapper`
     * @function
     */
    const ModalWrapper = Vue.component('modal-wrapper', {
      render (h) {
        return h('div', {
          class: {
            modal: true
          }
        }, [
          h('div', {
            class: {
              'modal-dialog': true
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
                      click: this.dismiss()
                    }
                  }, '×')
                ]),
                h('h4', {class: {'modal-title': true}}, this.title)
              ]),
              h('div', {class: {'modal-body': true}}, [this.$slots.default]),
              h('div', {class: {'modal-footer': true}}, [
                h('button', {
                  class: {
                    'btn': true,
                    'btn-default': true
                  },
                  on: {
                    click: this.dismiss()
                  }
                }, 'Close'),
                h('button', {
                  class: {
                    'btn': true,
                    'btn-primary': true
                  },
                  on: {
                    click: this.close()
                  }
                }, 'OK')
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
        const input = $(this.$el).find('.modal-wrapper').first()
        const onClick = (event) => {
          if (!input.is(event.target) && input.has(event.target).length === 0) {
            this.close()
          }
        }
        $(document).on('click', onClick)
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
        const modals = map(({id, title, Modal, data}) => h(ModalWrapper, {
          attrs: {id},
          props: {title}
        }, [
          h(Modal, {props: data})
        ]))
        return h('div', null, flow(map((item) => last(item)), without([undefined, null]), modals)(this.stack))
      },
      computed: {
        stack: () => stack
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate () {
        const onDestroy = (method) => (id) => {
          const index = findIndex((modal) => first(modal) === id)(stack)
          if (method === 'close') {
            stack[index][1].resolve()
          } else if (method === 'dismiss') {
            stack[index][1].reject()
          }
          delete stack[index]
          this.$forceUpdate()
        }
        const onKeydown = (event) => {
          if (event.keyCode == 27) { // eslint-disable-line eqeqeq
            const id = last(stack)[0]
            modals.emit('dismiss', id)
          }
        }
        modals.on('open', (event) => {
          stack.push([event.id, event])
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
     */
    Vue.prototype.$openModal = function ({title = '', data = {}, modal}) {
      return Q.Promise((resolve, reject) => {
        modal((Modal) => {
          const id = hash({Modal, data})
          modals.emit('open', {id, title, Modal, data, resolve, reject})
        })
      })
    }
  }
}
