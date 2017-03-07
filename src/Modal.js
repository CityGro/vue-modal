import Vue from 'vue'
import map from 'lodash/fp/map'
import includes from 'lodash/fp/includes'

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
      default: () => ({key: 'ok'})
    },
    static: {
      required: true
    }
  },
  data () {
    return {
      transition: false
    }
  },
  mounted () {
    setTimeout(() => {
      this.transition = true
    }, 150)
  },
  beforeDestroy () {
    this.transition = false
  },
  methods: {
    /**
     * close the modal (resolve)
     * @param {{key: string}|string} result
     */
    close (result) {
      if (result === undefined) {
        result = this.result
      } else {
        result = {key: result}
      }
      this.modals.emit('close', {id: this.id, result})
    },
    /**
     * close the modal (reject)
     * @param {{key: string}|string} result
     */
    dismiss (result) {
      if (result === undefined) {
        result = this.result
      } else {
        result = {key: result}
      }
      this.modals.emit('dismiss', {id: this.id, result})
    }
  },
  render (h) {
    const self = this
    // create header if a title is specified
    const header = (this.title) ? h('div', {
      class: {
        'modal-header': true
      }
    }, [
      h('a', {
        class: {'close': true},
        attrs: {
          'aria-label': 'Close'
        }
      }, (self.static === 'all') ? [] : [
        h('span', {
          attrs: {
            'aria-hidden': true
          },
          on: {
            click () {
              if (self.static !== 'all') {
                self.dismiss()
              }
            }
          }
        }, '×')
      ]),
      h('h3', {class: {'modal-title': true}}, self.title)
    ]) : null
    // create footer if there are buttons defined
    const footer = (this.buttons) ? h('div', {class: {'modal-footer': true}}, map((button) => {
      return h('a', {
        class: {
          'btn': true,
          [button.class]: true
        },
        on: {
          click () {
            if (button.reject) {
              self.dismiss({key: button.key, label: button.label})
            } else {
              self.close({key: button.key, label: button.label})
            }
          }
        }
      }, button.label)
    })(this.buttons)) : null
    return h('div', {
      class: {
        modal: true,
        fade: true,
        'in': self.transition
      },
      style: {
        display: 'block !important'
      },
      on: {
        click () {
          if (!self.static) {
            self.dismiss()
          }
        }
      }
    }, [
      h('div', {
        class: {
          'modal-dialog': true,
          'modal-lg': includes('lg')(self.size),
          'modal-sm': includes('sm')(self.size),
          'modal-full': includes('full')(self.size),
          'modal-tall': includes('tall')(self.size)
        },
        on: {
          click (event) {
            event.stopPropagation()
          }
        }
      }, [
        (header || footer)
          ? h('div', {
            class: {
              'modal-content': true
            }
          }, [
            header,
            h('div', {class: {'modal-body': true}}, [self.$slots.default]),
            footer
          ]) : self.$slots.default
      ])
    ])
  }
})
