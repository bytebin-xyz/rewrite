<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import { Context } from "@nuxt/types";

import { IsOkResponse } from "@/interfaces/is-ok.interface";

@Component({
  meta: {
    requiresAuth: false
  },
  transition: "fade"
})
export default class ConfirmEmail extends Vue {
  asyncData({ $axios, error, params, redirect }: Context) {
    return $axios
      .get<IsOkResponse>(`/settings/confirm-email/${params.token}`)
      .then(({ data }) => (data.ok ? redirect("/settings/general") : error({ statusCode: 404 })))
      .catch(({ message }: Error) => error({ message }));
  }
}
</script>
