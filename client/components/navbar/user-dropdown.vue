<template>
  <div v-click-outside="close" class="user-dropdown">
    <button class="user-dropdown__toggler" @click="toggle">
      <img
        :alt="$accessor.user.display_name"
        :src="`https://avatars.dicebear.com/api/jdenticon/${$accessor.user.uid}.svg`"
        class="user-dropdown__avatar user-dropdown__avatar--toggler"
      />

      <span class="user-dropdown__username user-dropdown__username--toggler">
        {{ $accessor.user.display_name }}
      </span>

      <img
        alt=""
        class="user-dropdown__icon user-dropdown__icon--toggler"
        src="@/assets/svg/chevron-down.svg"
      />
    </button>

    <ul
      ref="dropdown"
      class="user-dropdown__links"
      :class="{ 'user-dropdown__links--opened': opened }"
      @click="close"
    >
      <li class="user-dropdown__link user-dropdown__link--profile">
        <nuxt-link class="user-dropdown__clickable" to="/profile">
          <img
            class="user-dropdown__avatar"
            :src="`https://avatars.dicebear.com/api/jdenticon/${$accessor.user.uid}.svg`"
          />

          <div>
            <span class="user-dropdown__username">{{ $accessor.user.display_name }}</span>
            <span class="text-gray-600">View Profile</span>
          </div>
        </nuxt-link>
      </li>

      <li class="user-dropdown__link">
        <nuxt-link class="user-dropdown__clickable" to="/settings">
          <img class="user-dropdown__icon" src="@/assets/svg/edit.svg" alt="" />
          <span>Edit Settings</span>
        </nuxt-link>
      </li>

      <li class="user-dropdown__link">
        <nuxt-link class="user-dropdown__clickable" to="/developers">
          <img class="user-dropdown__icon" src="@/assets/svg/code.svg" alt="" />
          <span>Developer Panel</span>
        </nuxt-link>
      </li>

      <li class="user-dropdown__divider"></li>

      <li class="user-dropdown__link">
        <button
          class="user-dropdown__clickable user-dropdown__clickable--logout"
          @click="$accessor.logout().finally(() => $router.push('/'))"
        >
          <img class="user-dropdown__icon" src="@/assets/svg/logout.svg" alt="X" />
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
    @apply rounded-full;
    @apply mr-3;

    width: 40px;

    &--toggler {
      @apply m-0;

      width: 32px;
    }
  }

  &__clickable {
    @apply cursor-pointer;
    @apply flex flex-row items-center;
    @apply h-full w-full;
    @apply m-0;
    @apply no-underline;
    @apply px-4 py-0;
    @apply text-black text-sm;

    &:focus {
      @apply outline-none;
    }

    &:focus,
    &:hover {
      background-color: #f1f3f6;
    }

    &--logout {
      @apply bg-transparent;
      @apply border-none rounded-sm;
      @apply cursor-pointer;

      &:focus {
        @apply outline-none;
      }

      &:hover {
        @apply bg-red-200;
        @apply text-red-600;
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

    &--toggler {
      @apply m-0;

      width: 10px;
    }
  }

  &__link {
    @apply flex items-center;
    @apply m-0;

    height: 50px;
    width: 192px;

    &--profile {
      @apply box-border;
      @apply flex flex-row;

      border-bottom: 1px solid #f1f3f6;
      height: 72px;
    }
  }

  &__links {
    @apply absolute;
    @apply bg-white;
    @apply flex-col hidden;
    @apply list-none;
    @apply m-0 mt-4;
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
    @apply bg-secondary-900;
    @apply border-2 border-secondary-800 rounded-sm;
    @apply flex flex-row items-center;
    @apply px-4 py-0;
    @apply text-secondary-300;

    background-color: lighten(#282a41, 5%);
    height: 52px;

    &:focus,
    &:hover {
      @apply bg-secondary-800;
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
