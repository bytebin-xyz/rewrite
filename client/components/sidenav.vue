<template>
  <nav class="sidenav">
    <ul class="sidenav__links">
      <li v-for="link of links" :key="link.name" class="sidenav__link">
        <nuxt-link :to="link.to">
          {{ link.name }}
        </nuxt-link>

        <ul v-if="link.children.length" class="sidenav__sections">
          <li v-for="children of link.children" :key="children">
            <nuxt-link :to="`${link.to}#${children.toLowerCase()}`">
              {{ children }}
            </nuxt-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

type Links = { children: string[]; name: string; to: string };

@Component
export default class Sidenav extends Vue {
  @Prop() private readonly links: Links[] = [];
}
</script>

<style lang="scss" scoped></style>
