<template>
  <div id="login">
    <h1>Sign In</h1>

    <h2>
      Don't have an account yet?
      <nuxt-link to="/register">
        Sign Up
      </nuxt-link>
    </h2>

    <div class="wrapper wrapper--light wrapper--pad-sm">
      <form class="form" novalidate @submit.prevent="login">
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
            <p v-if="!$v.username.required" class="form__group-error">
              Field is required.
            </p>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label form__label--password" for="password">
            <span class="mr-3">Password</span>
            <nuxt-link class="form__forgot-password" to="/forgot-password">
              Forgot Password?
            </nuxt-link>
          </label>

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
            <p v-if="!$v.password.required" class="form__group-error">
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
          Log In
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
import { required } from "vuelidate/lib/validators";

import VButton from "../components/v-button.vue";

@Component({
  meta: {
    guestOnly: true
  },
  layout: "clean",
  transition: "fade"
})
export default class Login extends Vue {
  @Ref() private readonly button!: VButton;

  @Validate({ required })
  private password = "";

  @Validate({ required })
  private username = "";

  private error: string | null = null;

  async mounted() {
    if (this.$accessor.isAuthenticated) {
      return this.$router.push("/");
    }

    await this.$recaptcha.init();
  }

  async login() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.button.pending();

    this.$accessor
      .login({
        password: this.password,
        recaptcha: await this.$recaptcha.execute("login"),
        username: this.username
      })
      .then(() => {
        this.button.success();

        setTimeout(() => this.$router.push("/profile"), 1500);
      })
      .catch((error: Error) => {
        this.error = error.message;
        this.password = "";

        this.button.idle();
        this.$v.password.$reset();
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/form.scss";
@import "@/assets/scss/wrapper.scss";

.form {
  &__forgot-password {
    @apply ml-auto pt-0 px-1;
    @apply no-underline text-primary-500;

    &:hover,
    &:visited:hover {
      @apply text-primary-600;
    }
  }

  &__label--password {
    @apply flex flex-row;
  }
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

#login {
  @apply m-auto;
  @apply max-w-lg;
  @apply px-4;
}
</style>
