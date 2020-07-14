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
      <form class="form form--start" novalidate @submit.prevent="updateProfile">
        <div class="form__group">
          <label class="form__label" for="display-name">
            Display name
          </label>

          <input
            id="display-name"
            v-model="$v.displayName.$model"
            class="form__input form__input--light"
            :class="{ 'form__input--error': $v.displayName.$error }"
            name="display-name"
            spellcheck="false"
            type="text"
          />

          <div v-if="$v.displayName.$error" class="form__errors">
            <p v-if="!$v.displayName.alphaNum" class="form__message">
              Display names must be alphanumeric.
            </p>

            <p v-if="!$v.displayName.maxLength" class="form__message">
              Display names cannot exceed {{ $v.displayName.$params.maxLength.max }} characters.
            </p>

            <p v-if="!$v.displayName.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="email-address">
            Email Address
          </label>

          <input
            id="email-address"
            v-model="$v.email.$model"
            class="form__input form__input--light"
            :class="{ 'form__input--error': $v.email.$error }"
            name="email-address"
            spellcheck="false"
            type="email"
          />

          <div v-if="$v.email.$error" class="form__errors">
            <p v-if="!$v.email.email" class="form__message">
              You must enter a valid email address.
            </p>

            <p v-if="!$v.email.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <v-button
          ref="button"
          class="mt-3"
          type="submit"
          :theme="!$v.$anyDirty || $v.$anyError || !edited ? 'disabled' : 'ok'"
        >
          Save Profile
        </v-button>
      </form>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { alphaNum, email, maxLength, required } from "vuelidate/lib/validators";

import VButton from "@/components/v-button.vue";

@Component({
  transition: "fade"
})
export default class ProfileSettings extends Vue {
  @Ref() private readonly button!: VButton;

  @Validate({ alphaNum, maxLength: maxLength(32), required })
  private displayName = this.$accessor.user!.displayName;

  @Validate({ email, required })
  private email = this.$accessor.user!.email;

  get edited() {
    return (
      this.displayName !== this.$accessor.user!.displayName ||
      this.email !== this.$accessor.user!.email
    );
  }

  async updateProfile() {
    const tasks = [];

    if (this.displayName !== this.$accessor.user!.displayName) {
      tasks.push(
        this.$axios
          .patch("/settings/change-display-name", { newDisplayName: this.displayName })
          .then(() => this.$toast.success("Display name successfully updated!"))
      );
    }

    if (this.email !== this.$accessor.user!.email) {
      tasks.push(
        this.$axios
          .post("/settings/change-email", { newEmail: this.email })
          .then(() => this.$toast.success("Please check your new email for an email confirmation!"))
      );
    }

    if (tasks.length) {
      this.button.pending();

      await Promise.all(tasks)
        .then(() => this.$accessor.me())
        .catch((error) => this.$toast.error(error.message));

      this.button.idle();
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/form.scss";
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
