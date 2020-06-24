<template>
  <button
    ref="hamburger"
    aria-label="Menu"
    class="hamburger hamburger--collapse"
    type="button"
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

  collapse() {
    this.hamburger.classList.remove("is-active");
  }

  expand() {
    this.hamburger.classList.add("is-active");
  }

  toggle() {
    this.hamburger.classList.toggle("is-active");
    this.$emit("click");
  }
}
</script>

<style lang="scss" scoped>
@import "~hamburgers/_sass/hamburgers/hamburgers";

.hamburger {
  @apply flex;

  &-inner,
  &-inner::after,
  &-inner::before {
    @apply bg-secondary-600 #{!important};
  }
}
</style>
