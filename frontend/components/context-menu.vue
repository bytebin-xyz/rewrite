<template>
  <ul ref="contextMenu" class="context-menu">
    <slot />
  </ul>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

@Component
export default class ContextMenu extends Vue {
  @Ref() private readonly contextMenu!: ContextMenu;

  private opened = false;

  close() {
    this.opened = false;
  }

  open(_event: MouseEvent) {
    this.opened = true;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/context-menu";
</style>
