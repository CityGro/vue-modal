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
      }).result.then(
        (res) => console.log('[@citygro/vue-modal] my-custom-content closed', res)
      ).catch(
        (err) => console.error('[@citygro/vue-modal] my-custom-content dismissed')
      )
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
                (res) => console.log('[@citygro/vue-modal] my-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal] my-content dismissed', err)
              )
              mounted.then((content) => {
                console.log('[@citygro/vue-modal] my-content mounted', content)
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
                content: "This modal has static = true",
                title: 'My Small Content',
                size: 'sm',
                static: true
              }).result.then(
                (res) => console.log('[@citygro/vue-modal] text-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal] text-content dismissed', err)
              )
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
                content: Vue.component('inline-content', {
                  render (h) {
                    return h('p', null, ['this component is defined inline'])
                  }
                }),
                title: 'Inline Component'
              }).result.then(
                (res) => console.log('[@citygro/vue-modal] inline-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal] inline-content dismissed', err)
              )
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
              }).result.then(
                (res) => console.log('[@citygro/vue-modal]', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal]', err)
              )
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
