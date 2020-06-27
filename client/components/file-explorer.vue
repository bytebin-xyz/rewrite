<template>
  <div class="file-explorer"></div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
@Component
export default class FileExplorer extends Vue {
  private readonly files = [];
}
</script>

<style lang="scss" scoped>
.file-explorer {
  @apply bg-primary-900;
  @apply flex flex-col;
  @apply mt-4;
  @apply rounded;

  height: calc(100vh - 200px);
}
</style>
