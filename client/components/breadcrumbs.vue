<template>
  <nav class="breadcrumbs">
    <ol class="breadcrumbs__items">
      <li class="breadcrumb">
        <cloud-icon class="breadcrumb__cloud" fill="#CED1EF" :size="24" />
        <chevron-icon class="breadcrumb__arrow" direction="right" fill="#CED1EF" :size="8" />
      </li>

      <li v-for="(item, index) of items" :key="item" class="breadcrumb">
        <span class="breadcrumb__name" @click="$emit('click', item, index)">
          {{ item }}
        </span>

        <chevron-icon
          v-if="index < items.length - 1"
          class="breadcrumb__arrow"
          direction="right"
          fill="#CED1EF"
          :size="8"
        />
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
  @apply bg-primary-900;
  @apply px-6 py-4;
  @apply rounded;
  @apply shadow-lg;

  &__items {
    @apply flex flex-row items-center;
  }
}

.breadcrumb {
  @apply flex;
  @apply text-primary-300;

  &__arrow {
    @apply inline-block;
    @apply mx-3;
  }

  &__cloud {
    @apply cursor-default;
    @apply inline-block;
  }

  &__name {
    &:hover {
      @apply cursor-pointer;
      @apply text-primary-100;
    }
  }
}
</style>
