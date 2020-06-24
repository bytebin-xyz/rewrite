<template>
  <div id="app">
    <div id="app__navbar">
      <navbar />
    </div>

    <div id="app__view">
      <nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import "focus-visible";

@Component
export default class DefaultLayout extends Vue {}
</script>

<style lang="scss">
[data-focus-visible-added]:focus {
  @apply border-2 border-solid border-secondary-400 rounded #{!important};
  @apply outline-none #{!important};
}

*:focus:not([data-focus-visible-added]) {
  @apply outline-none;
}

body {
  @apply bg-secondary-800;
  // background: linear-gradient(to bottom right, #282A41, #4F5382);
  // background-repeat: no-repeat;
  // background-size: cover;

  font-family: "Roboto", sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}

#app__navbar {
  // @apply bg-secondary-900;
  // @apply shadow-lg;
  @apply px-4;
}

#app__view {
  @apply px-0 py-12;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-active {
  @apply opacity-0;
}
</style>
