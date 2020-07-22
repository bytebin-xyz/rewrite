<template>
  <div id="app">
    <header id="app__navbar">
      <navbar />
    </header>

    <main id="app__view">
      <div id="app__container">
        <nuxt />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import "focus-visible";

@Component({
  head: {
    bodyAttrs: {
      id: "layout__default"
    }
  }
})
export default class DefaultLayout extends Vue {}
</script>

<style lang="scss">
#layout__default {
  @apply bg-primary-800;

  & #app {
    @apply mt-4;
    @apply px-4;
  }

  & #app__container {
    @apply mx-auto;

    max-width: 1600px;
  }

  & #app__view {
    @apply py-10;
  }
}
</style>
