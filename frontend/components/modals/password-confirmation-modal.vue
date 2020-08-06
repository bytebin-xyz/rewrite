<template>
  <div class="modal modal--light">
    <div class="modal__header">
      <h2 class="modal__title">{{ title }}</h2>
    </div>

    <div class="modal__body">
      <form class="form" novalidate @submit.prevent="confirm">
        <div class="form__group">
          <label class="form__label" for="password">{{ description }}</label>

          <input
            id="password"
            v-model="$v.password.$model"
            class="form__input form__input--dark"
            :class="{ 'form__input--error': $v.password.$error }"
            autocomplete="new-password"
            name="password"
            spellcheck="false"
            type="password"
          />

          <div v-if="$v.password.$error" class="form__errors">
            <p v-if="!$v.password.required" class="form__message">
              Field is required.
            </p>
          </div>
        </div>

        <div class="btn__group btn__group--responsive btn__group--row mt-2">
          <v-button theme="dark" @click="$emit('close')">Cancel</v-button>
          <v-button theme="danger" type="submit">{{ action }}</v-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

import { Validate } from "vuelidate-property-decorators";
import { required } from "vuelidate/lib/validators";

@Component
export default class PasswordConfirmationModal extends Vue {
  @Prop({ required: true }) private readonly action!: string;
  @Prop({ required: true }) private readonly callback!: (password: string) => void;
  @Prop({ required: true }) private readonly description!: string;
  @Prop({ required: true }) private readonly title!: string;

  @Validate({ required })
  private password = "";

  private confirm() {
    if (this.$v.$invalid) return this.$v.$touch();

    this.$emit("close");
    this.callback(this.password);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";
@import "@/assets/scss/form.scss";
@import "@/assets/scss/modal.scss";
@import "@/assets/scss/wrapper.scss";
</style>
