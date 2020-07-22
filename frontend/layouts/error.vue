<template>
  <div class="error">
    <template v-if="error.statusCode === 404">
      <h1 class="error__title">
        Page not found!
      </h1>

      <h2 class="error__message">
        Sorry, but the page you were looking for could not be found.
      </h2>
    </template>

    <template v-else>
      <h1 class="error__title">
        An error has occurred!
      </h1>

      <h2 class="error__message">
        Sorry, but we are currently experiencing an issue. Please try again later!
      </h2>
    </template>

    <nuxt-link class="btn btn--ok btn--responsive mt-4 shadow-md" to="/">
      Return to Homepage
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
  layout: "clean",
  transition: "fade"
})
export default class ErrorPage extends Vue {
  @Prop() private readonly error: any;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button";

.error {
  @apply flex flex-col items-center;
  @apply px-10 py-8;

  &__message {
    @apply font-normal text-2xl text-center text-primary-400;
    @apply my-6;
  }

  &__title {
    @apply font-bold text-3xl text-center text-primary-300;
    @apply m-0;
    @apply text-4xl;

    @screen sm {
      @apply text-5xl;
    }
  }
}
</style>
