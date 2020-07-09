<template>
  <button
    :class="{
      'btn--fail': status === 'fail',
      'btn--pending': status === 'pending',
      'btn--success': status === 'success',

      'btn--danger': theme === 'danger',
      'btn--dark': theme === 'dark',
      'btn--light': theme === 'light',
      'btn--ok': theme === 'ok'
    }"
    :disabled="status !== 'idle'"
    :type="type"
    class="btn"
    @click="(event) => $emit('click', event)"
  >
    <cross-icon v-if="status === 'fail'" class="btn__indicator" fill="#fff" :size="20" />

    <beat-loader
      v-else-if="status === 'pending'"
      class="btn__indicator"
      size-unit="px"
      :color="theme === 'danger' ? '#FC8181' : theme === 'ok' ? '#68D391' : '#848BD8'"
      :loading="true"
      :size="10"
    />

    <checkmark-icon
      v-else-if="status === 'success'"
      class="btn__indicator"
      fill="#fff"
      :size="24"
    />

    <!-- Preserve width of button -->
    <div :style="{ opacity: status === 'idle' ? 100 : 0 }">
      <slot />
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

export enum ButtonStatus {
  Fail = "fail",
  Idle = "idle",
  Pending = "pending",
  Success = "success"
}

export enum ButtonTheme {
  Danger = "danger",
  Dark = "dark",
  Light = "light",
  Ok = "ok"
}

export enum ButtonType {
  Button = "button",
  Menu = "menu",
  Reset = "reset",
  Submit = "submit"
}

@Component
export default class VButton extends Vue {
  @Prop({
    default: ButtonTheme.Dark,
    type: String,
    validator: (theme: any) => Object.values(ButtonTheme).includes(theme)
  })
  private readonly theme!: ButtonTheme;

  @Prop({
    default: ButtonType.Button,
    type: String,
    validator: (type: any) => Object.values(ButtonType).includes(type)
  })
  private readonly type!: ButtonType;

  private status = ButtonStatus.Idle;

  fail() {
    this.status = ButtonStatus.Fail;
  }

  idle() {
    this.status = ButtonStatus.Idle;
  }

  pending() {
    this.status = ButtonStatus.Pending;
  }

  success() {
    this.status = ButtonStatus.Success;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";
</style>
