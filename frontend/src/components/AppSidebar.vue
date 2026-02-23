<template>
    <aside class="sidebar" :class="{ active: isOpen }" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">D</div>
        <span class="sidebar-logo-text">DevTools</span>
      </div>
  
      <ul class="sidebar-menu">
        <li v-for="item in menu" :key="item.to" class="menu-item">
          <router-link :to="item.to" class="menu-link">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
          </router-link>
        </li>
      </ul>
    </aside>
  </template>
  
  <script>
  const MENUS = {
    admin: [
      { to: "/admin/dashboard",     icon: "bi bi-speedometer2",       label: "Dashboard" },
      { to: "/admin/users",         icon: "bi bi-people",             label: "Users",           badge: null },
      { to: "/admin/users/excel",   icon: "bi bi-file-earmark-excel", label: "Import / Export" },
      { to: "/admin/chat",          icon: "bi bi-chat-dots",          label: "Chats",           badge: null },
    ],
    customer: [
      { to: "/customer/dashboard", icon: "bi bi-house",     label: "Dashboard" },
      { to: "/customer/chat",      icon: "bi bi-chat-dots", label: "Chats" },
    ],
    caption: [
      { to: "/caption/dashboard", icon: "bi bi-house",      label: "Dashboard" },
      { to: "/caption/chat",      icon: "bi bi-chat-dots",  label: "Chats" },
    ],
  };
  
  export default {
    name: "AppSidebar",
    props: {
      isOpen: { type: Boolean, default: false },
    },
    computed: {
      role() { return localStorage.getItem("role") || "customer"; },
      menu() { return MENUS[this.role] || []; },
    },
  };
  </script>