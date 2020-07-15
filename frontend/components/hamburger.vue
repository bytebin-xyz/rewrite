<template>
  <button
    ref="hamburger"
    class="hamburger hamburger--collapse"
    type="button"
    :aria-expanded="String(!collapsed)"
    :class="{ 'is-active': !collapsed }"
    @click="(event) => $emit('click', event)"
  >
    <span class="hamburger-box">
      <span class="hamburger-inner"></span>
    </span>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "nuxt-property-decorator";

@Component
export default class Hamburger extends Vue {
  @Prop({ default: true, required: true }) private readonly collapsed!: boolean;

  @Ref() private readonly hamburger!: HTMLButtonElement;
}
</script>

<style lang="scss" scoped>
@import "~hamburgers/_sass/hamburgers/hamburgers";

.hamburger {
  @apply flex;

  &:focus {
    @apply outline-none;
  }

  &[data-focus-visible-added]:focus {
    @apply bg-primary-800;
    @apply rounded-lg;
  }

  &-inner,
  &-inner::after,
  &-inner::before {
    @apply bg-primary-600 #{!important};
  }
}
</style>
