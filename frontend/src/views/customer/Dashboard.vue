<!-- ═══ views/customer/Dashboard.vue ════════════════════════════════════════ -->
<!-- (create as separate file: src/views/customer/Dashboard.vue) -->
<template>
    <div class="">
      <AppSidebar :isOpen="sidebarOpen" />
      <div class="main-content">
        <AppHeader :user="user" title="Customer Dashboard" @toggleSidebar="sidebarOpen = !sidebarOpen" />
        <div class="dashboard-content">
          <h4 class="mb-1">Welcome, {{ user.name }} 👋</h4>
          <p class="mb-4" style="color:var(--text-secondary)">Role: {{ user.role }}</p>
          <div class="stats-grid">
            <StatCard title="My Orders"   value="12"   icon="bi bi-cart3"        color="blue"  change="3"   changeDir="up" />
            <StatCard title="Completed"   value="9"    icon="bi bi-check-circle" color="green" change="1"   changeDir="up" />
            <StatCard title="Pending"     value="3"    icon="bi bi-hourglass"    color="amber" change="2"   changeDir="down" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppSidebar from "../../components/AppSidebar.vue";
  import AppHeader  from "../../components/AppHeader.vue";
  import StatCard   from "../../components/StatCard.vue";
  import { getDashboard } from "../../api/userApi";
  
  export default {
    name: "CustomerDashboard",
    components: { AppSidebar, AppHeader, StatCard },
    data() { return { user: {}, sidebarOpen: false }; },
    async mounted() {
      try { const res = await getDashboard(); this.user = res.data; }
      catch { this.$router.push("/"); }
    },
  };
  </script>