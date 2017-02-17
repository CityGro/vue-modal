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
      const {result, mounted} = this.$openModal({
        modal: (resolve) => require(['Modal'], resolve),
        data: { /* props go here */ },
        title: 'My Title',
        confirmationLabel: 'okay',
        ignoreScaffolding: false // inject your component into the default modal
      })
      result.then(() => {
        /* close */
      }).catch(() => {
        /* dismiss */
      })
      mounted.then((modal) => {
        /* do what you want */
      })
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

### `$openModal({confirmationLabel: String, data: Object, ignoreScaffolding: Boolean, modal: (resolve: VueComponent) => void, size: String, title: String}): {result: Promise, mounted: Promise}`

#### options

- `confirmationLabel` label for the confirmation button, default: `'okay'`
- `data: Object` props to be passed to the `VueComponent` after it is loaded, default: `{}`
- `ignoreScaffolding: Boolean` inject the `VueComponent` into an empty modal, default: `false`
- `modal: Function` takes a callback function that returns a `VueComponent`, this can be used to load modals asynchronously
- `size: String` (optional) specify modal size (one of: `'sm'`, `'lg'`, or `'full'`)
- `title: String` modal title, default: `''`

#### return `{result: Promise<void, Error>, mounted: Promise<VueComponent, Error>`

- `mounted: Promise<VueComponent, Error>` a promise for the modal component
- `result: Promise<void, Error>` a `Promise` that is resolved (close) or rejected (dismiss) depending on user input

### `vm.$parent.close()`

close this modal (and resolve `result`)

### `vm.$parent.dismiss()`

dismiss this modal (and reject `result`)