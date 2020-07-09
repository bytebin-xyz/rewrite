import { Context } from "@nuxt/types";

export default ({ app, redirect, route }: Context) => {
  const requiresAuth = route.meta.some((value: any) => value.requiresAuth === true);
  if (!app.$accessor.isAuthenticated && requiresAuth) redirect("/login");
};
