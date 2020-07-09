<template>
  <div v-click-outside="close" class="user-dropdown">
    <button class="user-dropdown__toggler" @click="toggle">
      <avatar :size="32" />

      <span class="user-dropdown__username user-dropdown__username--toggler">
        {{ $accessor.user.displayName }}
      </span>

      <chevron-icon direction="down" fill="#848BD8" :size="10" />
    </button>

    <ul
      ref="dropdown"
      class="user-dropdown__links"
      :class="{ 'user-dropdown__links--opened': opened }"
      @click="close"
    >
      <li class="user-dropdown__link user-dropdown__link--profile">
        <nuxt-link class="user-dropdown__clickable" :to="`/files/@${$accessor.user.username}`">
          <avatar class="mr-3" :size="40" />

          <div>
            <span class="user-dropdown__username">{{ $accessor.user.displayName }}</span>
            <span class="text-gray-600">My Files</span>
          </div>
        </nuxt-link>
      </li>

      <li class="user-dropdown__divider"></li>

      <li class="user-dropdown__link">
        <nuxt-link class="user-dropdown__clickable" to="/settings/general">
          <edit-icon class="mr-2" fill="#aaa" :size="16" />
          <span>Edit Settings</span>
        </nuxt-link>
      </li>

      <li class="user-dropdown__link">
        <nuxt-link class="user-dropdown__clickable" to="/developers">
          <code-icon class="mr-2" fill="#aaa" :size="16" />
          <span>Developer Panel</span>
        </nuxt-link>
      </li>

      <li class="user-dropdown__divider"></li>

      <li class="user-dropdown__link">
        <button
          class="user-dropdown__clickable user-dropdown__clickable--logout"
          @click="$accessor.logout"
        >
          <logout-icon class="mr-2" fill="#F56565" :size="16" />
          <span>Log Out</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

// @ts-ignore
import ClickOutside from "vue-click-outside";

@Component({
  directives: {
    ClickOutside
  }
})
export default class UserDropdown extends Vue {
  private opened = false;

  close() {
    this.opened = false;
  }

  open() {
    this.opened = true;
  }

  toggle() {
    if (this.opened) this.close();
    else this.open();
  }
}
</script>

<style lang="scss" scoped>
$hover-color: #f1f3f6;

.user-dropdown {
  &__avatar {
    @apply mr-3;

    &--toggler {
      @apply m-0;
    }
  }

  &__clickable {
    @apply border-none;
    @apply cursor-pointer;
    @apply flex flex-row items-center;
    @apply h-full w-full;
    @apply m-0;
    @apply no-underline;
    @apply outline-none;
    @apply px-4 py-0;
    @apply text-black text-sm;

    &:focus,
    &:hover {
      background-color: #f1f3f6;
    }

    &--logout {
      @apply bg-transparent;
      @apply border-none rounded-sm;
      @apply cursor-pointer;
      @apply text-red-600;

      &:focus,
      &:hover {
        @apply bg-red-200;
        @apply outline-none;
      }
    }
  }

  &__divider {
    @apply h-px;

    background-color: #e3e6ec;
  }

  &__icon {
    @apply mr-3;

    width: 16px;
  }

  &__link {
    @apply flex items-center;
    @apply m-0;

    height: 50px;
    width: 192px;

    &--profile {
      @apply box-border;
      @apply flex flex-row;

      height: 72px;
    }
  }

  &__links {
    @apply absolute;
    @apply bg-white;
    @apply flex-col hidden;
    @apply list-none;
    @apply m-0 mt-3;
    @apply overflow-hidden;
    @apply p-0;
    @apply rounded;

    transform: translateX(-45px);

    &--opened {
      @apply flex;
      @apply shadow-lg;
    }
  }

  &__toggler {
    @apply bg-primary-900;
    @apply border-2 border-primary-800 rounded;
    @apply flex flex-row items-center;
    @apply outline-none;
    @apply px-4 py-0;
    @apply text-primary-300;

    background-color: lighten(#282a41, 5%);
    height: 48px;

    &:focus {
      @apply rounded #{!important};
    }

    &:focus,
    &:hover {
      @apply bg-primary-800;
    }
  }

  &__username {
    @apply block;
    @apply font-medium text-base;

    &--toggler {
      @apply mx-2;
    }
  }
}
</style>
