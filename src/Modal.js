import Vue from 'vue'
import includes from 'lodash/includes'

/**
 * style this component! use bootstrap 3 modal classes
 * @function
 * @param {string} id
 * @param {{}[]}
 */
export default Vue.component('cg-modal-wrapper', {
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
      default: () => ({key: 'ok'})
    },
    instance: {
      type: Function
    },
    static: {
      default: false,
      required: false
    }
  },
  data () {
    return {
      transition: false
    }
  },
  created () {
    if (this.instance) {
      this.instance(this)
    }
  },
  mounted () {
    setTimeout(() => {
      this.transition = true
    }, 150)
    if (this.$refs.focus && this.$refs.focus.focus) {
      this.$refs.focus.focus()
    }
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
      }
      this.$emit('close', {id: this.modalId, result})
    },
    /**
     * close the modal (reject)
     * @param {{key: string}|string} result
     */
    dismiss (result) {
      if (result === undefined) {
        result = this.result
      }
      this.$emit('dismiss', {id: this.modalId, result})
    }
  },
  render (h) {
    let header = null
    let footer = null
    if (this.title) {
      // create header if a title is specified
      let headerContent = []
      if (!this.static) {
        headerContent = [
          h(
            'span',
            {
              attrs: {
                'aria-hidden': true
              },
              on: {
                click: () => {
                  if (!this.static) {
                    this.dismiss()
                  }
                }
              }
            },
            '×'
          )
        ]
      }
      header = h(
        'div',
        {
          class: {
            'modal-header': true
          }
        },
        [
          h(
            'button',
            {
              class: {'close': true},
              attrs: {
                'aria-label': 'Close'
              }
            },
            headerContent
          ),
          h('h3', {class: {'modal-title': true}}, this.title)
        ]
      )
    }
    if (this.buttons) {
      // create footer if there are buttons defined
      footer = h(
        'div',
        {
          class: {
            'modal-footer': true
          }
        },
        this.buttons.map((button) => {
          return h('button', {
            class: {
              'btn': true,
              [button.class]: true
            },
            ref: (button.focus === true) ? 'focus' : undefined,
            on: {
              click: (event) => {
                if (event.x !== 0 && event.y !== 0) {
                  if (button.reject) {
                    this.dismiss({key: button.key, label: button.label})
                  } else {
                    this.close({key: button.key, label: button.label})
                  }
                }
              }
            }
          }, button.label)
        })
      )
    }
    let content = this.$slots.default
    if (header || footer) {
      content = [
        h(
          'div',
          {
            class: {
              'modal-content': true
            }
          },
          [
            header,
            h('div', {class: {'modal-body': true}}, this.$slots.default),
            footer
          ]
        )
      ]
    }
    return h(
      'div',
      {
        class: {
          modal: true,
          fade: true,
          'in': this.transition
        },
        style: {
          display: 'flex'
        },
        on: {
          click: () => {
            if (!this.static) {
              this.dismiss()
            }
          }
        }
      },
      [
        h(
          'div',
          {
            class: {
              'modal-dialog': true,
              'modal-lg': includes(this.size, 'lg'),
              'modal-sm': includes(this.size, 'sm'),
              'modal-full': includes(this.size, 'full'),
              'modal-tall': includes(this.size, 'tall')
            },
            on: {
              click (event) {
                event.stopPropagation()
              }
            }
          },
          content
        )
      ]
    )
  }
})
