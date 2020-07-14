<template>
  <div class="settings">
    <sidenav
      class="settings__sidenav"
      :items="[
        { name: 'General', to: '/settings/general', children: ['Profile', 'Danger Zone'] },
        {
          name: 'Security',
          to: '/settings/security',
          children: ['Password', 'Two Step Authentication', 'Sessions']
        }
      ]"
    />

    <nuxt-child class="settings__view" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Settings extends Vue {}
</script>

<style lang="scss" scoped>
.settings {
  @apply flex flex-row;

  @screen md_max {
    @apply flex-col;
  }

  &__sidenav {
    @apply mb-6 mr-6 mt-0 #{!important};
    @apply shadow-lg;
    @apply sticky;

    min-width: 260px;
    top: 25px;

    @screen md_max {
      @apply static;
      @apply w-full;
    }
  }

  &__view {
    @apply flex flex-col;
    @apply w-5/6;

    min-width: 262px;

    @screen md_max {
      @apply w-full;
    }
  }
}
</style>
