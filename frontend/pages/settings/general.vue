<template>
  <div>
    <settings-profile />
    <settings-danger-zone />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  transition: "fade"
})
export default class GeneralSettings extends Vue {}
</script>
