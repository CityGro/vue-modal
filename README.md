vue-modal(3) -- reusable modal component for vue 2
==================================================

```js
// App.vue
import Vue from 'vue'
import VueModal from 'vue-modal'

Vue.use(VueModal)

new Vue({
  render (createElement) {
    return createElement('modal-view')
  }
})

Vue.component('my-component', {
  // ...
  methods: {
    open () {
      this.$openModal({
        modal: (resolve) => require(['Modal'], resolve),
        data: {name: this.name}
      })
    }
  }
  // ...
})
```
