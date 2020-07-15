<template>
  <section id="danger-zone" class="section wrapper wrapper--dark wrapper--pad-sm">
    <header class="section__header">
      <h2 class="section__heading">Danger Zone</h2>
      <h3 class="section__subheading">Destructive and irreversible actions</h3>
    </header>

    <section class="section__body">
      <section class="section wrapper wrapper--light wrapper--pad-sm">
        <header class="section__header">
          <h2 class="section__subheading">Delete your account.</h2>
          <h3 class="section__text">
            Once your account is deleted, all your files and related user data will permanently
            become inaccessible.
          </h3>
        </header>

        <section class="mt-4">
          <v-button ref="button" theme="danger" @click="showPasswordConfirmation">
            Delete Account
          </v-button>
        </section>
      </section>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "nuxt-property-decorator";

import PasswordConfirmationModal from "@/components/modals/password-confirmation-modal.vue";
import VButton from "@/components/v-button.vue";

@Component
export default class DangerZoneSettings extends Vue {
  @Ref() private readonly button!: VButton;

  private deleteAccount(password: string) {
    this.button.pending();

    this.$axios
      .post("/settings/delete-account", { password })
      .then(() => this.button.success())
      .then(() => window.location.replace("/"))
      .catch((error) => {
        this.button.idle();
        this.$toast.error(error.message);
      });
  }

  private showPasswordConfirmation() {
    this.$modal.show(PasswordConfirmationModal, {
      action: "Delete Account",
      callback: (password: string) => this.deleteAccount(password),
      description: "Please enter your password in order to confirm your account deletion.",
      title: "Account Deletion"
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/section.scss";
@import "@/assets/scss/wrapper.scss";
</style>
