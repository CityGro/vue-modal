import hash from 'object-hash'

import findIndex from 'lodash/fp/findIndex'
import first from 'lodash/fp/first'
import fromPairs from 'lodash/fp/fromPairs'
import isString from 'lodash/isString'
import last from 'lodash/fp/last'
import map from 'lodash/fp/map'
import flatten from 'lodash/flattenDeep'

import EventEmmitter from 'events'

import $ from 'jquery'

import Q from 'q'

import ModalWrapper from './Modal'
import {resolveContent} from './utils'

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
        return h('div', {
          class: {
            'modal-view': true
          }
        }, overlay.concat(map(({id, title, buttons, size, Modal, props, static: isStatic}) => {
          return h(ModalWrapper, {
            attrs: {id},
            props: {title, buttons, size, modals, static: isStatic}
          }, [
            h(Modal, {props: props})
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
          this.loading = loading
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
     * @param {{label: string, key: any, class: string, reject: boolean}[]|boolean} options.buttons - define buttons to inject into the footer
     * @param {string|function} options.content - string, VueComponent, or async require
     * @param {object} options.props - data to pass into the modal instance
     * @param {string|null} options.title - modal title
     * @param {string|string[]|void} options.size - modal size (one of 'sm', 'lg', or 'full' or multiple in an array)
     * @param {string|null} options.static - modal dismissal options (one of null, 'backdrop', 'full')
     */
    Vue.prototype.$openModal = function (options) {
      if (!options.content) {
        throw new Error('options.content is a required argument!', options)
      }
      if (options.buttons === undefined && isString(options.content)) {
        options.buttons = true
      } else if (options.buttons === undefined) {
        options.buttons = false
      }
      if (options.buttons === true) {
        options.buttons = [
          {label: 'ok', key: 'ok', class: 'btn-primary'}
        ]
      }
      if (options.props === undefined) {
        options.props = {}
      }
      if (options.static === undefined) {
        options.static = null
      }
      if (options.title === undefined) {
        options.title = null
      }
      const result = Q.defer()
      let status = {loading: true}
      const poll = setInterval(() => {
        modals.emit('progress', status.loading)
      }, 200)
      return {
        result: result.promise,
        mounted: Q.Promise((resolve, reject) => {
          try {
            resolveContent(options.content)((Modal) => {
              status.loading = false
              modals.emit('progress', status.loading)
              const id = hash({Modal, props: options.props})
              stack.push([id, {
                Modal,
                buttons: options.buttons,
                id,
                props: options.props,
                reject: result.reject,
                resolve: result.resolve,
                size: flatten([options.size]),
                static: options.static,
                title: options.title
              }])
              modals.emit('open', id)
              clearInterval(poll)
              this.$nextTick(() => {
                resolve(Modal)
              })
            })
          } catch (e) {
            reject(e)
          }
        })
      }
    }
  }
}
