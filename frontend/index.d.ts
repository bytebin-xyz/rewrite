import { ReCaptchaInstance } from "@nuxtjs/recaptcha";
import { Toasted } from "vue-toasted";

import { accessorType } from "./store";

declare module "vue/types/vue" {
  interface Vue {
    $accessor: typeof accessorType;
    $recaptcha: ReCaptchaInstance;
    $toast: Toasted;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
  }
}
