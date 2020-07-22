import { actionTree, mutationTree } from "nuxt-typed-vuex";
import { getAccessorType } from "typed-vuex";

import { Session } from "@/interfaces/session.interface";

export const state = (): {
  items: Session[];
} => ({
  items: []
});

export const mutations = mutationTree(state, {
  addSession(state, session: Session) {
    const index = state.items.findIndex((item) => item.identifier === session.identifier);

    if (index === -1) {
      state.items.push(session);
      state.items.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
    }
  },

  removeSession(state, session: Session) {
    const index = state.items.findIndex((item) => item.identifier === session.identifier);
    if (index > -1) state.items.splice(index, 1);
  },

  removeAllOtherSessions(state) {
    const current = state.items.find((session) => session.isCurrent);

    state.items = current ? [current] : [];
  }
});

export const actions = actionTree(
  { state, mutations },
  {
    async fetchSessions({ commit }) {
      const sessions = await this.$axios
        .get<Session[]>("/settings/sessions")
        .then((response) => response.data);

      sessions.forEach((session) => commit("addSession", session));

      return sessions;
    },

    async revokeSession({ commit }, session: Session) {
      await this.$axios
        .delete(`/settings/revoke-session/${session.identifier}`)
        .then(() => commit("removeSession", session));
    },

    async revokeAllOtherSessions({ commit }) {
      await this.$axios
        .delete("/settings/revoke-all-sessions")
        .then(() => commit("removeAllOtherSessions"));
    }
  }
);

export const accessorType = getAccessorType({
  actions,
  state,
  mutations
});
