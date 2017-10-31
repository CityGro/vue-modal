<template>
  <div class="modal-content">
    <div class="modal-body">
      <iframe
        scrolling="no"
        frameborder="no"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/305747293&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true">
      </iframe>
    </div>
    <div class="modal-footer">
      <button class="btn btn-danger" @click="$parent.close({myCustomProp: true})" ref="focus">
        close
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
iframe {
  width: 100%;
  height: 450px;
}
</style>

<script>
export default {
  name: 'my-custom-content',
  $modalOptions: {
    size: ['tall', 'lg'],
    static: 'all'
  },
  mounted () {
    this.$refs.focus.focus()
  }
}
</script>
