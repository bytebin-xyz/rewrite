import { actionTree, getterTree, mutationTree } from "nuxt-typed-vuex";
import { getAccessorType } from "typed-vuex";

import { LoginDto } from "~/server/modules/auth/dto/login.dto";
import { RegisterDto } from "~/server/modules/auth/dto/register.dto";

import { User } from "~/server/modules/users/interfaces/user.interface";

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
      await this.app.$accessor.me().catch(() => {});
    },

    login({ commit }, payload: LoginDto) {
      return this.$axios
        .post<User>("/auth/login", payload)
        .then(({ data }) => commit("setUser", data));
    },

    logout({ commit }) {
      return this.$axios.post("/auth/logout").then(() => commit("setUser", null));
    },

    me({ commit }) {
      // prettier-ignore
      return this.$axios
        .get<User>("/users/@me")
        .then(({ data }) => commit("setUser", data));
    },

    register({ commit }, payload: RegisterDto) {
      return this.$axios
        .post<User>("/auth/register", payload)
        .then(({ data }) => commit("setUser", data));
    }
  }
);

export const accessorType = getAccessorType({
  // https://github.com/danielroe/nuxt-typed-vuex/issues/66
  actions,
  state,
  getters,
  mutations
});
