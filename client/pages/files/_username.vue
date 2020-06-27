<template>
  <div class="files">
    <file-tree class="files__tree" />

    <div class="files__explorer">
      <breadcrumbs :items="[$accessor.user.display_name, 'my files', 'hello']" />

      <file-explorer />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Files extends Vue {}
</script>

<style lang="scss" scoped>
.files {
  @apply flex flex-row;

  height: calc(100vh - 200px);

  &__explorer {
    @apply flex flex-col;
    @apply ml-2;

    flex-basis: 77%;
  }

  &__tree {
    @apply mr-2;

    flex-basis: 22%;
  }
}
</style>
