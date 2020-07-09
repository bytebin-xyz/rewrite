import { Context } from "@nuxt/types";

export default ({ app, redirect, route }: Context) => {
  const guestOnly = route.meta.some((value: any) => value.guestOnly === true);
  if (app.$accessor.isAuthenticated && guestOnly) redirect("/");
};
