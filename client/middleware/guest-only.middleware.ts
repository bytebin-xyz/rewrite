import { Context } from "@nuxt/types";

export default ({ app, redirect, route }: Context) => {
  const guestOnly = route.meta.reduce(
    (value: string, meta: any) => meta.guestOnly || value,
    false
  );

  if (app.$accessor.isAuthenticated && guestOnly) {
    redirect("/");
  }
};
