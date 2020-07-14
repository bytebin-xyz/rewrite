import Vue from "vue";

// @ts-ignore
import VModal from "vue-js-modal/dist/ssr.nocss";

import "vue-js-modal/dist/styles.css";

Vue.use(VModal, {
  dynamicDefaults: {
    adaptive: true,
    classes: "modal-container-styles",
    focusTrap: true,
    height: "auto",
    reset: true,
    scrollable: true
  }
});
