import Vue from 'vue'
import VueModal from '../src/index'

Vue.use(VueModal)

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
        },
        ref: 'focus'
      }, 'open says me')
    ])
  },
  mounted () {
    this.$refs.focus.focus()
  },
  methods: {
    openCustom () {
      this.$openModal({
        content: (resolve) => require(['./MyCustomContent'], resolve),
        class: {
          death: true
        }
      })
    }
  }
})

new Vue({
  data () {
    return {
      modalLoading: false
    }
  },
  render (h) {
    const self = this
    return h('div', null, [
      h('div', {
        class: {
          'progress': true
        }
      }, [
        h('div', {
          class: {
            'progress-bar': true,
            'progress-bar-striped': true,
            'progress-bar-info': true,
            'active': self.modalLoading
          },
          style: {
            width: '100%'
          }
        })
      ]),
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
                  {label: 'Ok', key: 'ok', class: 'btn-primary', focus: true},
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
              Vue.$openModal({
                content: Vue.component('inline-content', {
                  render (h) {
                    return h('p', null, ['this component is defined inline'])
                  }
                }),
                title: 'Inline Component'
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
                content: (resolve) => require(['./MyCustomContent'], resolve)
              })
            }
          }
        }, 'open custom content')
      ]),
      h('modal-view', {
        on: {
          progress: (loading) => {
            self.modalLoading = loading
          }
        }
      })
    ])
  }
}).$mount('#root')
