<template>
  <div class="session wrapper wrapper--light wrapper--pad-sm">
    <div v-if="session.isCurrent" class="session__current" />

    <div class="session__details">
      <div class="session__icon">
        <mobile-icon v-if="session.ua.device.type === 'mobile'" fill="#CED1EF" :size="32" />
        <tablet-icon v-else-if="session.ua.device.type === 'tablet'" fill="#CED1EF" :size="48" />
        <desktop-icon v-else fill="#CED1EF" :size="48" />
      </div>

      <div class="session__device">
        <strong class="session__geolocation">{{ location }} ({{ ip }})</strong>

        <small class="session__ua">
          <span class="session__os">{{ os }}</span>
          <span class="session__browser"> on {{ browser }}</span>
        </small>

        <small>{{ lastUsed }}</small>
      </div>

      <v-button
        v-if="!session.isCurrent"
        ref="button"
        class="btn--revoke"
        @click="$emit('revoke', session)"
      >
        Revoke
      </v-button>
    </div>
  </div>
</template>

<script lang="ts">
import { formatDistance } from "date-fns";

import { Component, Prop, Vue } from "nuxt-property-decorator";
import { PropType } from "vue";

import { GeolocationData, GeolocationResponse } from "@/interfaces/geolocation.interface";
import { Session as ISession } from "@/interfaces/session.interface";

@Component
export default class Session extends Vue {
  @Prop({ type: Object as PropType<ISession> }) private readonly session!: ISession;

  private geolocation: GeolocationData | null = null;
  private lastUsed = this.formatLastUsed();

  get browser() {
    if (!this.session.ua.browser.name) return "Unknown Browser";
    return `${this.session.ua.browser.name} ${this.session.ua.browser.major || ""}`.trim();
  }

  get ip() {
    return this.session.ip || "Unknown IP Address";
  }

  get location() {
    if (!this.geolocation) return "Unknown Location";

    const { city, country_name, region_name } = this.geolocation;

    if (city) return `${city}, ${region_name || country_name}`;

    return country_name || "Unknown Location";
  }

  get os() {
    if (!this.session.ua.os.name) return "Unknown Operating System";
    return `${this.session.ua.os.name} ${this.session.ua.os.version || ""}`.trim();
  }

  private async mounted() {
    if (!this.session.isCurrent || this.session.lastUsed) {
      setInterval(() => {
        this.lastUsed = this.formatLastUsed();
      }, 1 * 60 * 1000);
    }

    if (this.session.ip) {
      this.geolocation = await this.getGeolocation();
    }
  }

  async getGeolocation() {
    const geolocation = await this.$axios
      .get<GeolocationResponse>(
        `https://cors-anywhere.herokuapp.com/https://tools.keycdn.com/geo.json?host=${this.session.ip}`
      )
      .then((res) => res.data);

    if (geolocation.status === "error") throw new Error(geolocation.description);

    return geolocation.data.geo;
  }

  private formatLastUsed() {
    if (this.session.isCurrent) return "Current Session";
    if (!this.session.lastUsed) return "Never Used";

    return `Last Used: ${formatDistance(new Date(this.session.lastUsed), new Date(), {
      addSuffix: true,
      includeSeconds: true
    })}`;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/button.scss";
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";

.btn--revoke {
  @apply ml-auto;

  @screen sm_max {
    @apply mt-4;
  }
}

.session {
  @apply flex flex-row items-center justify-between;
  @apply relative;

  &__current {
    @apply absolute;
    @apply bg-green-500;
    @apply h-full;
    @apply left-0;
    @apply rounded rounded-br-none rounded-tr-none;

    width: 5px;
  }

  &__details {
    @apply flex flex-row items-center;
    @apply w-full;

    @screen sm_max {
      @apply flex-col;
    }
  }

  &__device {
    @apply flex flex-col;
    @apply mr-4;
    @apply text-primary-300;
    @apply w-full;

    @screen sm_max {
      @apply mr-0;
    }
  }

  &__geolocation {
    @apply break-words;

    @screen sm_max {
      @apply mb-1;
    }
  }

  &__icon {
    @apply flex justify-center;
    @apply mr-5;

    width: 48px;

    @screen sm_max {
      @apply hidden;
    }
  }
}
</style>
