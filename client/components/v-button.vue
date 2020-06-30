<template>
  <button
    :class="{
      'btn--fail': status === 'fail',
      'btn--pending': status === 'pending',
      'btn--success': status === 'success',

      'btn--dark': theme === 'dark',
      'btn--light': theme === 'light'
    }"
    :disabled="status !== 'idle'"
    :type="type"
    class="btn"
  >
    <div v-if="status === 'fail'">
      <cross-icon fill="#fff" :height="24" />
    </div>

    <beat-loader
      v-else-if="status === 'pending'"
      class="flex"
      color="#848BD8"
      sizeUnit="px"
      :loading="true"
      :size="10"
    />

    <div v-else-if="status === 'success'">
      <checkmark-icon fill="#fff" :height="24" />
    </div>

    <slot v-else />
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
  Dark = "dark",
  Light = "light"
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
