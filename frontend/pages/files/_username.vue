<template>
  <div class="grid">
    <div class="grid__left">
      <file-tree class="file-tree" />
    </div>

    <div class="grid grid__right grid--col">
      <breadcrumbs class="breadcrumbs" :items="[$accessor.user.displayName, 'my files', 'hello']" />

      <file-explorer class="file-explorer" :files="files" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import { File } from "@/interfaces/file.interface";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Files extends Vue {
  private readonly files: File[] = [];

  asyncData() {
    const files = [];

    for (let i = 1; i < Math.floor(Math.random() * 50); i += 1) {
      files.push({
        id: String(i),
        name: `Folder ${i}`,
        size: i * Math.floor(Math.random() * 50000000),
        type: "Folder",
        uploadedAt: new Date().toString()
      });
    }

    return { files };
  }
}
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

  height: calc(100vh - 185px);

  &--col {
    @apply flex-col;
  }

  &--row {
    @apply flex-row;
  }

  &__left {
    @apply mr-4;
    @apply w-1/4;

    @screen md_max {
      @apply hidden;
    }
  }

  &__right {
    @apply w-3/4;

    @screen md_max {
      @apply w-full;
    }
  }
}
</style>
