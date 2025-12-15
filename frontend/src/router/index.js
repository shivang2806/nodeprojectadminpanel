import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import UserDashboard from "../views/user/UserDashboard.vue";
import Users from "../views/admin/Users.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/admin/dashboard", component: AdminDashboard },
  { path: "/admin/users", component: Users },
  { path: "/user/dashboard", component: UserDashboard },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
