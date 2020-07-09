<template>
  <div id="forgot-password">
    <h1>Reset your Password</h1>

    <div v-if="sent" class="wrapper wrapper--light wrapper--pad-sm">
      <h2>
        We have sent you an email containing a link to reset your password. If you do not receive it
        within a few minutes, check your spam folder.
      </h2>

      <nuxt-link class="btn btn--dark mt-4" to="/login">
        Return to Login
      </nuxt-link>
    </div>

    <template v-else>
      <h2 class="mb-4">
        Enter the email associated with your account and we will send you further instructions to
        reset your password.
      </h2>

      <div class="wrapper wrapper--light wrapper--pad-sm">
        <form class="form" novalidate @submit.prevent="sendPasswordResetEmail">
          <div class="form__group">
            <label class="form__label" for="email">Email Address</label>

            <input
              id="email"
              v-model="$v.email.$model"
              class="form__input form__input--dark"
              :class="{ 'form__input--error': $v.email.$error }"
              name="email"
              type="email"
            />

            <div v-if="$v.email.$dirty && $v.email.$error" class="form__errors">
              <p v-if="!$v.email.email" class="form__message">
                You must enter a valid email address.
              </p>

              <p v-if="!$v.email.required" class="form__message">Field is required.</p>
            </div>
          </div>

          <div v-if="error" class="form__group form__errors">
            <p class="form__message">{{ error }}</p>
          </div>

          <div class="form__group">
            <v-button ref="button" type="submit">
              Send Password Reset Email
            </v-button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { email, required } from "vuelidate/lib/validators";

import VButton from "@/components/v-button.vue";

@Component({
  meta: {
    guestOnly: true
  },
  layout: "clean",
  transition: "fade"
})
export default class ForgotPassword extends Vue {
  @Ref() readonly button!: VButton;

  @Validate({ email, required })
  private email = "";

  private error: string | null = null;
  private sent = false;

  sendPasswordResetEmail() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.button.pending();

    this.$axios
      .post("/auth/forgot-password", { email: this.email })
      .then(() => {
        this.button.success();

        this.error = null;
        this.sent = true;
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
@import "@/assets/scss/form.scss";
@import "@/assets/scss/wrapper.scss";

#forgot-password {
  @apply m-auto;
  @apply max-w-lg;
  @apply px-4;
}

h1 {
  @apply font-medium text-3xl text-center text-primary-200;
  @apply mb-3;
  @apply text-2xl;

  @screen sm {
    @apply text-3xl;
  }
}

h2 {
  @apply leading-loose;
  @apply text-center text-lg text-primary-300;

  @screen md_max {
    @apply leading-normal;
    @apply text-base;
  }

  & a {
    @apply text-primary-400;
    @apply underline;

    &:hover {
      @apply text-primary-500;
    }
  }
}
</style>
