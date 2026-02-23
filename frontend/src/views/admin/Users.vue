<!-- ═══ views/admin/Users.vue ════════════════════════════════════════════════ -->
<template>
    <div class="">
      <AppSidebar :isOpen="sidebarOpen" />
      <div class="main-content">
        <AppHeader :user="admin" title="Users List" @toggleSidebar="sidebarOpen = !sidebarOpen" />
        <div class="dashboard-content">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">All Users</h3>
              <button class="chart-btn active" @click="showCreate = true">+ Add User</button>
            </div>
            <div class="table-responsive">
              <table class="table activity-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="5" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span>Loading...
                    </td>
                  </tr>
                  <tr v-for="(u, i) in users" :key="u.id">
                    <td>{{ i + 1 }}</td>
                    <td>
                      <div class="customer-info">
                        <div class="customer-avatar">{{ initials(u.name) }}</div>
                        <div class="customer-details"><h6>{{ u.name }}</h6></div>
                      </div>
                    </td>
                    <td class="date-cell">{{ u.email }}</td>
                    <td><span class="status-badge" :class="roleBadge(u.role)">{{ u.role }}</span></td>
                    <td>
                      <button class="chart-btn me-1" @click="confirmDelete(u.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!loading && users.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">No users found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppSidebar from "../../components/AppSidebar.vue";
  import AppHeader  from "../../components/AppHeader.vue";
  import { getUsers, deleteUser, getDashboard } from "../../api/userApi";
  
  export default {
    name: "AdminUsers",
    components: { AppSidebar, AppHeader },
    data() { return { users: [], loading: true, admin: {}, sidebarOpen: false }; },
    async mounted() {
      try {
        const [dashRes, usersRes] = await Promise.all([getDashboard(), getUsers()]);
        this.admin = dashRes.data;
        this.users = usersRes.data;
      } catch { this.$router.push("/"); }
      finally { this.loading = false; }
    },
    methods: {
      initials(name) { return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"; },
      roleBadge(role) { return { admin: "completed", customer: "pending", caption: "cancelled" }[role] || "pending"; },
      async confirmDelete(id) {
        if (!confirm("Delete this user?")) return;
        try { await deleteUser(id); this.users = this.users.filter(u => u.id !== id); }
        catch { alert("Failed to delete user."); }
      },
    },
  };
  </script>
  