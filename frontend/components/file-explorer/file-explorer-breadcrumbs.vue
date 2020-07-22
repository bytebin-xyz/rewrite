<template>
  <div
    class="breadcrumbs"
    :class="{
      'breadcrumbs--dark': theme === 'dark',
      'breadcrumbs--light': theme === 'light'
    }"
  >
    <ol class="breadcrumbs__items">
      <li class="breadcrumb">
        <cloud-icon class="breadcrumb__cloud" fill="#CED1EF" :size="24" />
        <chevron-icon class="breadcrumb__arrow" direction="right" fill="#CED1EF" :size="8" />
      </li>

      <li v-for="(crumb, index) of crumbs" :key="index" class="breadcrumb">
        <span class="breadcrumb__name" @click="navigate(crumb)">
          {{ crumb.name }}
        </span>

        <chevron-icon
          v-if="index < crumbs.length - 1"
          class="breadcrumb__arrow"
          direction="right"
          fill="#CED1EF"
          :size="8"
        />
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

export enum BreadcrumbThemes {
  Dark = "dark",
  Light = "light"
}

export interface Crumb {
  name: string;
  path: string;
}

@Component
export default class Breadcrumbs extends Vue {
  @Prop({ default: BreadcrumbThemes.Dark })
  private readonly theme!: BreadcrumbThemes;

  private readonly crumbs: Crumb[] = [];

  backward(): Crumb | null {
    return this.crumbs.pop() || null;
  }

  forward(crumb: Crumb): Crumb {
    this.crumbs.push(crumb);

    return crumb;
  }

  goto(crumb: Crumb): Crumb {
    const index = this.crumbs.findIndex(({ path }) => path === crumb.path);

    if (index === -1) {
      throw new Error(`Breadcrumb "${crumb.name}" (${crumb.path}) does not exists!`);
    }

    return this.crumbs.splice(index + 1, this.crumbs.length - index)[0];
  }

  navigate(crumb: Crumb) {
    this.goto(crumb);
    this.$emit("navigate", crumb);
  }
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  @apply flex;
  @apply overflow-x-auto;
  @apply px-5 py-4;
  @apply rounded;
  @apply shadow-lg;

  &--dark {
    @apply bg-primary-900;
  }

  &--light {
    @apply bg-primary-800;
  }

  &__items {
    @apply flex flex-row items-center;
  }
}

.breadcrumb {
  @apply flex;
  @apply text-primary-300;

  &:last-child {
    @apply pr-6;
  }

  &__arrow {
    @apply inline-block;
    @apply mx-3;
  }

  &__cloud {
    @apply cursor-default;
    @apply inline-block;
  }

  &__name {
    @apply whitespace-no-wrap;

    &:hover {
      @apply cursor-pointer;
      @apply text-primary-100;
    }
  }
}
</style>
