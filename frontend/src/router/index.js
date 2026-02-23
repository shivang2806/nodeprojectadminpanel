// ─── router/index.js ──────────────────────────────────────────────────────────
import { createRouter, createWebHistory } from "vue-router";
import { roleGuard } from "./guards";
import Backup from "../views/admin/Backup.vue";
import PdfGenerator from "../views/admin/PdfGenerator.vue";
import Monitor from "../views/admin/Monitor.vue";

import Login              from "../views/Login.vue";
import AdminDashboard     from "../views/admin/Dashboard.vue";
import AdminUsers         from "../views/admin/Users.vue";
import CaptionDashboard   from "../views/caption/Dashboard.vue";
import CustomerDashboard  from "../views/customer/Dashboard.vue";
import Chat               from "../views/Chat.vue";
import UserExcel          from "../views/admin/UserExcel.vue";

const routes = [
  { path: "/",                    component: Login },

  // Admin
  { path: "/admin/dashboard",     component: AdminDashboard,    beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/users",         component: AdminUsers,        beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/chat",          component: Chat,              beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/monitor",       component: Monitor,           beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/users/excel",   component: UserExcel,         beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/backup",        component: Backup,            beforeEnter: roleGuard(["admin"]) },
  { path: "/admin/pdf",           component: PdfGenerator,      beforeEnter: roleGuard(["admin"]) },

  // Customer
  { path: "/customer/dashboard",  component: CustomerDashboard, beforeEnter: roleGuard(["customer"]) },
  { path: "/customer/chat",       component: Chat,              beforeEnter: roleGuard(["customer"]) },

  // Caption
  { path: "/caption/dashboard",   component: CaptionDashboard, beforeEnter: roleGuard(["caption"]) },
  { path: "/caption/chat",        component: Chat,             beforeEnter: roleGuard(["caption"]) },

  // Catch-all
  { path: "/:pathMatch(.*)*",     redirect: "/" },


];

export default createRouter({ history: createWebHistory(), routes });
