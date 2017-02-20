[![build status](https://gitlab.com/citygro/vue-modal/badges/latest/build.svg)](https://gitlab.com/citygro/vue-modal/commits/latest)
[![coverage report](https://gitlab.com/citygro/vue-modal/badges/latest/coverage.svg)](https://gitlab.com/citygro/vue-modal/commits/latest)
[![npm downloads](https://img.shields.io/npm/dt/@citygro/vue-modal.svg)](https://npmjs.org/package/@citygro/vue-modal)
[![npm version](https://img.shields.io/npm/v/@citygro/vue-modal.svg)](https://npmjs.org/package/@citygro/vue-modal)

@citygro/vue-modal(3) -- reusable modal component for vue 2
===========================================================

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
        content: (resolve) => require(['Modal'], resolve),
        props: { /* props go here */ },
        title: 'My Title'
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

### `$openModal(options: Object): {result: Promise, mounted: Promise}`

#### options

- `buttons: Object[]|boolean` an array of objects describing buttons:
```js
[
  {label: 'Ok', key: 'ok', class: 'btn-primary'},
  {label: 'Cancel', key: 'cancel', class: 'btn-default', reject: true}
]
```
- `content` takes one of
  - a callback function that returns a `VueComponent`, this can be used to load modals asynchronously
  - a `VueComponent` instance
  - a `String`
- `props: Object` props to be passed to the `VueComponent` after it is loaded, default: `{}`
- `size: String|void` (optional) specify modal size (one of: `'sm'`, `'lg'`, or `'full'`)
- `static: string|null` modal dismissal options (one of null, 'backdrop', 'full')
- `title: String|null` modal title, default: `null`


`content` is wrapped in `div.modal-body` if either `title` or `buttons` is defined, if neither are present `content`
 is injected directly into `div.modal-dialog`.

#### return `{result: Promise<void, Error>, mounted: Promise<VueComponent, Error>`

- `mounted: Promise<VueComponent, Error>` a promise for the modal component
- `result: Promise<void, Error>` a `Promise` that is resolved (close) or rejected (dismiss) depending on user input

### `content.$parent.close()`

> note that `$parent` refers to the modal itself, *not* the component calling `$openModal()`

close this modal (and resolve `result`).

### `content.$parent.dismiss()`

> note that `$parent` refers to the modal itself, *not* the component calling `$openModal()`

dismiss this modal (and reject `result`)

## custom styles

modal components have bootstrap modal classes

