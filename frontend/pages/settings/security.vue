<template>
  <div>
    <settings-change-password />
    <settings-two-step-authentication />
    <settings-sessions />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  transition: "fade"
})
export default class SecuritySettings extends Vue {}
</script>
