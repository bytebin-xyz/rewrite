<template>
  <div class="explorer" @click="() => unselect()" @keydown.ctrl.83.prevent.stop="selectAll">
    <table v-if="files.length" class="files">
      <thead class="files__header">
        <tr>
          <th class="file__name">Name</th>
          <th class="file__size">Size</th>
          <th class="file__type">Type</th>
          <th class="file__uploaded">Uploaded On</th>
        </tr>
      </thead>

      <tbody
        ref="file-list"
        class="files__body"
        @click.exact.stop="(event) => select(event, true)"
        @click.ctrl.exact.stop="(event) => select(event, false)"
        @dblclick.stop="navigate"
      >
        <tr
          v-for="file of files"
          :key="file.id"
          :class="{ 'file--selected': isSelected(file.id) }"
          :data-file-id="file.id"
          class="file"
        >
          <td class="file__name">
            <folder-icon class="inline-block mr-2" fill="#4F5382" :size="16" />
            <span class="align-text-top">{{ file.name }}</span>
          </td>

          <td class="file__size">{{ prettyBytes(file.size) }}</td>
          <td class="file__type">{{ file.type }}</td>
          <td class="file__uploaded">{{ formatDate(new Date(file.uploadedAt), "PPpp") }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="explorer__placeholder">
      <folder-icon fill="#4F5382" :size="160" />
      <h2>Empty Folder</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { format } from "date-fns";

import { Component, Prop, Ref, Vue } from "nuxt-property-decorator";
import { PropType } from "vue";

import prettyBytes from "pretty-bytes";

import { File } from "@/interfaces/file.interface";

interface Selection {
  element: HTMLElement;
  file: File;
}

@Component
export default class FileExplorer extends Vue {
  @Prop({
    default: () => [],
    type: Array as PropType<File[]>
  })
  private readonly files!: File[];

  @Ref("file-list")
  private readonly fileList!: HTMLTableSectionElement;

  private readonly formatDate = format;
  private readonly prettyBytes = prettyBytes;

  private selected: Selection[] = [];

  private beforeDestroy() {
    document.removeEventListener("keydown", (event) => {
      this.selectAll(event);
    });
  }

  private mounted() {
    document.addEventListener("keydown", (event) => {
      this.selectAll(event);
    });
  }

  private isSelected(id: string) {
    return this.selected.findIndex((s) => s.file.id === id) > -1;
  }

  private navigate(event: MouseEvent): void {
    const selection = this.selectionFromClick(event);
    if (!selection) return;

    this.selected = [];
    this.$emit("navigate", selection.file);
  }

  private select(event: MouseEvent, overwrite = true): void {
    const selection = this.selectionFromClick(event);
    if (!selection) return;

    if (overwrite) {
      this.selected = [selection];
    } else {
      this.isSelected(selection.file.id)
        ? this.unselect(selection.file.id)
        : this.selected.push(selection);
    }
  }

  private selectAll(event: KeyboardEvent): void {
    if (!(event.ctrlKey && event.keyCode === 65)) return;

    event.preventDefault();

    for (let i = 0; i < this.fileList.children.length; i += 1) {
      const children = this.fileList.children.item(i);
      if (!(children instanceof HTMLElement)) continue;

      const file = this.files.find((file) => file.id === children.dataset.fileId);
      if (!file) continue;

      if (!this.isSelected(file.id)) {
        this.selected.push({ element: children, file });
      }
    }
  }

  private selectionFromClick(event: MouseEvent): Selection | null {
    if (!(event.target instanceof HTMLElement)) return null;
    if (!(event.target.parentElement instanceof HTMLElement)) return null;

    const element = event.target.parentElement;
    const file = this.files.find((file) => file.id === element.dataset.fileId);

    if (!file) return null;

    return { element, file };
  }

  private unselect(id?: string): void {
    this.selected = id ? this.selected.filter((selected) => selected.file.id !== id) : [];
  }
}
</script>

<style lang="scss" scoped>
.explorer {
  @apply block;
  @apply bg-primary-900;
  @apply rounded;
  @apply overflow-auto;

  &__placeholder {
    @apply flex flex-col justify-center items-center;
    @apply font-semibold text-2xl text-primary-600;
    @apply h-full;
  }

  &__status-bar {
    @apply px-6 py-2;
    @apply text-left text-primary-400;
  }
}

.file {
  &__name,
  &__size,
  &__type,
  &__uploaded {
    @apply cursor-default;
    @apply whitespace-no-wrap;
  }

  &--selected {
    background-color: darken(#282a41, 3%) !important;
  }

  &:nth-child(even) {
    background-color: lighten(#282a41, 2%);
  }

  &:nth-child(odd) {
    background-color: lighten(#282a41, 5%);
  }

  &:hover {
    background-color: darken(#282a41, 1%);
  }
}

.files {
  @apply w-full;

  &__body,
  &__header {
    @apply text-left text-primary-400;
  }

  &__body {
    & td {
      @apply px-6 py-2;
    }
  }

  &__header {
    & th {
      @apply px-6 py-4;
    }
  }
}
</style>
