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
          darkness: true
        }
      }).result.then(
        (res) => console.log('[@citygro/vue-modal example] my-custom-content closed', res)
      ).catch(
        (err) => console.error('[@citygro/vue-modal example] my-custom-content dismissed', err)
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
  methods: {
    openThenClose () {
      const openModalResults = this.$openModal({
        content: 'this component will be closed by an external source in 3 seconds'
      })
      openModalResults.result.then(
        (res) => console.log('[@citygro/vue-modal openThenClose] closed', res)
      ).catch(
        (err) => console.error('[@citygro/vue-modal openThenClose] dismissed', err)
      )
      openModalResults.instance.then((modalInstance) => {
        console.log('[@citygro/vue-modal openThenClose] we have an instance', {modalInstance})
      })
      setTimeout(
        () => {
          openModalResults.close({closedExternally: true}).then((result) => {
            console.log('[@citygro/vue-modal openThenClose] we have closed the modal from the outside', {result})
          })
        },
        3000
      )
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
                (res) => console.log('[@citygro/vue-modal example] my-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal example] my-content dismissed', err)
              )
              mounted.then((content) => {
                console.log('[@citygro/vue-modal example] my-content mounted', content)
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
                content: 'This modal has static = true',
                title: 'My Small Content',
                size: 'sm',
                static: true
              }).result.then(
                (res) => console.log('[@citygro/vue-modal example] text-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal example] text-content dismissed', err)
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
                (res) => console.log('[@citygro/vue-modal example] inline-content closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal example] inline-content dismissed', err)
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
                (res) => console.log('[@citygro/vue-modal example] closed', res)
              ).catch(
                (err) => console.error('[@citygro/vue-modal example] dismissed', err)
              )
            }
          }
        }, 'open custom content'),
        h('a', {
          class: {
            'btn': true,
            'btn-default': true
          },
          on: {
            click: () => {
              this.openThenClose()
            }
          }
        }, 'open a modal that will be closed by the triggering component')
      ]),
      h('modal-view', {
        on: {
          progress: (loading) => {
            self.modalLoading = loading
          },
          open: () => {
            console.log('[@citygro/vue-modal example] open event')
          },
          close: () => {
            console.log('[@citygro/vue-modal example] close event')
          },
          dismiss: () => {
            console.log('[@citygro/vue-modal example] dismiss event')
          }
        }
      })
    ])
  }
}).$mount('#root')
