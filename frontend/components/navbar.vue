<template>
  <div class="navbar">
    <nuxt-link class="navbar__brand" to="/">
      <logo :size="72" />
    </nuxt-link>

    <navbar-desktop />
    <navbar-mobile />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class Navbar extends Vue {}
</script>

<style lang="scss" scoped>
.navbar {
  @apply bg-primary-900;
  @apply box-border;
  @apply flex flex-row items-center;
  @apply mx-auto;
  @apply px-4 py-0;
  @apply rounded-lg;
  @apply shadow-lg;
  @apply w-full;

  height: 84px;
  letter-spacing: 0.5px;
  max-width: 1600px;

  &__brand {
    @apply no-underline;
    @apply z-10;

    margin: 2px;
  }
}
</style>
