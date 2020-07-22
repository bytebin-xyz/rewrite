<template>
  <div class="grid">
    <div class="grid__left">
      <file-tree class="h-full" />
    </div>

    <div class="grid grid__right grid--col">
      <file-explorer-breadcrumbs ref="breadcrumbs" class="mb-3" @navigate="navigate" />

      <file-explorer-toolbar ref="toolbar" class="rounded rounded-b-none" />

      <file-explorer
        ref="explorer"
        class="h-full rounded rounded-t-none"
        :items="items"
        @open="open"
      />

      <file-explorer-status-bar ref="statusBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import Breadcrumbs from "@/components/file-explorer/file-explorer-breadcrumbs.vue";
import Explorer from "@/components/file-explorer.vue";
import StatusBar from "@/components/file-explorer/file-explorer-status-bar.vue";
import Toolbar from "@/components/file-explorer/file-explorer-toolbar.vue";

import { FileSystemObject } from "@/interfaces/fs-object.interface";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Files extends Vue {
  @Ref() private readonly breadcrumbs!: Breadcrumbs;
  @Ref() private readonly explorer!: Explorer;
  @Ref() private readonly statusBar!: StatusBar;
  @Ref() private readonly toolbar!: Toolbar;

  private items: FileSystemObject[] = [];

  asyncData() {
    const items: FileSystemObject[] = [];

    for (let i = 1; i < Math.floor(Math.random() * 50); i += 1) {
      items.push({
        createdAt: new Date().toString(),
        id: String(i),
        isFolder: true,
        name: `Folder ${i}`,
        size: i * Math.floor(Math.random() * 50000000)
      });
    }

    return { items };
  }

  mounted() {
    this.breadcrumbs.forward({ name: this.$accessor.user!.displayName, path: "~" });
  }

  navigate() {
    this.fetchItems();
  }

  open(item: FileSystemObject) {
    if (item.isFolder) {
      this.breadcrumbs.forward({ name: item.name, path: item.id });
      this.fetchItems();
    } else {
      //
    }
  }

  fetchItems() {
    const items: FileSystemObject[] = [];

    for (let i = 1; i < Math.floor(Math.random() * 50); i += 1) {
      items.push({
        createdAt: new Date().toString(),
        id: String(i),
        isFolder: true,
        name: `Folder ${i}`,
        size: i * Math.floor(Math.random() * 50000000)
      });
    }

    this.items = items;

    return items;
  }
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  @apply mb-4;
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
