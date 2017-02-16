import Vue from 'vue'
import VueModal from '../src/index'

Vue.use(VueModal)

const MyContent = Vue.component('my-content', {
  render (createElement) {
    return createElement('div', ['hello world'])
  }
})

const MyCustomContent = Vue.component('my-custom-content', {
  render (createElement) {
    const self = this
    return createElement('div', null, [
      createElement('div', {
        domProps: {
          innerHTML: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/305747293&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
        }
      }),
      createElement('div', {
        class: {
          'modal-footer': true
        }
      }, [
       createElement('button', {
         class: {
           'btn': true,
           'btn-danger': true
         },
         on: {
           click: () => self.$parent.close()
         }
       }, 'close')
      ])
    ])
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
              }).then(({modal, result}) => {
                console.log(modal)
                return result
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
        }, 'open large modal'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-success': true
          },
          on: {
            click: () => {
              this.$openModal({
                modal: (cb) => cb(MyCustomContent),
                size: 'lg',
                ignoreScaffolding: true
              }).then(console.log).catch(console.error)
            }
          }
        }, 'open custom modal')
      ]),
      createElement('modal-view')
    ])
  }
}).$mount('#root')