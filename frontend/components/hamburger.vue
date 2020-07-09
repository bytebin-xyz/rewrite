<template>
  <button
    ref="hamburger"
    class="hamburger hamburger--collapse"
    type="button"
    :aria-expanded="collapsed ? 'false' : 'true'"
    :class="{ 'is-active': !collapsed }"
    @click="toggle"
  >
    <span class="hamburger-box">
      <span class="hamburger-inner"></span>
    </span>
  </button>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

@Component
export default class Hamburger extends Vue {
  @Ref() private readonly hamburger!: HTMLButtonElement;

  private collapsed = true;

  collapse() {
    this.collapsed = true;
    this.$emit("click");
  }

  expand() {
    this.collapsed = false;
    this.$emit("click");
  }

  toggle() {
    if (this.collapsed) this.expand();
    else this.collapse();
  }
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
