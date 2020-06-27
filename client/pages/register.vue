<template>
  <div id="register">
    <h1>Create Your Account</h1>

    <h2>
      Already have an account?
      <nuxt-link to="/login">
        Sign In
      </nuxt-link>
    </h2>

    <div class="container container--light container--pad-sm">
      <form class="form" novalidate @submit.prevent="register">
        <div class="form__group">
          <label class="form__label" for="username">Username</label>

          <input
            id="username"
            v-model="$v.username.$model"
            class="form__input"
            :class="{ 'form__input--error': $v.username.$error }"
            autocomplete="username"
            name="username"
            type="text"
          />

          <div v-if="$v.username.$dirty && $v.username.$error" class="form__group-errors">
            <p v-if="!$v.username.alphaNum" class="form__group-error">
              Usernames must be alphanumeric.
            </p>

            <p v-if="!$v.username.maxLength" class="form__group-error">
              Usernames cannot exceed {{ $v.username.$params.maxLength.max }} characters.
            </p>

            <p v-if="!$v.username.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="email">Email Address</label>

          <input
            id="email"
            v-model="$v.email.$model"
            class="form__input"
            :class="{ 'form__input--error': $v.email.$error }"
            name="email"
            type="email"
          />

          <div v-if="$v.email.$dirty && $v.email.$error" class="form__group-errors">
            <p v-if="!$v.email.email" class="form__group-error">
              You must enter a valid email address.
            </p>

            <p v-if="!$v.email.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="password">Password</label>

          <input
            id="password"
            v-model="$v.password.$model"
            class="form__input"
            :class="{ 'form__input--error': $v.password.$error }"
            autocomplete="new-password"
            name="password"
            type="password"
          />

          <div v-if="$v.password.$dirty && $v.password.$error" class="form__group-errors">
            <p v-if="!$v.password.minLength" class="form__group-error">
              Passwords must be at least {{ $v.password.$params.minLength.min }} characters long.
            </p>

            <p v-if="!$v.password.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="confirm-password">>Confirm Password</label>

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

        <v-button ref="button" class="my-3" type="submit">
          Register
        </v-button>
      </form>

      <p class="recaptcha">
        This site is protected by reCAPTCHA and the Google
        <a class="recaptcha__link" href="https://policies.google.com/privacy">Privacy Policy</a> and
        <a class="recaptcha__link" href="https://policies.google.com/terms">Terms of Service</a>
        apply.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { alphaNum, email, maxLength, minLength, required, sameAs } from "vuelidate/lib/validators";

import VButton from "../components/v-button.vue";

@Component({
  meta: {
    guestOnly: true
  },
  layout: "clean",
  transition: "fade"
})
export default class Register extends Vue {
  @Ref() readonly button!: VButton;

  @Validate({ email, required })
  private email = "";

  @Validate({ minLength: minLength(8), required })
  private password = "";

  @Validate({ required, sameAsPassword: sameAs("password") })
  private repeatPassword = "";

  @Validate({ alphaNum, maxLength: maxLength(32), required })
  private username = "";

  private error: string | null = null;

  async mounted() {
    if (this.$accessor.isAuthenticated) {
      return this.$router.push("/");
    }

    await this.$recaptcha.init();
  }

  async register() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.button.pending();

    this.$accessor
      .register({
        email: this.email,
        password: this.password,
        recaptcha: await this.$recaptcha.execute("register"),
        username: this.username
      })
      .then(() => {
        this.button.success();

        setTimeout(() => {
          this.$router.push("/profile");
        }, 1500);
      })
      .catch((error: Error) => {
        this.error = error.message;
        this.button.idle();
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/container.scss";
@import "@/assets/scss/form.scss";

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

.recaptcha {
  @apply font-normal text-sm text-primary-300;
  @apply leading-relaxed;
  @apply mb-0 mt-2;

  &__link {
    @apply text-primary-400;

    &:hover {
      @apply text-primary-500;
    }
  }
}

#register {
  @apply m-auto;
  @apply max-w-lg;
  @apply px-6;
}
</style>
