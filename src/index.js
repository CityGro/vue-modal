import $ from 'jquery'
import EventEmmitter from 'events'
import ModalWrapper from './Modal'
import Q from 'q'
import assign from 'lodash/assign'
import findIndex from 'lodash/fp/findIndex'
import first from 'lodash/fp/first'
import flatten from 'lodash/flattenDeep'
import fromPairs from 'lodash/fp/fromPairs'
import isString from 'lodash/isString'
import last from 'lodash/fp/last'
import map from 'lodash/fp/map'
import pkg from '../package.json'
import toNumber from 'lodash/toNumber'
import uniqueId from 'lodash/uniqueId'
import {getOptions, resolveContent} from './utils'

export default {
  install (Vue) {
    const modals = new EventEmmitter()
    let stack = []
    /**
     * place this somewhere in your component hierarchy, modals will render here.
     * @function
     * @param {Boolean} disableLoadingIndicator - disable built-in loading indicator
     */
    Vue.component('modal-view', {
      render (h) {
        return h('div', {
          class: {
            'modal-view': true
          }
        }, map((options) => h(ModalWrapper, {
          attrs: {id: options.id},
          props: {
            title: options.title,
            buttons: options.buttons,
            size: options.size,
            instance: options.instance,
            modals,
            static: options.static
          },
          class: options.class
        }, [
          h(options.Modal, {props: options.props})
        ]))(this.modals))
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
         * destroy the specified modal
         * @param method
         */
        const onDestroy = (method) => ({id, result}) => {
          const index = findIndex((modal) => first(modal) === id)(stack)
          if (stack[index]) {
            if (method === 'close') {
              stack[index][1].resolve(result)
            } else if (method === 'dismiss') {
              stack[index][1].reject(result)
            }
            stack.splice(index, 1)
            this.modals = this.getModals()
            this.$emit(method)
          }
        }
        /**
         * close the topmost modal when ESC is pressed
         * @param event
         */
        const onKeydown = (event) => {
          if (stack.length) {
            const [id, options] = last(stack)
            switch (toNumber(event.keyCode)) {
              case 27:
                if (!options.static) {
                  modals.emit('dismiss', {id})
                }
                break
            }
          }
        }
        /**
         * update modal data onOpen
         */
        modals.on('open', () => {
          this.modals = this.getModals()
          this.$emit('open')
        })
        /**
         * update loading state
         */
        modals.on('progress', (loading) => {
          this.loading = loading
          this.$emit('progress', this.loading)
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
          modals.removeAllListeners('open')
          modals.removeAllListeners('close')
          modals.removeAllListeners('dismiss')
          $(document).off('keydown', onKeydown)
        }
      },
      beforeDestroy () {
        this._unsubscribe()
      }
    })
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
    const $openModal = function (options) {
      if (!options.content) {
        throw new Error('options.content is a required argument!', options)
      }
      const result = Q.defer()
      const instance = Q.defer()
      let status = {loading: true}
      const poll = setInterval(() => {
        modals.emit('progress', status.loading)
      }, 10)
      return {
        result: result.promise,
        instance: instance.promise,
        close: (options) => {
          const close = Q.defer()
          instance.promise.then((componentInstance) => {
            close.resolve(componentInstance.close(options))
          })
          return close.promise
        },
        dismiss: (options) => {
          const dismiss = Q.defer()
          instance.promise.then((componentInstance) => {
            dismiss.resolve(componentInstance.dismiss(options))
          })
          return dismiss.promise
        },
        mounted: Q.Promise((resolve, reject) => {
          try {
            if (document.activeElement && document.activeElement.blur) {
              document.activeElement.blur()
            }
            resolveContent(options.content)((Modal) => {
              Modal = (Modal.default) ? Modal.default : Modal
              status.loading = false
              modals.emit('progress', status.loading)
              clearInterval(poll)
              options = assign({}, getOptions(Modal), options)
              if (options.buttons === undefined && isString(options.content)) {
                options.buttons = true
              } else if (options.buttons === undefined) {
                options.buttons = false
              }
              if (options.buttons === true) {
                options.buttons = [
                  {label: 'ok', key: 'ok', class: 'btn-primary', focus: true}
                ]
              }
              if (options.props === undefined) {
                options.props = {}
              }
              if (options.static === undefined) {
                options.static = false
              } else {
                options.static = !!options.static
              }
              if (options.title === undefined) {
                options.title = null
              }
              if (options.class === undefined) {
                options.class = {}
              }
              const id = uniqueId()
              resolve(Modal)
              setTimeout(() => {
                stack.push([id, {
                  Modal,
                  buttons: options.buttons,
                  class: options.class,
                  id,
                  props: options.props,
                  reject: result.reject,
                  resolve: result.resolve,
                  instance: instance.resolve,
                  size: flatten([options.size]),
                  static: options.static,
                  title: options.title
                }])
                modals.emit('open', id)
              }, 0)
            })
          } catch (e) {
            reject(e)
          }
        })
      }
    }
    Vue.$openModal = $openModal
    Vue.mixin({
      methods: {$openModal}
    })
    console.log('installed @citygro/vue-modal', pkg.version)
  }
}
