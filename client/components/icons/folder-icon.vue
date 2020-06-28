<template>
  <svg
    :style="{ fill, width: `${size}px` }"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"
    ></path>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component
export default class FolderIcon extends Vue {
  @Prop({ default: "", type: String })
  private readonly fill!: string;

  @Prop({ default: 32, type: Number })
  private readonly size!: number;
}
</script>

<style lang="scss" scoped></style>
