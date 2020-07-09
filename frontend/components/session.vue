<template>
  <div class="session wrapper wrapper--light wrapper--pad-sm">
    <div class="session__details">
      <div class="session__icon">
        <template v-if="session.ua">
          <mobile-icon v-if="session.ua.device.type === 'mobile'" fill="#CED1EF" :size="32" />
          <tablet-icon v-else-if="session.ua.device.type === 'tablet'" fill="#CED1EF" :size="48" />
          <desktop-icon v-else fill="#CED1EF" :size="48" />
        </template>

        <question-icon v-else fill="#CED1EF" :size="32" />
      </div>

      <div class="session__device">
        <template v-if="session.ua">
          <strong v-if="session.ua.os.name">
            {{ session.ua.os.name }} {{ session.ua.os.version || "" }}
          </strong>
          <strong v-else>Unknown Operating System</strong>

          <small v-if="session.ua.browser.name">
            {{ session.ua.browser.name }} {{ session.ua.browser.version || "" }}
          </small>
          <small v-else>Unknown Browser</small>

          <small v-if="session.lastUsed">
            Last accessed on
            {{
              new Date(session.lastUsed).toLocaleDateString() +
              " " +
              new Date(session.lastUsed).toLocaleTimeString()
            }}
          </small>
          <small v-else>Never Used</small>
        </template>

        <strong v-else>Unknown Device</strong>
      </div>
    </div>

    <div class="session__actions">
      <v-button
        v-if="!session.current"
        ref="button"
        class="session__action"
        theme="dark"
        @click="revokeSession(session.identifier)"
      >
        Revoke
      </v-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "nuxt-property-decorator";
import { PropType } from "vue";

import VButton from "@/components/v-button.vue";

import { Session as ISession } from "@/interfaces/session.interface";

@Component
export default class Session extends Vue {
  @Prop({ type: Object as PropType<ISession> }) private readonly session!: ISession;

  @Ref() private readonly button!: VButton;

  async revokeSession(sessionId: string) {
    this.button.pending();

    await this.$axios
      .delete(`/settings/revoke-session/${sessionId}`)
      .then(() => {
        this.button.success();
        this.$emit("revoked", this.session);
      })
      .catch((error: Error) => {
        this.button.fail();
        this.$emit("revoked:error", error, this.session);

        setTimeout(() => this.button.idle(), 5000);
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";

.session {
  @apply flex flex-row flex-wrap items-center justify-between;
  @apply whitespace-no-wrap;

  &__details {
    @apply flex flex-row items-center;
  }

  &__icon {
    @apply flex justify-center;
    @apply mr-5;

    width: 48px;
  }

  &__device {
    @apply flex flex-col;
    @apply text-primary-300;
  }
}
</style>
