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
            <nuxt-link class="nav-desktop__clickable nav-desktop__register" to="/register">
              Sign Up
            </nuxt-link>
          </li>
        </template>

        <template v-else>
          <li class="nav-desktop__link">
            <nuxt-link class="nav-desktop__clickable nav-desktop__icon" to="/@me/files">
              <img alt="My Files" src="@/assets/svg/search.svg" srcset="" />
            </nuxt-link>
          </li>

          <li class="nav-desktop__link">
            <nuxt-link class="nav-desktop__clickable nav-desktop__icon" to="/@me/files">
              <img alt="My Files" src="@/assets/svg/folder.svg" srcset="" />
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
    @apply rounded;
    @apply text-base text-secondary-300;

    &:hover {
      @apply bg-secondary-800;
    }
  }

  &__dropdown {
    @apply ml-2;
  }

  &__icon {
    &:hover {
      @apply bg-secondary-800;
    }

    & img {
      height: 24px;
      width: 29px;
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

  &__register {
    @apply bg-secondary-800;
    @apply rounded-sm;
    @apply text-secondary-300 #{!important};
    @apply px-5 py-2 #{!important};

    transition: background-color 0.1s ease-in;

    &:hover {
      background-color: darken(#3b3f61, 3%);
    }
  }
}
</style>
