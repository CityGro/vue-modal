import $ from 'jquery'
import Vue from 'vue'
import map from 'lodash/fp/map'

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
      default: () => ({key: 'ok'})
    }
  },
  methods: {
    close (result) {
      result = result || this.result
      this.modals.emit('close', {id: this.id, result})
    },
    dismiss (result) {
      result = result || this.result
      this.modals.emit('dismiss', {id: this.id, result})
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
  },
  render (h) {
    const self = this
    const header = (this.title) ? h('div', {
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
            click: () => self.dismiss()
          }
        }, '×')
      ]),
      h('h3', {class: {'modal-title': true}}, self.title)
    ]) : null
    const footer = (this.buttons) ? h('div', {class: {'modal-footer': true}}, map((button) => {
      return h('button', {
        class: {
          'btn': true,
          [button.class]: true
        },
        on: {
          click: (button.reject) ? () => self.dismiss({key: button.key}) : () => self.close({key: button.key})
        }
      }, button.label)
    })(this.buttons)) : null
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
        }, (header || footer) ? [
          header,
          h('div', {class: {'modal-body': true}}, [self.$slots.default]),
          footer
        ] : self.$slots.default)
      ])
    ])
  }
})
