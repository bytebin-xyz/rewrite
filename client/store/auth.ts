import { actionTree, getterTree, mutationTree } from "nuxt-typed-vuex";

import { LoginDto } from "~/server/modules/auth/dto/login.dto";
import { RegisterDto } from "~/server/modules/auth/dto/register.dto";

import { User } from "~/server/modules/users/interfaces/user.interface";

import "@nuxtjs/axios";

export enum AuthStatus {
  IDLE,
  LOGGING_IN,
  LOGGING_OUT,
  REGISTERING
}

export const state = (): {
  status: AuthStatus;
  user: User | null;
} => ({
  status: AuthStatus.IDLE,
  user: null
});

export const getters = getterTree(state, {
  isAuthenticated(state) {
    return !!state.user;
  }
});

export const mutations = mutationTree(state, {
  setStatus(state, status: AuthStatus) {
    state.status = status;
  },

  setUser(state, user: User | null) {
    state.user = user;
  }
});

export const actions = actionTree(
  { mutations, state },
  {
    login({ commit }, payload: LoginDto) {
      commit("setStatus", AuthStatus.LOGGING_IN);

      return this.$axios
        .post<User>("/auth/login", payload)
        .then(({ data }) => commit("setUser", data))
        .finally(() => commit("setStatus", AuthStatus.IDLE));
    },

    logout({ commit }) {
      commit("setStatus", AuthStatus.LOGGING_OUT);

      return this.$axios
        .post("/auth/logout")
        .then(() => commit("setUser", null))
        .finally(() => commit("setStatus", AuthStatus.IDLE));
    },

    me({ commit }) {
      // prettier-ignore
      return this.$axios
        .get<User>("/users/@me")
        .then(({ data }) => commit("setUser", data));
    },

    register({ commit }, payload: RegisterDto) {
      commit("setStatus", AuthStatus.REGISTERING);

      return this.$axios
        .post<User>("/auth/register", payload)
        .then(({ data }) => commit("setUser", data))
        .finally(() => commit("setStatus", AuthStatus.IDLE));
    }
  }
);
