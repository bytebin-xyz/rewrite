import { actionTree, getterTree, mutationTree } from "nuxt-typed-vuex";
import { getAccessorType } from "typed-vuex";

import * as sessions from "./sessions";

import { LoginDto } from "@/dto/auth/login.dto";
import { RegisterDto } from "@/dto/auth/register.dto";

import { User } from "@/interfaces/user.interface";

export const state = (): {
  user: User | null;
} => ({
  user: null
});

export const getters = getterTree(state, {
  isAuthenticated(state) {
    return !!state.user;
  }
});

export const mutations = mutationTree(state, {
  setUser(state, user: User | null) {
    state.user = user;
  }
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async nuxtServerInit() {
      await this.app.$accessor
        .me()
        .then(() => this.app.$accessor.sessions.fetchSessions())
        .catch(() => {});
    },

    async login({ commit }, payload: LoginDto) {
      const user = await this.$axios
        .post<User>("/auth/login", payload)
        .then((response) => response.data);

      commit("setUser", user);

      return user;
    },

    async logout({ commit }) {
      await this.$router.push("/");
      await this.$axios.delete("/auth/logout");

      commit("setUser", null);
    },

    async me({ commit }) {
      const user = await this.$axios.get<User>("/users/@me").then((response) => response.data);

      commit("setUser", user);

      return user;
    },

    async register(_ctx, payload: RegisterDto) {
      await this.$axios.post("/auth/register", payload);
    }
  }
);

export const accessorType = getAccessorType({
  // https://github.com/danielroe/nuxt-typed-vuex/issues/66
  actions,
  state,
  getters,
  modules: {
    sessions
  },
  mutations
});
