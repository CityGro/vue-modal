import map from 'lodash/fp/map'
import hash from 'object-hash'
import values from 'lodash/fp/values'
import EventEmmitter from 'events'
import $ from 'jquery'

export default {
  install (Vue, options) {
    const modals = new EventEmmitter()
    /**
     * style this component! use `.modal`, `.modal-container`, and `.modal-wrapper`
     * @function
     */
    const ModalWrapper = Vue.component('modal-wrapper', { // eslint-disable-line no-unused-vars
      render (h) {
        return (
          <div class={{modal: true}}>
            <div class={{'modal-container': true}}>
              <div class={{'modal-wrapper': true}}>
                {this.$slots.default}
              </div>
            </div>
          </div>
        )
      },
      props: {
        id: {
          type: String,
          required: true
        }
      },
      methods: {
        close () {
          modals.emit('destroy', this.id)
        }
      },
      mounted () {
        const input = $(this.$el).find('.modal-wrapper').first()
        const onClick = (event) => {
          if (!input.is(event.target) && input.has(event.target).length === 0 && this.showDropdown) {
            this.close()
          }
        }
        $(document).on('click', onClick)
        const onKeydown = (event) => {
          if (this.showDropdown && event.keyCode === 27) {
            this.close()
          }
        }
        $(document).on('keydown', onKeydown)
        this._unsubscribe = () => {
          $(document).off('click', onClick)
          $(document).off('keydown', onKeydown)
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
        const modals = map(({Modal, data, id}) => (
          <ModalWrapper id={id}>
            <Modal {...data} />
          </ModalWrapper>
        ))
        return (
          <div>
            {modals(values(this.modals))}
          </div>
        )
      },
      data () {
        return {modals: {}}
      },
      /**
       * register listeners to add/remove Modals and corresponding data
       */
      beforeCreate () {
        const onOpen = (event) => {
          Vue.set(this.modals, event.id, event)
        }
        modals.on('open', onOpen)
        const onDestroy = (id) => {
          Vue.delete(this.modals, id)
        }
        modals.on('destroy', onDestroy)
        this._unsubscribe = () => {
          modals.off('open', onOpen)
          modals.off('destroy', onDestroy)
        }
      },
      beforeDestroy () {
        this._unsubscribe()
      }
    })
    /**
     * @param {Object} options
     * @param {Object} options.data - data to pass into the modal instance
     * @param {Function} options.modal - async require
     */
    Vue.prototype.$openModal = function ({data = {}, modal}) {
      modal((Modal) => {
        modals.emit('open', {Modal, data, id: hash({Modal, data})})
      })
    }
  }
}
