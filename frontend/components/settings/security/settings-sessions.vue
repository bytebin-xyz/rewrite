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
        v-for="session of sessions"
        :key="session.identifier"
        :session="session"
        @revoked:error="(error) => $toast.error(error.message)"
        @revoked.once="revoked"
      />
    </section>

    <footer class="section__footer">
      <h3 class="section__subheading">Don't recognize any of these sessions?</h3>

      <v-button ref="button" class="mt-4" theme="danger" @click="revokeAllSessions">
        Revoke All Sessions
      </v-button>
    </footer>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "nuxt-property-decorator";
import { PropType } from "vue";

import VButton from "@/components/v-button.vue";

import { Session } from "@/interfaces/session.interface";

@Component
export default class Sessions extends Vue {
  @Prop({
    default: () => [],
    type: Array as PropType<Session[]>
  })
  private readonly sessions!: Session[];

  @Ref() private readonly button!: VButton;

  private revoked(session: Session) {
    setTimeout(() => {
      this.$emit("session:revoked", [session]);
    }, 5000);
  }

  private async revokeAllSessions() {
    this.button.pending();

    await this.$axios
      .delete("/settings/revoke-all-sessions")
      .then(() => {
        this.button.success();
        this.$toast.success("All sessions have been succesfully revoked!");

        this.$emit(
          "session:revoked",
          this.sessions.filter((session) => !session.current)
        );
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
