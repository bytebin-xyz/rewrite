<template>
  <div id="reset-password">
    <h1>Reset your Password</h1>

    <div class="container container--light container--pad-sm">
      <form novalidate @submit.prevent="resetPassword">
        <div class="form__group">
          <label class="form__label" for="new-password">New Password</label>

          <input
            id="new-password"
            v-model="$v.newPassword.$model"
            class="form__input"
            :class="{ 'form__input--error': $v.newPassword.$error }"
            autocomplete="new-password"
            name="password"
            type="password"
          />

          <div v-if="$v.newPassword.$dirty && $v.newPassword.$error" class="form__group-errors">
            <p v-if="!$v.newPassword.minLength" class="form__group-error">
              Passwords must be at least {{ $v.newPassword.$params.minLength.min }} characters long.
            </p>

            <p v-if="!$v.newPassword.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="confirm-password">
            Confirm Password
          </label>

          <input
            id="confirm-password"
            v-model="$v.repeatPassword.$model"
            class="form__input"
            :class="{ 'form__input--error': $v.repeatPassword.$error }"
            autocomplete="new-password"
            name="confirm-password"
            type="password"
          />

          <div
            v-if="$v.repeatPassword.$dirty && $v.repeatPassword.$error"
            class="form__group-errors"
          >
            <p v-if="!$v.repeatPassword.sameAsPassword" class="form__group-error">
              Your password does not match.
            </p>

            <p v-if="!$v.repeatPassword.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div v-if="error" class="form__group">
          <div class="form__group-errors">
            <p class="form__group-error">
              {{ error }}
            </p>
          </div>
        </div>

        <v-button ref="button" class="mt-4" type="submit">
          Reset Password
        </v-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { minLength, required, sameAs } from "vuelidate/lib/validators";

import VButton from "../../components/v-button.vue";

@Component({
  layout: "clean",
  transition: "fade"
})
export default class ResetPassword extends Vue {
  @Ref() private readonly button!: VButton;

  @Validate({ minLength: minLength(8), required })
  private newPassword = "";

  @Validate({ required, sameAsPassword: sameAs("newPassword") })
  private repeatPassword = "";

  private error: string | null = null;

  resetPassword() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.button.pending();

    this.$axios
      .post("/auth/reset-password", {
        newPassword: this.newPassword,
        token: this.$route.params.token
      })
      .then(() => {
        this.button.success();

        setTimeout(() => this.$router.push("/login"), 1500);
      })
      .catch((error: Error) => {
        this.button.idle();
        this.error = error.message;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";
@import "@/assets/scss/container.scss";
@import "@/assets/scss/form.scss";

#reset-password {
  @apply m-auto;
  @apply max-w-lg;
  @apply px-4;
}

h1 {
  @apply font-medium text-3xl text-center text-secondary-200;
  @apply mb-3;
  @apply text-2xl;

  @screen sm {
    @apply text-3xl;
  }
}

h2 {
  @apply leading-loose;
  @apply text-center text-lg text-secondary-300;

  @screen md_max {
    @apply leading-normal;
    @apply text-base;
  }

  & a {
    @apply text-secondary-400;
    @apply underline;

    &:hover {
      @apply text-secondary-500;
    }
  }
}
</style>
