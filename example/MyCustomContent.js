import Vue from 'vue'

module.exports = Vue.component('my-custom-content', {
  name: 'my-custom-content',
  $modalOptions: {
    size: ['tall', 'lg'],
    static: 'all'
  },
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
          innerHTML: `
            <iframe
              width="100%"
              height="450"
              scrolling="no"
              frameborder="no"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/305747293&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true">
            </iframe>
          `
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
