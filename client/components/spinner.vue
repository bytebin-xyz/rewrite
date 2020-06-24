<template>
  <div :class="`spinner--${size}`" class="spinner"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component
export default class Spinner extends Vue {
  @Prop({
    required: true,
    type: String,
    validator: (value: string) => ["small", "medium", "large"].includes(value)
  })
  readonly size!: string;
}
</script>

<style lang="scss" scoped>
@import "~spinthatshit/src/loaders.scss";

.spinner {
  @apply mx-auto my-0;

  &--small {
    @include loader01($border-size: 3px, $color: #fff, $size: 1rem);
  }

  &--medium {
    @include loader01($border-size: 3px, $color: #fff, $size: 2rem);
  }

  &--large {
    @include loader01($border-size: 9px, $color: #fff, $size: 3rem);
  }
}
</style>
