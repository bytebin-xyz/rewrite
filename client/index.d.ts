import { ReCaptchaInstance } from "@nuxtjs/recaptcha";

import { accessorType } from "./store";

declare module "vue/types/vue" {
  interface Vue {
    $accessor: typeof accessorType;
    $recaptcha: ReCaptchaInstance;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
  }
}
