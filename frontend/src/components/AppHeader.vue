<template>
    <header class="app-header">
      <div class="header-content">
        <div class="header-left" style="display:flex;align-items:center;gap:1rem;">
          <div class="mobile-menu-toggle" @click="$emit('toggleSidebar')">
            <i class="bi bi-list"></i>
          </div>
          <h1>{{ title }}</h1>
        </div>
  
        <div class="header-right">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" :placeholder="searchPlaceholder" v-model="searchQuery" />
          </div>
  
          <div class="header-icon-btn">
            <i class="bi bi-bell"></i>
            <span class="notification-badge">3</span>
          </div>
  
          <div class="header-icon-btn">
            <i class="bi bi-envelope"></i>
          </div>
  
          <div class="user-profile" @click="toggleDropdown" style="position:relative;">
            <div class="user-avatar">{{ initials }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.name || '...' }}</div>
              <div class="user-role">{{ user.role || '' }}</div>
            </div>
  
            <!-- Dropdown -->
            <div v-if="dropdownOpen"
              style="position:absolute;top:110%;right:0;background:#fff;border:1px solid var(--border-color);
                     border-radius:10px;box-shadow:var(--shadow-lg);min-width:160px;z-index:999;">
              <button @click="logout"
                style="width:100%;padding:0.75rem 1rem;border:none;background:none;
                       color:var(--danger-color);font-weight:600;cursor:pointer;text-align:left;
                       font-family:'Outfit',sans-serif;">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: "AppHeader",
    props: {
      user: { type: Object, default: () => ({}) },
      title: { type: String, default: "Dashboard" },
      searchPlaceholder: { type: String, default: "Search..." },
    },
    emits: ["toggleSidebar"],
    data() {
      return { searchQuery: "", dropdownOpen: false };
    },
    computed: {
      initials() {
        if (!this.user.name) return "?";
        return this.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      },
    },
    methods: {
      toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; },
      logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        this.$router.push("/");
      },
    },
  };
  </script>