<template>
  <nav class="sidenav wrapper wrapper--dark">
    <ul class="sidenav__sections">
      <li v-for="({ children, name, to }, index) of items" :key="name" class="sidenav__section">
        <nuxt-link class="sidenav__link" :to="to">{{ name }}</nuxt-link>

        <ul
          v-if="children && children.length"
          :class="{ 'sidenav__children--opened': $route.path.split('/').pop() === kebabify(name) }"
          class="sidenav__children"
        >
          <li class="sidenav__divider"></li>

          <li v-for="(child, idx) of children" :key="child" class="sidenav__child">
            <nuxt-link class="sidenav__link" :to="`${to}#${kebabify(child)}`">
              {{ child }}
            </nuxt-link>

            <div v-if="idx < children.length - 1" class="sidenav__divider"></div>
          </li>
        </ul>

        <div v-if="index < items.length - 1" class="sidenav__divider"></div>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

import { kebabify } from "@/utils/kebabify";

export interface Items {
  children: string[];
  name: string;
  to: string;
}

@Component
export default class Sidenav extends Vue {
  @Prop() private readonly items!: Items[];

  kebabify(str: string) {
    return kebabify(str);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/wrapper.scss";

.sidenav {
  @apply h-full;

  &__child {
    > .sidenav__link {
      @apply px-10;
    }
  }

  &__children {
    @apply hidden;

    &--opened {
      @apply block;
    }
  }

  &__divider {
    @apply bg-primary-800;
    @apply block;

    height: 1px;
  }

  &__link {
    @apply block;
    @apply font-medium;
    @apply px-6 py-4;
    @apply text-primary-400;

    &.nuxt-link-active,
    &:focus,
    &:hover {
      @apply text-primary-200;
    }
  }
}
</style>
