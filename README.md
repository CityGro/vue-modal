[![build status](https://gitlab.com/citygro/vue-modal/badges/latest/build.svg)](https://gitlab.com/citygro/vue-modal/commits/latest)
[![coverage report](https://gitlab.com/citygro/vue-modal/badges/latest/coverage.svg)](https://gitlab.com/citygro/vue-modal/commits/latest)
[![npm downloads](https://img.shields.io/npm/dt/@citygro/vue-modal.svg)](https://npmjs.org/package/@citygro/vue-modal)
[![npm version](https://img.shields.io/npm/v/@citygro/vue-modal.svg)](https://npmjs.org/package/@citygro/vue-modal)

@citygro/vue-modal
==================

reusable modal component for vue 2; designed to work with bootstrap 3 styles.


see `./example` for a working demonstration!

```
git clone https://gitlab.com/citygro/vue-modal
cd vue-modal
yarn
yarn start
```

if you're impressed, you'll want to add this to your project immediately:

```
$ yarn add @citygro/vue-modal
```

the example project is a good reference.

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

### `$openModal(options: Object): {mounted, result, instance, close, dismiss}`

#### options

- `buttons: Object[]|boolean` an array of objects describing buttons:
```js
[
  {label: 'Ok', key: 'ok', class: 'btn-primary', focus: true},
  {label: 'Cancel', key: 'cancel', class: 'btn-default', reject: true}
]
```
- `content` takes one of
  - a callback function that returns a `VueComponent`, this can be used to load modals asynchronously
  - a `VueComponent` instance
  - a `String`
- `props: Object` props to be passed to the `VueComponent` after it is loaded, default: `{}`
- `size: String|String[]|void` (optional) specify modal size (one of: `'sm'`, `'lg'`, or `'full'`); specify multiple
  options as an array
- `static: boolean` force interation to dismiss
- `title: String|null` modal title, default: `null`
- `class: Object` class names to bind to `.modal` (see [vue guide])


`content` is wrapped in `div.modal-body` if either `title` or `buttons` is defined, if neither are present `content`
 is injected directly into `div.modal-dialog`.
 
[vue guide]: https://vuejs.org/v2/guide/class-and-style.html

#### return `{mounted, result, instance, close, dismiss}`

- `mounted: Promise<VueComponent, Error>` a promise for the modal component
- `result: Promise<void, Error>` a `Promise` that is resolved (close) or rejected (dismiss) depending on user input
- `instance: Promise<VueComponent>` a promise that resolves to the modal component instance that is created for that specific call of `$openModal`; It is not the vue component instance of the content, but of the modal which is `$parent` to the content.
- `close: Function(options)<Promise<void>>` a function which waits for `instance` to resolve, then runs the `close` method of that instance with the provided `options`. Like running `content.$parent.close(options)` from inside of the modal content component, but accessible from the context of where the modal was opened. Useful for closing progress/loading blockers.
- `dismiss: Function(options)<Promise<void>>` a function which waits for `instance` to resolve, then runs the `dismiss` method of that instance with the provided `options`. Like running `content.$parent.dismiss(options)` from inside of the modal content component, but accessible from the context of where the modal was opened. Useful for closing progress/loading blockers.

### `content.$parent.close(options: {key: String})`

> note that `$parent` refers to the modal itself, *not* the component calling `$openModal()`

close this modal (and resolve `result`).

### `content.$parent.dismiss(options: {key: String})`

> note that `$parent` refers to the modal itself, *not* the component calling `$openModal()`

dismiss this modal (and reject `result`)

### `content.$modalOptions: Object` 

optional static modal options which are merged with any options passed to `$openModal()`. options passed at the call
site will take precedence.

## custom styles

modal components have bootstrap modal classes

## issues?

if you get stuck, you can catch us on [#citygro:matrix.org](https://riot.im/app/#/room/#citygro:matrix.org)

found a bug? [we'd be happy to fix it!](https://gitlab.com/citygro/vue-modal/issues).
