<template>
  <div class="grid">
    <div class="grid__left">
      <file-tree class="file-tree" />
    </div>

    <div class="grid grid__right grid--col">
      <breadcrumbs
        class="breadcrumbs"
        :items="[$accessor.user.display_name, 'my files', 'hello']"
      />

      <file-explorer class="file-explorer" />
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
.breadcrumbs {
  @apply mb-4;
}

.file-explorer,
.file-tree {
  @apply h-full;
}

.grid {
  @apply flex;

  height: calc(100vh - 200px);

  &--col {
    @apply flex-col;
  }

  &--row {
    @apply flex-row;
  }

  &__left {
    @apply mr-4;
    @apply w-1/4;
  }

  &__right {
    @apply w-3/4;
  }
}
</style>
