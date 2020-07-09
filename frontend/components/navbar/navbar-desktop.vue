<template>
  <nav class="nav-desktop">
    <div class="nav-desktop__left">
      <ul class="nav-desktop__links">
        <li class="nav-desktop__link">
          <a class="nav-desktop__clickable" href="https://github.com/bytebin-xyz">Github</a>
        </li>

        <li class="nav-desktop__link">
          <nuxt-link class="nav-desktop__clickable" to="/docs">
            API
          </nuxt-link>
        </li>
      </ul>
    </div>

    <div class="nav-desktop__right">
      <ul class="nav-desktop__links">
        <template v-if="!$accessor.isAuthenticated">
          <li class="nav-desktop__link">
            <nuxt-link class="nav-desktop__clickable" to="/login">
              Log In
            </nuxt-link>
          </li>

          <li class="nav-desktop__link">
            <nuxt-link class="btn btn__register btn--light nav-desktop__clickable" to="/register">
              Sign Up
            </nuxt-link>
          </li>
        </template>

        <template v-else>
          <li class="nav-desktop__link">
            <nuxt-link class="nav-desktop__clickable nav-desktop__icon" to="/search">
              <stream-icon fill="#848BD8" :size="24" />
            </nuxt-link>
          </li>

          <li class="nav-desktop__link">
            <nuxt-link
              class="nav-desktop__clickable nav-desktop__icon"
              :to="`/files/@${$accessor.user.username}`"
            >
              <folder-icon fill="#848BD8" :size="24" />
            </nuxt-link>
          </li>

          <li class="nav-desktop__dropdown">
            <user-dropdown />
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class NavbarDesktop extends Vue {}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";

.btn__register {
  @apply px-5 py-3 #{!important};
}

.nav-desktop {
  @apply flex-row items-center hidden;
  @apply w-full;

  height: inherit;

  @screen md {
    @apply flex;
  }

  &__clickable {
    @apply cursor-pointer;
    @apply font-medium no-underline;
    @apply p-3;
    @apply rounded-sm;
    @apply text-base text-primary-300;

    &:not([class^="btn"]) {
      @apply border-none;

      &:focus,
      &:hover {
        @apply bg-primary-800;
      }
    }
  }

  &__dropdown {
    @apply ml-2;
  }

  &__icon {
    &:hover {
      @apply bg-primary-800;
    }
  }

  &__left,
  &__right {
    @apply flex flex-row items-center;
    @apply h-full;
  }

  &__left {
    @apply ml-4 mr-auto;
  }

  &__right {
    @apply ml-auto mr-2;
  }

  &__link {
    @apply items-center;
    @apply mx-1 my-0;

    display: inherit;

    &:first-child {
      @apply ml-0;
    }

    &:last-child {
      @apply mr-0;
    }
  }

  &__links {
    @apply flex flex-row;
    @apply list-none;
    @apply m-0 mr-auto;
    @apply overflow-hidden;
    @apply pt-1;
  }
}
</style>
