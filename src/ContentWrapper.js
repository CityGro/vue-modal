import Vue from 'vue'

export default (content) => Vue.component('cg-content-wrapper', {
  name: 'cg-content-wrapper',
  render (h) {
    return h('p', null, content)
  }
})
