<template>
  <div class="navbar">
    <nuxt-link class="navbar__brand" to="/">
      <logo />
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
  @apply bg-secondary-900;
  @apply box-border;
  @apply flex flex-row items-center;
  @apply mx-auto mt-4;
  @apply px-4 py-0;
  @apply rounded-lg;
  @apply shadow-lg;
  @apply w-full;

  height: 84px;
  max-width: 1600px;

  &__brand {
    @apply no-underline;
    @apply z-10;

    margin: 2px;
  }
}

.navbar::v-deep .nav-desktop__clickable,
.navbar::v-deep .nav-mobile__clickable {
  @apply cursor-pointer;
  @apply font-medium no-underline;

  letter-spacing: 0.5px;
  padding: 2px 5px;
}
</style>
