import Vue from 'vue'
import VueModal from '../src/index'

Vue.use(VueModal)

const MyContent = Vue.component('my-content', {
  render (createElement) {
    return createElement('div', ['hello world'])
  }
})

new Vue({
  render (createElement) {
    return createElement('div', [
      createElement('a', {
        class: {
          'btn': true,
          'btn-primary': true
        },
        on: {
          click: () => {
            this.$openModal({
              modal: (cb) => cb(MyContent),
              title: 'My Content'
            }).then(console.log).catch(console.error)
          }
        }
      }, 'open modal'),
      createElement('modal-view')
    ])
  }
}).$mount('#root')