<template>
  <div class="avatar" :style="{ width: `${size}px` }">
    <img
      alt="Avatar"
      class="avatar__img"
      :src="
        $accessor.user.avatar
          ? `${$axios.defaults.baseURL}/avatars/${$accessor.user.avatar}`
          : `https://avatars.dicebear.com/api/jdenticon/${$accessor.user.uid}.svg`
      "
    />

    <div v-if="editable" class="avatar__editable">
      <input
        ref="input"
        accept=".jpg, .jpeg, .png"
        class="avatar__input"
        type="file"
        @change="changeAvatar"
      />

      <pen-icon class="avatar__editable-icon" fill="#fff" :size="size / 3" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "nuxt-property-decorator";

import { dataURItoBlob } from "@/utils/dataURItoBlob";
import { readFile } from "@/utils/readFile";

@Component
export default class Avatar extends Vue {
  @Prop({ default: false }) private readonly editable!: boolean;
  @Prop({ default: 96 }) private readonly size!: number;

  @Ref() private readonly input!: HTMLInputElement;

  async changeAvatar() {
    const file = this.input.files ? this.input.files.item(0) : null;
    if (!file) return;

    try {
      const avatar = await readFile(file)
        .then((dataURI) => dataURItoBlob(dataURI.result, file.name, file.type))
        .then((blob) => {
          const data = new FormData();
          data.append("avatar", blob, file.name);
          return data;
        });

      await this.$axios.patch("/settings/change-avatar", avatar, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      await this.$accessor.me(); // Update the user in the store
    } catch (error) {
      this.$toast.error(error.message);
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  @apply relative;

  &__editable {
    background-color: rgba(0, 0, 0, 0.5);

    @apply opacity-0;

    &:hover {
      @apply opacity-100;
    }
  }

  &__editable,
  &__input {
    @apply absolute;
    @apply cursor-pointer;
    @apply flex items-center justify-center;
    @apply h-full w-full;
    @apply rounded-full;
    @apply top-0;
  }

  &__img {
    @apply rounded-full;
  }

  &__input {
    @apply opacity-0;
    @apply z-10;

    &:focus {
      & + .avatar__editable-icon {
        @apply block;
      }
    }
  }
}
</style>
