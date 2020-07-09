<template>
  <section id="danger-zone" class="section wrapper wrapper--dark wrapper--pad-sm">
    <header class="section__header">
      <h2 class="section__heading">Danger Zone</h2>
      <h3 class="section__subheading">Destructive and irreversible actions</h3>
    </header>

    <section class="section__body">
      <section class="section wrapper wrapper--light wrapper--pad-sm">
        <header class="section__header">
          <h2 class="section__subheading">Delete your account.</h2>
          <h3 class="section__text">
            Once your account is deleted, all your files and related user data will permanently
            become inaccessible.
          </h3>
        </header>

        <v-button class="mt-5" theme="danger">Delete Account</v-button>
      </section>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  transition: "fade"
})
export default class DangerZoneSettings extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
