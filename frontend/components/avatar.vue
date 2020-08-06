<template>
  <div class="avatar" :style="{ height: `${size}px`, width: `${size}px` }">
    <img
      alt="Avatar"
      class="avatar__img"
      :src="
        $accessor.user.avatar
          ? `${$axios.defaults.baseURL}/files/download/${$accessor.user.avatar}`
          : `https://avatars.dicebear.com/api/jdenticon/${$accessor.user.uid}.svg`
      "
    />

    <div v-if="editable" class="avatar__editable">
      <form ref="form" class="avatar__form">
        <input
          ref="input"
          accept=".jpg, .jpeg, .png"
          class="avatar__input"
          type="file"
          @change="changeAvatar"
        />
      </form>

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

  @Ref() private readonly form!: HTMLFormElement;
  @Ref() private readonly input!: HTMLInputElement;

  private async changeAvatar() {
    const file = this.input.files && this.input.files.item(0);
    if (!file) return this.$toast.error("Please select an avatar to upload!");

    try {
      const blob = await readFile(file).then((dataURI) =>
        dataURItoBlob(dataURI.result, file.name, file.type)
      );

      const avatar = new FormData();

      avatar.append("avatar", blob, file.name);

      await this.$axios.patch("/settings/change-avatar", avatar);
      await this.$accessor.me(); // Update the user in the store

      this.$toast.success("Avatar successfully changed!");
    } catch (error) {
      this.$toast.error(error.message);
    } finally {
      this.form.reset();
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  @apply bg-primary-800;
  @apply flex items-center justify-center;
  @apply relative;
  @apply rounded-full;
  @apply shadow-lg;
  @apply text-primary-300;

  &__editable {
    background-color: rgba(0, 0, 0, 0.5);

    @apply opacity-0;

    &:hover {
      @apply opacity-100;
    }
  }

  &__editable,
  &__form {
    @apply absolute;
    @apply flex items-center justify-center;
    @apply h-full w-full;
    @apply rounded-full;
    @apply top-0;
  }

  &__img {
    @apply rounded-full;
  }

  &__input {
    @apply cursor-pointer;
    @apply h-full w-full;
    @apply opacity-0;
    @apply rounded-full;
    @apply z-10;
  }
}
</style>
