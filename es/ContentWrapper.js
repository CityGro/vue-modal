import Vue from 'vue';

export default (function (content) {
  return Vue.component('cg-content-wrapper', {
    name: 'cg-content-wrapper',
    render: function render(h) {
      return h('p', null, content);
    }
  });
});