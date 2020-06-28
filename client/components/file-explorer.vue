<template>
  <div class="file-explorer">
    <table class="files">
      <thead class="files__header">
        <tr>
          <th class="file__name">
            Name
          </th>

          <th class="file__size">
            Size
          </th>

          <th class="file__type">
            Type
          </th>

          <th class="file__uploaded">
            Uploaded On
          </th>
        </tr>
      </thead>

      <tbody class="files__body">
        <tr v-for="file of files" :key="file.name" class="file">
          <td class="file__name">
            {{ file.name }}
          </td>

          <td class="file__size">
            {{ file.size }}
          </td>

          <td class="file__type">
            {{ file.type }}
          </td>

          <td class="file__uploaded">
            {{ file.uploaded_at }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class FileExplorer extends Vue {
  private readonly files = [
    {
      name: "Hello World",
      size: "0 B",
      type: "Folder",
      uploaded_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
    },
    {
      name: "Hello World",
      size: "160 MB",
      type: "Folder",
      uploaded_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
    },
    {
      name: "Hello World",
      size: "0 B",
      type: "Folder",
      uploaded_at: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
    }
  ];
}
</script>

<style lang="scss" scoped>
.file-explorer {
  @apply bg-primary-900;
  @apply flex flex-col;
  @apply rounded;
  @apply overflow-auto;
}

.file {
  &:nth-child(odd) {
    background-color: lighten(#282a41, 5%);
  }

  &__name {
  }
}

.files {
  &__body,
  &__header {
    text-align: left;
  }

  &__body {
    & td {
      @apply px-6 py-2;
      @apply text-primary-400;
    }
  }

  &__header {
    @apply text-primary-400;

    & th {
      @apply px-6 py-4;
    }
  }
}
</style>
