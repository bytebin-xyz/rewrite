<template>
  <div id="app">
    <div id="app__navbar">
      <navbar />
    </div>

    <div id="app__view">
      <div id="app__container">
        <nuxt />
      </div>
    </div>
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

  font-family: "Roboto", sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;

  & #app {
    @apply mt-4;
  }

  & #app__container {
    @apply mx-auto;

    max-width: 1600px;
  }

  & #app__navbar,
  & #app__view {
    @apply px-4;
  }

  & #app__view {
    @apply py-12;
  }
}
</style>
