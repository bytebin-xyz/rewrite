<template>
  <section id="password" class="section wrapper--dark wrapper--pad-sm">
    <header class="section__header">
      <h2 class="section__heading">Change Password</h2>
      <h3 class="section__subheading">This will not log you out of devices.</h3>
    </header>

    <section class="section__body">
      <form class="form form--start" novalidate @submit.prevent="changePassword">
        <div class="form__group">
          <label class="form__label" for="old-password">
            Old Password
          </label>

          <input
            id="old-password"
            v-model="$v.oldPassword.$model"
            :class="{ 'form__input--error': $v.oldPassword.$error }"
            class="form__input form__input--light"
            name="old-password"
            spellcheck="false"
            type="password"
          />

          <div v-if="$v.oldPassword.$error" class="form__errors">
            <p v-if="!$v.oldPassword.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="new-password">
            New Passsword
          </label>

          <input
            id="new-password"
            v-model="$v.newPassword.$model"
            :class="{ 'form__input--error': $v.newPassword.$error }"
            class="form__input form__input--light"
            name="new-password"
            spellcheck="false"
            type="password"
          />

          <div v-if="$v.newPassword.$error" class="form__errors">
            <p v-if="!$v.newPassword.minLength" class="form__message">
              Passwords must be at least {{ $v.newPassword.$params.minLength.min }} characters long.
            </p>

            <p v-if="!$v.newPassword.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="repeat-password">
            Confirm New Passsword
          </label>

          <input
            id="repeat-password"
            v-model="$v.repeatPassword.$model"
            :class="{ 'form__input--error': $v.repeatPassword.$error }"
            class="form__input form__input--light"
            name="repeat-password"
            spellcheck="false"
            type="password"
          />

          <div v-if="$v.repeatPassword.$error" class="form__errors">
            <p v-if="!$v.repeatPassword.sameAsPassword" class="form__message">
              Your passwords do not match.
            </p>

            <p v-if="!$v.repeatPassword.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <v-button ref="button" class="mt-3" theme="ok" type="submit">
          Change Password
        </v-button>
      </form>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { minLength, required, sameAs } from "vuelidate/lib/validators";

import VButton from "@/components/v-button.vue";

@Component
export default class ChangePassword extends Vue {
  @Ref() readonly button!: VButton;

  @Validate({ minLength: minLength(8), required })
  private newPassword = "";

  @Validate({ required })
  private oldPassword = "";

  @Validate({ required, sameAsPassword: sameAs("newPassword") })
  private repeatPassword = "";

  async changePassword() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.button.pending();

    await this.$axios
      .post("/settings/change-password", {
        newPassword: this.newPassword,
        oldPassword: this.oldPassword
      })
      .then(() => {
        this.button.success();
        setTimeout(this.button.idle, 5000);
      })
      .catch((error: Error) => {
        this.button.idle();
        this.$toast.error(error.message);
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/form.scss";
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
