<template>
  <section id="profile" class="section wrapper--dark wrapper--pad-sm">
    <header class="section__header">
      <h2 class="section__heading">Profile</h2>
      <h3 class="section__subheading">Your personal information</h3>
    </header>

    <section class="section__body">
      <avatar :editable="true" :size="128" />
    </section>

    <section class="section__body">
      <form class="form form--start" novalidate @submit.prevent="">
        <div class="form__group">
          <label class="form__label" for="display-name">
            Display name
          </label>

          <input
            id="display-name"
            class="form__input form__input--light"
            name="display-name"
            spellcheck="false"
            type="text"
            :value="$accessor.user.displayName"
          />
        </div>

        <div class="form__group">
          <label class="form__label" for="email-address">
            Email Address
          </label>

          <input
            id="email-address"
            class="form__input form__input--light"
            name="email-address"
            spellcheck="false"
            type="email"
            :value="$accessor.user.email"
          />
        </div>

        <v-button ref="button" class="mt-3" theme="ok" type="submit">
          Save Profile
        </v-button>
      </form>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  transition: "fade"
})
export default class ProfileSettings extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/form.scss";
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
