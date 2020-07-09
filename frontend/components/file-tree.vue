<template>
  <div class="file-tree"></div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class FileTree extends Vue {}
</script>

<style lang="scss" scoped>
.file-tree {
  @apply bg-primary-900;
  @apply rounded;
  @apply shadow-lg;
}
</style>
