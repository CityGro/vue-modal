/* global jest, beforeEach, describe, it, expect */

import Vue from 'vue'

import * as utils from '../utils'
import ContentWrapper from '../ContentWrapper'

describe('utils', () => {
  describe('resolveContnent', () => {
    let string
    let Component
    let callback

    beforeEach(() => {
      jest.resetModules()
      string = 'hello world'
      Component = Vue.component('my-component', {
        render (h) {
          return h('span')
        }
      })
      callback = (cb) => cb(Component)
    })

    it('wraps strings', () => {
      expect(utils.resolveContent(string)).toBeInstanceOf(Function)
    })

    it('wraps Components', () => {
      expect(utils.resolveContent(Component)).toBeInstanceOf(Function)
    })

    it('callback resolves string', () => {
      return new Promise((resolve) => {
        utils.resolveContent(string)((content) => {
          resolve(expect(typeof content).toBe(typeof ContentWrapper(string)))
        })
      })
    })
    it('callback resolves Component', () => {
      return new Promise((resolve) => {
        utils.resolveContent(Component)((content) => {
          resolve(expect(typeof content).toBe(typeof Component))
        })
      })
    })
    it('callback is un-modified', () => {
      return new Promise((resolve) => {
        utils.resolveContent(callback)((content) => {
          resolve(expect(content).toBe(Component))
        })
      })
    })
  })
})
