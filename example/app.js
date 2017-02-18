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
        class: {
          'modal-body': true
        },
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
              const {result, mounted} = this.$openModal({
                content: (cb) => cb(MyContent),
                title: 'My Content',
                buttons: [
                  {label: 'Ok', key: 'ok', class: 'btn-primary'},
                  {label: 'Cancel', key: 'cancel', class: 'btn-default', reject: true}
                ]
              })
              result.then(
                (res) => console.log('[@citygro/vue-modal] result', res.key)
              ).catch(
                (err) => console.error('[@citygro/vue-modal] result', err.key)
              )
              mounted.then((content) => {
                console.log('[@citygro/vue-modal] mounted', content)
              }).catch(console.error)
            }
          }
        }, 'open content'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-danger': true
          },
          on: {
            click: () => {
              this.$openModal({
                content: 'This is the beginning of the song',
                title: 'My Small Content',
                size: 'sm'
              })
            }
          }
        }, 'open small content'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-warning': true
          },
          on: {
            click: () => {
              this.$openModal({
                content: (cb) => cb(MyContent),
                title: 'My Large Content',
                size: 'lg'
              })
            }
          }
        }, 'open large content'),
        createElement('a', {
          class: {
            'btn': true,
            'btn-success': true
          },
          on: {
            click: () => {
              this.$openModal({
                content: MyCustomContent,
                size: 'lg',
                buttons: false
              })
            }
          }
        }, 'open custom content')
      ]),
      createElement('modal-view')
    ])
  }
}).$mount('#root')