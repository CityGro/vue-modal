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
    return createElement('div', null, [
      createElement('div', {
        class: {
          'btn-group': true
        }
      }, [
        createElement('a', {
          class: {
            'btn': true,
            'btn-primary': true
          },
          on: {
            click: () => {
              this.$openModal({
                modal: (cb) => cb(MyContent),
                title: 'My Content',
              }).then(console.log).catch(console.error)
            }
          }
        }, 'open modal'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-danger': true
          },
          on: {
            click: () => {
              this.$openModal({
                modal: (cb) => cb(MyContent),
                title: 'My Small Content',
                size: 'sm'
              }).then(console.log).catch(console.error)
            }
          }
        }, 'open small modal'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-warning': true
          },
          on: {
            click: () => {
              this.$openModal({
                modal: (cb) => cb(MyContent),
                title: 'My Large Content',
                size: 'lg'
              }).then(console.log).catch(console.error)
            }
          }
        }, 'open large modal')
      ]),
      createElement('modal-view')
    ])
  }
}).$mount('#root')