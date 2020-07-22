<template>
  <section id="sessions" class="section wrapper--dark wrapper--pad-sm">
    <header class="section__header">
      <h2 class="section__heading">Sessions</h2>
      <h3 class="section__subheading">
        List of devices that are currently logged into your account.
      </h3>
    </header>

    <section class="section__body">
      <session
        v-for="session of $accessor.sessions.items"
        :key="session.identifier"
        :session="session"
        @revoke="revoke"
      />
    </section>

    <footer class="section__footer">
      <h3 class="section__subheading">Don't recognize any of these sessions?</h3>

      <v-button
        ref="button"
        class="mt-4"
        :theme="
          $accessor.sessions.items.length === 1 && $accessor.sessions.items[0].isCurrent
            ? 'disabled'
            : 'danger'
        "
        @click="revokeAllOtherSessions"
      >
        Revoke All Other Sessions
      </v-button>
    </footer>
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import VButton from "@/components/v-button.vue";

import { Session } from "@/interfaces/session.interface";

@Component
export default class Sessions extends Vue {
  @Ref() private readonly button!: VButton;

  private async fetch() {
    await this.$accessor.sessions.fetchSessions();
  }

  private async revoke(session: Session) {
    await this.$accessor.sessions
      .revokeSession(session)
      .then(() => this.$toast.success(`Successfully revoked ${session.ip}`))
      .catch((error: Error) => this.$toast.error(error.message));
  }

  private async revokeAllOtherSessions() {
    this.button.pending();

    await this.$accessor.sessions
      .revokeAllOtherSessions()
      .then(() => {
        this.button.success();
        this.$toast.success("All sessions have been succesfully revoked!");
      })
      .catch((error: Error) => {
        this.button.fail();
        this.$toast.error(error.message);
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
