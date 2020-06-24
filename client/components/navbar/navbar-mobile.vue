<template>
  <nav class="nav-mobile">
    <hamburger
      id="hamburger"
      ref="hamburger"
      aria-controls="nav-dropdown"
      :aria-expanded="opened"
      class="nav-mobile__hamburger"
      @click="opened = !opened"
    />

    <ul
      id="nav-dropdown"
      :class="{ 'nav-mobile__links--opened': opened }"
      class="nav-mobile__links"
      aria-labelledby="hamburger"
    >
      <template v-if="!$accessor.isAuthenticated">
        <li class="nav-mobile__link">
          <nuxt-link class="nav-mobile__clickable" to="/login">
            Log In
          </nuxt-link>
        </li>

        <li class="nav-mobile__link">
          <nuxt-link class="nav-mobile__clickable" to="/register">
            Sign Up
          </nuxt-link>
        </li>
      </template>

      <template v-else>
        <li class="nav-mobile__link">
          <nuxt-link class="nav-mobile__clickable" to="/@me/files">
            My Files
          </nuxt-link>
        </li>

        <li class="nav-mobile__link">
          <nuxt-link class="nav-mobile__clickable" to="/search">
            Search
          </nuxt-link>
        </li>

        <li class="nav-mobile__link">
          <nuxt-link class="nav-mobile__clickable" to="/settings">
            Settings
          </nuxt-link>
        </li>
      </template>

      <li class="nav-mobile__link">
        <a class="nav-mobile__clickable" href="https://github.com/bytebin-xyz">Github</a>
      </li>

      <li class="nav-mobile__link">
        <nuxt-link class="nav-mobile__clickable" to="/docs">
          API
        </nuxt-link>
      </li>

      <li v-if="$accessor.isAuthenticated" class="nav-mobile__link">
        <button
          class="nav-mobile__clickable"
          @click="$accessor.logout().finally(() => $router.push('/'))"
        >
          Log Out
        </button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import Hamburger from "../hamburger.vue";

@Component
export default class NavbarMobile extends Vue {
  @Ref() readonly hamburger!: Hamburger;

  opened = false;

  private created() {
    this.$router.beforeEach((_, __, next) => {
      this.hamburger.collapse();
      this.opened = false;

      next();
    });
  }
}
</script>

<style lang="scss" scoped>
.nav-mobile {
  @apply box-border;
  @apply flex-row hidden items-center justify-end;
  @apply w-full;

  height: inherit;

  @media screen and (max-width: 767px) {
    @apply flex;
  }

  &__clickable {
    @apply cursor-pointer;
    @apply font-medium no-underline;
  }

  &__hamburger {
    @apply ml-3;
    @apply z-10;

    min-width: 45px;
  }

  &__link {
    @apply flex items-center;
    @apply h-full;
    @apply mx-0 my-3;
    @apply px-1 py-0;
    @apply text-lg text-secondary-300;

    height: 40px;

    &:hover {
      @apply text-secondary-400;
    }
  }

  &__links {
    @apply absolute;
    @apply bg-secondary-900;
    @apply box-border;
    @apply flex-col hidden;
    @apply left-0 top-0;
    @apply list-none;
    @apply mt-4 mx-4;
    @apply overflow-hidden;
    @apply p-0;
    @apply rounded-lg;
    @apply shadow-xl;
    @apply w-full;

    width: calc(100% - 32px);

    &--opened {
      @apply flex;

      padding: 84px 20px 15px 20px;
    }
  }
}
</style>
