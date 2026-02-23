<!-- ═══ views/caption/Dashboard.vue ═════════════════════════════════════════ -->
<!-- (create as separate file: src/views/caption/Dashboard.vue) -->
<template>
    <div class="">
      <AppSidebar :isOpen="sidebarOpen" />
      <div class="main-content">
        <AppHeader :user="user" title="Caption Panel" @toggleSidebar="sidebarOpen = !sidebarOpen" />
        <div class="dashboard-content">
          <h4 class="mb-1">Welcome, {{ user.name }} 👋</h4>
          <p class="mb-4" style="color:var(--text-secondary)">Role: {{ user.role }}</p>
          <div class="stats-grid">
            <StatCard title="My Assignments" value="8"   icon="bi bi-clipboard-check" color="blue"  change="2"    changeDir="up" />
            <StatCard title="Completed"      value="24"  icon="bi bi-check-circle"    color="green" change="4"    changeDir="up" />
            <StatCard title="Earnings"       value="$1.2K" icon="bi bi-cash-stack"   color="amber" change="10%" changeDir="up" />
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
    name: "CaptionDashboard",
    components: { AppSidebar, AppHeader, StatCard },
    data() { return { user: {}, sidebarOpen: false }; },
    async mounted() {
      try { const res = await getDashboard(); this.user = res.data; }
      catch { this.$router.push("/"); }
    },
  };
  </script>
  