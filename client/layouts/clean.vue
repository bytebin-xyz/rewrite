<template>
  <div id="app">
    <div id="app__logo">
      <nuxt-link to="/">
        <logo :hideBrandName="true" :size="100" />
      </nuxt-link>
    </div>

    <div id="app__view">
      <nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import "focus-visible";

@Component({
  head: {
    bodyAttrs: {
      id: "layout__clean"
    }
  }
})
export default class CleanLayout extends Vue {}
</script>

<style lang="scss">
#layout__clean {
  @apply bg-secondary-900;

  font-family: "Roboto", sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;

  & #app__logo {
    @apply flex justify-center items-center;
    @apply mt-4;
  }

  & #app__view {
    @apply m-auto;
    @apply px-0 py-8;

    max-width: 1600px;
  }
}
</style>
