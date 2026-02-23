// ─── main.js ─────────────────────────────────────────────────────────────────
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "bootstrap-icons/font/bootstrap-icons.css";

// Global styles
import "./assets/styles/main.css";
import "./assets/styles/sidebar.css";
import "./assets/styles/header.css";
import "./assets/styles/dashboard.css";
import "./assets/styles/login.css";

createApp(App).use(router).mount("#app");
