<template>
  <button
    ref="button"
    class="btn"
    :class="{
      'btn--danger': status === 'fail' || theme === 'danger',
      'btn--dark': (status === 'idle' || status === 'pending') && theme === 'dark',
      'btn--disabled': (status === 'idle' || status === 'pending') && theme === 'disabled',
      'btn--light': (status === 'idle' || status === 'pending') && theme === 'light',
      'btn--ok': status === 'success' || theme === 'ok'
    }"
    :disabled="disabled || theme === 'disabled'"
    @click="(event) => $emit('click', event)"
  >
    <cross-icon v-if="status === 'fail'" class="btn__indicator" fill="#fff" :size="20" />

    <beat-loader
      v-else-if="status === 'pending'"
      class="btn__indicator"
      size-unit="px"
      :color="
        theme === 'danger'
          ? '#FEB2B2'
          : theme === 'dark' || theme === 'light'
          ? '#848BD8'
          : theme === 'disabled'
          ? '#A0AEC0'
          : theme === 'ok'
          ? '#9AE6B4'
          : ''
      "
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
  Disabled = "disabled",
  Light = "light",
  Ok = "ok"
}

@Component
export default class VButton extends Vue {
  @Prop({
    default: ButtonTheme.Dark,
    validator: (theme: any) => Object.values(ButtonTheme).includes(theme)
  })
  private readonly theme!: ButtonTheme;

  private disabled = false;
  private status = ButtonStatus.Idle;

  fail() {
    this.disabled = true;
    this.status = ButtonStatus.Fail;
  }

  idle() {
    this.disabled = false;
    this.status = ButtonStatus.Idle;
  }

  pending() {
    this.disabled = true;
    this.status = ButtonStatus.Pending;
  }

  success() {
    this.disabled = true;
    this.status = ButtonStatus.Success;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";

.btn {
  &__indicator {
    @apply absolute;
    @apply flex;
  }
}
</style>
