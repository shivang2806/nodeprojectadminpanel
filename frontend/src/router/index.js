import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import UserDashboard from "../views/user/UserDashboard.vue";
import Users from "../views/admin/Users.vue";
import CaptionDashboard from "../views/caption/CaptionDashboard.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/admin/dashboard", component: AdminDashboard },
  { path: "/admin/users", component: Users },
  { path: "/customer/dashboard", component: UserDashboard },
  { path: "/caption/dashboard", component: CaptionDashboard }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
