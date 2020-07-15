<template>
  <div>
    <settings-change-password />
    <settings-two-step-authentication />
    <settings-sessions :sessions="sessions" @session:revoked="handleSessionRevokes" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import { Context } from "@nuxt/types";

import { Session } from "@/interfaces/session.interface";

@Component({
  transition: "fade"
})
export default class SecuritySettings extends Vue {
  private sessions!: Session[];

  asyncData({ $axios, error }: Context) {
    return $axios
      .get<Session>("/settings/sessions")
      .then((res) => ({ sessions: res.data }))
      .catch(({ message }: Error) => error({ message, statusCode: 500 }));
  }

  private handleSessionRevokes(revoked: Session[]) {
    this.sessions = this.sessions.filter(
      (session) => revoked.findIndex((s) => s.identifier === session.identifier) === -1
    );
  }
}
</script>
