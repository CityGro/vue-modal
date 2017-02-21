import Vue from 'vue'
import VueModal from '../src/index'

Vue.use(VueModal)

const MyCustomContent = Vue.component('my-custom-content', {
  render (h) {
    const self = this
    return h('div', {
      class: {
        'modal-content': true
      }
    }, [
      h('div', {
        class: {
          'modal-body': true
        },
        domProps: {
          innerHTML: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/305747293&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
        }
      }),
      h('div', {
        class: {
          'modal-footer': true
        }
      }, [
       h('button', {
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

const MyContent = Vue.component('my-content', {
  render (h) {
    return h('div', null, [
      h('button', {
        class: {
          'btn': true,
          'btn-success': true
        },
        on: {
          click: this.openCustom
        }
      }, 'open says me')
    ])
  },
  methods: {
    openCustom () {
      this.$openModal({
        content: MyCustomContent,
        size: ['tall', 'lg'],
        static: 'all'
      })
    }
  }
})

new Vue({
  render (h) {
    return h('div', null, [
      h('div', {
        class: {
          'btn-group': true
        }
      }, [
        h('a', {
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
        h('a', {
          class: {
            'btn': true,
            'btn-danger': true
          },
          on: {
            click: () => {
              this.$openModal({
                content: "This modal has static = 'backdrop'",
                title: 'My Small Content',
                size: 'sm',
                static: 'backdrop'
              })
            }
          }
        }, 'open small content'),
        h('a', {
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
        h('a', {
          class: {
            'btn': true,
            'btn-success': true
          },
          on: {
            click: () => {
              this.$openModal({
                content: MyCustomContent,
                size: 'lg',
                static: 'all'
              })
            }
          }
        }, 'open custom content')
      ]),
      h('modal-view')
    ])
  }
}).$mount('#root')