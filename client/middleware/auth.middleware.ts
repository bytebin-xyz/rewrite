import { Context } from "@nuxt/types";

export default ({ app, redirect, route }: Context) => {
  const requiresAuth = route.meta.reduce(
    (value: string, meta: any) => meta.requiresAuth || value,
    false
  );

  if (!app.$accessor.isAuthenticated && requiresAuth) {
    redirect("/login");
  }
};
