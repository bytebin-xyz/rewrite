<template>
  <button
    :class="{
      'btn--fail': status === 'fail',
      'btn--pending': status === 'pending',
      'btn--success': status === 'success'
    }"
    :disabled="status !== 'idle'"
    :type="type"
    class="btn"
  >
    <div v-if="status === 'fail'" class="btn__icon-container">
      <img alt="X" class="btn__icon" src="@/assets/svg/cross.svg" />
    </div>

    <beat-loader
      v-else-if="status === 'pending'"
      class="flex"
      color="#848BD8"
      sizeUnit="px"
      :loading="true"
      :size="10"
    />

    <div v-else-if="status === 'success'" class="btn__icon-container">
      <img alt=":)" class="btn__icon" src="@/assets/svg/checkmark.svg" />
    </div>

    <slot v-else />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component
export default class VButton extends Vue {
  @Prop(String) readonly type!: "button" | "menu" | "reset" | "submit";

  private status: "fail" | "idle" | "pending" | "success" = "idle";

  fail() {
    this.status = "fail";
  }

  idle() {
    this.status = "idle";
  }

  pending() {
    this.status = "pending";
  }

  success() {
    this.status = "success";
  }
}
</script>

<style lang="scss" scoped>
.btn {
  @apply bg-secondary-900;
  @apply border-none rounded-sm;
  @apply cursor-pointer;
  @apply flex items-center justify-center;
  @apply font-semibold text-secondary-400;
  @apply mx-0 my-4;
  @apply p-4;
  @apply w-full;

  height: 48px;
  transition: background-color 0.2s ease;

  &--fail,
  &--pending,
  &--success {
    @apply cursor-default;
    @apply px-0 py-3;
  }

  &--fail {
    @apply bg-red-600 #{!important};
  }

  &--pending {
    @apply bg-secondary-900 #{!important};
  }

  &--success {
    @apply bg-green-600 #{!important};
  }

  &:focus,
  &:hover {
    background-color: lighten(#282a41, 2%);
  }

  &__icon-container {
    @apply text-white;
  }

  &__icon {
    height: 24px;
  }
}
</style>
