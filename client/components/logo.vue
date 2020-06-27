<template>
  <div class="logo">
    <svg
      class="logo__icon"
      :style="styles"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
    >
      <defs>
        <linearGradient
          id="gradient"
          gradientTransform="rotate(25)"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stop-color="#395ECA" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#848BD8" stop-opacity="1"></stop>
        </linearGradient>
      </defs>

      <g
        fill="url(#gradient)"
        stroke="none"
        transform="matrix(2.307047149677675,0,0,2.307047149677675,34.4930804602759,45.72377725462586)"
      >
        <path
          d="M87.962 53.238c-.119-10.771-8.874-19.723-19.672-19.723a19.587 19.587 0 0 0-10.583 3.089C54.243 24.922 43.434 16.398 30.63 16.398c-15.598 0-28.243 13.203-28.243 28.801C2.387 60.799 15.032 74 30.63 74H87.658c5.571 0 10.089-4.816 10.089-10.388 0-5.469-4.354-10.212-9.785-10.374zm-45.354-8.146c-.335.745-1.076.908-1.892.908H37v10.178C37 57.324 34.97 58 33.825 58h-6.639C26.039 58 24 57.324 24 56.178V46h-3.661c-.816 0-1.558-.163-1.893-.908-.334-.748-.199-1.302.343-1.914l10.188-11.455c.787-.884 2.314-.884 3.101 0l10.188 11.455c.542.612.677 1.166.342 1.914z"
        ></path>
      </g>
    </svg>

    <span v-if="!hideBrandName" class="logo__name">Bytebin</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
  head: {
    link: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@700&display=swap"
      }
    ]
  }
})
export default class Logo extends Vue {
  @Prop({ default: false, type: Boolean })
  private readonly hideBrandName!: boolean;

  @Prop({ default: 72, type: Number })
  private readonly size!: number;

  get styles() {
    return {
      width: `${this.size}px`
    };
  }
}
</script>

<style lang="scss" scoped>
.logo {
  @apply flex items-center justify-center;

  &__name {
    @apply font-bold text-2xl text-secondary-400;

    font-family: "IBM Plex Sans", sans-serif;

    @screen xs_max {
      @apply hidden;
    }
  }
}
</style>
