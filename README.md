vue-modal(3) -- reusable modal component for vue 2
==================================================

see `./example` for a working demonstration

## overview

```js
// App.vue
import Vue from 'vue'
import VueModal from 'vue-modal'

Vue.use(VueModal)

Vue.component('my-component', {
  // ...
  methods: {
    showMyModal () {
      this.$openModal({
        modal: (resolve) => require(['Modal'], resolve),
        data: { /* props go here */ },
        title: 'My Title',
        confirmationLabel: 'okay',
        ignoreScaffolding: false // inject your component into the default modal
      }).then(({modal: VueComponent, result: Promise}) => {
        setTimeout(() => modal.$parent.close(), 10000) // close after 10s
        return result
      }).then(() => console.log('close')).catch(() => console.error('dismiss'))
    }
  }
  // ...
})

new Vue({
  render (createElement) {
    return createElement('div', null, [
      createElement(MyComponent),
      createElement('modal-view')
    ])
  }
}).$mount('#root')

```

## api

### `$openModal({confirmationLabel: String, data: Object, ignoreScaffolding: Boolean, modal: (resolve: VueComponent) => void, size: String, title: String}): Promise`

#### options

- `confirmationLabel` label for the confirmation button, default: `'okay'`
- `data: Object` props to be passed to the `VueComponent` after it is loaded, default: `{}`
- `ignoreScaffolding: Boolean` inject the `VueComponent` into an empty modal, default: `false`
- `modal: Function` takes a callback function that returns a `VueComponent`, this can be used to load modals asynchronously
- `size: String` (optional) specify modal size (one of: `'sm'`, `'lg'`, or `'full'`)
- `title: String` modal title, default: `''`

#### return `Promise<{modal: VueComponent, result: Promise}>`

- `modal: VueComponent` the loaded modal component
- `result: Promise` a `Promise` that is resolved (close) or rejected (dismiss) depending on user input

### `vm.$parent.close()`

close this modal (and resolve `result`)

### `vm.$parent.dismiss()`

dismiss this modal (and reject `result`)