<template>
  <folder-icon v-if="isFolder" :size="size" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

export enum FileIconTheme {
  Dark = "dark",
  Light = "light"
}

@Component
export default class FileIcon extends Vue {
  @Prop({ required: true, type: String })
  private readonly filename!: string;

  @Prop({ default: true, type: Boolean })
  private readonly isFolder!: boolean;

  @Prop({ default: 32, type: Number })
  private readonly size!: number;

  @Prop({ default: FileIconTheme.Dark, type: String })
  private readonly theme!: FileIconTheme;

  get fileExtension() {
    const parts = this.filename.split(".");
    return parts[parts.length - 1];
  }

  get styles() {
    return {
      width: `${this.size}px`
    };
  }
}
</script>

<style lang="scss" scoped></style>
