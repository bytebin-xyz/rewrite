<template>
  <nav class="breadcrumbs">
    <ol class="breadcrumbs__items">
      <li class="breadcrumb">
        <img alt="" class="breadcrumb__cloud" src="@/assets/svg/cloud.svg" />
      </li>

      <li v-for="(item, index) of items" :key="item" class="breadcrumb">
        <span class="breadcrumb__name" @click="$emit('click', item, index)">{{ item }}</span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component
export default class Breadcrumbs extends Vue {
  @Prop({
    default: () => [],
    type: Array,
    validator: (value) => value.every((v: any) => typeof v === "string")
  })
  private readonly items!: string[];
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  @apply bg-secondary-900;
  @apply px-6 py-4;
  @apply rounded;
  @apply shadow-lg;

  &__items {
    @apply flex flex-row items-center;
  }
}

.breadcrumb {
  @apply flex;
  @apply text-secondary-300;

  &:not(:last-child)::after {
    content: url("../assets/svg/chevron-right.svg");

    @apply inline-block;
    @apply mx-3;

    width: 8px;
  }

  &__cloud {
    @apply cursor-default;
    @apply inline-block;

    width: 24px;
  }

  &__name {
    &:hover {
      @apply cursor-pointer;
      @apply text-secondary-100;
    }
  }
}
</style>
