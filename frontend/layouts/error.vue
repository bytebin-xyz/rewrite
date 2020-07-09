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

      <code class="error__code">
        {{ error.message }}
      </code>
    </template>

    <nuxt-link class="error__return" to="/">
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
.error {
  @apply flex flex-col items-center;
  @apply px-10 py-8;

  &__code {
    @apply bg-red-400;
    @apply my-2;
    @apply overflow-auto;
    @apply px-4 py-3;
    @apply rounded;
    @apply text-red-900;

    max-height: 256px;
    max-width: 750px;
    min-width: 256px;
  }

  &__message {
    @apply font-normal text-2xl text-center text-primary-400;
    @apply my-6;
  }

  &__return {
    @apply bg-primary-500;
    @apply border-none rounded-sm;
    @apply font-semibold text-primary-900;
    @apply mt-6;
    @apply p-4;
    @apply rounded;

    transition: background-color 0.2s ease;

    &:hover {
      @apply bg-primary-600;
    }
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
