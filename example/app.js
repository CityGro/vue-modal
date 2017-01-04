import './style.css'
import Vue from 'vue'
import VueModal from '../src'

Vue.use(VueModal)

const MyContent = Vue.component('my-content', {
  render (createElement) {
    return createElement('div', [
      'hello world',
      createElement('a', {
        class: {
          btn: true
        },
        on: {
          click: () => {
            this.$parent.close()
          }
        }
      }, 'close modal')
    ])
  }
})

new Vue({
  render (createElement) {
    return createElement('div', [
      createElement('a', {
        class: {
          btn: true
        },
        on: {
          click: () => {
            this.$openModal({
              modal: (cb) => cb(MyContent)
            })
          }
        }
      }, 'open modal'),
      createElement('modal-view', {
        props: {
          name: "default"
        }
      })
    ])
  }
}).$mount('#root')