<template>
  <div class="explorer-toolbar btn__group btn__group--row">
    <v-button class="explorer-toolbar__button" theme="light">
      <chevron-icon direction="left" fill="#A9AEE4" :size="16" />
    </v-button>

    <v-button class="explorer-toolbar__button" theme="light">
      <chevron-icon direction="right" fill="#A9AEE4" :size="16" />
    </v-button>

    <v-button class="explorer-toolbar__button" theme="light">
      <refresh-icon fill="#A9AEE4" :size="20" />
    </v-button>

    <template v-if="showSelectionActions">
      <v-button class="explorer-toolbar__button" theme="light">
        <cut-icon fill="#A9AEE4" :size="20" />
      </v-button>

      <v-button class="explorer-toolbar__button" theme="light">
        <copy-icon fill="#A9AEE4" :size="20" />
      </v-button>

      <v-button class="explorer-toolbar__button" theme="light">
        <paste-icon fill="#A9AEE4" :size="20" />
      </v-button>

      <v-button class="explorer-toolbar__button" theme="light">
        <delete-icon fill="#A9AEE4" :size="20" />
      </v-button>
    </template>

    <v-button class="explorer-toolbar__button" theme="light">
      <new-folder-icon direction="right" fill="#A9AEE4" :size="24" />
    </v-button>

    <v-button class="explorer-toolbar__button" theme="light">
      <cloud-upload-icon fill="#A9AEE4" :size="24" />
    </v-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component
export default class FileExplorerToolbar extends Vue {
  @Prop({ default: true }) private readonly showSelectionActions!: boolean;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";

.explorer-toolbar {
  @apply bg-primary-900;
  @apply justify-start;
  @apply max-w-full;
  @apply overflow-hidden;
  @apply overflow-x-auto;
  @apply p-4;

  &__button {
    @apply h-full;
  }
}
</style>
