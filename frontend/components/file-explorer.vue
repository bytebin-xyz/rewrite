<template>
  <div class="explorer" @click="unselect()">
    <table v-if="items.length" class="filesystem">
      <thead class="filesystem__header">
        <tr>
          <th class="item__name">Name</th>
          <th class="item__size">Size</th>
          <th class="item__type">Type</th>
          <th class="item__uploaded">Uploaded On</th>
        </tr>
      </thead>

      <tbody
        ref="fileSystemItems"
        class="filesystem__body"
        @click.exact.stop="(event) => select(event, true)"
        @click.ctrl.exact.stop="(event) => select(event, false)"
        @dblclick.stop="open"
      >
        <tr
          v-for="item of items"
          :key="item.id"
          :class="{ 'item--selected': isSelected(item.id) }"
          :data-item-id="item.id"
          class="item"
        >
          <td class="item__name">
            <span class="align-middle inline-block mr-2">
              <folder-icon v-if="item.isFolder" fill="#4F5382" :size="16" />
              <file-icon v-else fill="#4F5382" :size="16" />
            </span>

            <span class="align-text-top">{{ item.name }}</span>
          </td>

          <td class="item__size">{{ prettyBytes(item.size) }}</td>

          <td class="item__type">
            {{ item.isFolder ? "Folder" : `${item.name.split(".").pop().toUpperCase()} File` }}
          </td>

          <td class="item__uploaded">{{ formatDate(new Date(item.createdAt), "PPpp") }}</td>
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

import { FileSystemObject } from "@/interfaces/fs-object.interface";

interface Selection {
  element: HTMLElement;
  item: FileSystemObject;
}

@Component
export default class FileExplorer extends Vue {
  @Prop({
    default: () => [],
    type: Array as PropType<FileSystemObject[]>
  })
  private readonly items!: FileSystemObject[];

  @Ref()
  private readonly fileSystemItems!: HTMLTableSectionElement;

  private readonly formatDate = format;
  private readonly prettyBytes = prettyBytes;

  selected: Selection[] = [];

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

  private isSelected(id: string): boolean {
    return this.selected.findIndex((selection) => selection.item.id === id) > -1;
  }

  private open(event: MouseEvent): void {
    const selection = this.selectionFromClick(event);
    if (!selection) return;

    this.selected = [];
    this.$emit("open", selection.item);
  }

  private select(event: MouseEvent, overwrite = true): void {
    const selection = this.selectionFromClick(event);
    if (!selection) return;

    if (overwrite) {
      this.selected = [selection];
    } else {
      this.isSelected(selection.item.id)
        ? this.unselect(selection.item.id)
        : this.selected.push(selection);
    }

    this.$emit("selection:update", this.selected);
  }

  private selectAll(event: KeyboardEvent): void {
    if (!(event.ctrlKey && event.keyCode === 65)) return;

    event.preventDefault();

    for (let i = 0; i < this.fileSystemItems.children.length; i += 1) {
      const children = this.fileSystemItems.children.item(i);
      if (!(children instanceof HTMLElement)) continue;

      const item = this.items.find((item) => item.id === children.dataset.itemId);
      if (!item || this.isSelected(item.id)) continue;

      this.selected.push({ element: children, item });
      this.$emit("selection:update", this.selected);
    }
  }

  private selectionFromClick(event: MouseEvent): Selection | null {
    if (!(event.target instanceof HTMLElement)) return null;
    if (!(event.target.parentElement instanceof HTMLElement)) return null;

    const element = event.target.parentElement;
    const item = this.items.find((item) => item.id === element.dataset.itemId);

    if (!item) return null;

    return { element, item };
  }

  private unselect(id?: string): void {
    this.selected = id ? this.selected.filter((selected) => selected.item.id !== id) : [];
    this.$emit("selection:update", this.selected);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";

.explorer {
  @apply block;
  @apply bg-primary-900;
  @apply overflow-auto;

  &__placeholder {
    @apply flex flex-col justify-center items-center;
    @apply font-semibold text-2xl text-primary-600;
    @apply h-full;

    letter-spacing: 0.5px;
  }
}

.item {
  &__name,
  &__size,
  &__type,
  &__uploaded {
    @apply cursor-default;
    @apply select-none;
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

.filesystem {
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
      @apply bg-primary-900;
      @apply sticky;
      @apply px-6 py-4;
      @apply top-0;
    }
  }
}
</style>
