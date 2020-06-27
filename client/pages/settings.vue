<template>
  <div id="settings"></div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
  meta: {
    requiresAuth: true
  },
  transition: "fade"
})
export default class Settings extends Vue {}
</script>

<style lang="scss" scoped></style>
