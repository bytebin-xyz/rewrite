<template>
  <div id="profile">
    <div class="user">
      <img
        alt=""
        class="user__avatar"
        :src="`https://avatars.dicebear.com/api/jdenticon/${$accessor.user.uid}.svg`"
      />

      <h1 class="user__display-name">
        {{ $accessor.user.display_name }}
      </h1>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Profile extends Vue {}
</script>

<style lang="scss" scoped>
.user {
  @apply bg-secondary-900;
  @apply flex flex-col items-center;

  &__avatar {
    @apply rounded-full;

    width: 128px;
  }

  &__display-name {
    @apply font-bold text-4xl text-center;
    @apply m-0 mt-8;
  }
}
</style>
