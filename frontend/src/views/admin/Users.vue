<template>
  <div class="d-flex">
    <AdminSidebar />

    <div class="flex-fill">
      <AdminHeader :user="admin" />

      <div class="container-fluid p-4">
        <h4 class="mb-4">Users List</h4>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table table-hover">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading">
                  <td colspan="5" class="text-center">Loading...</td>
                </tr>

                <tr v-for="(user, index) in users" :key="user.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge bg-info">{{ user.role }}</span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="user.active ? 'bg-success' : 'bg-danger'"
                    >
                      {{ user.active ? "Active" : "Inactive" }}
                    </span>
                  </td>
                </tr>

                <tr v-if="!loading && users.length === 0">
                  <td colspan="5" class="text-center text-muted">
                    No users found
                  </td>
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
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar.vue";
import AdminHeader from "../../components/AdminHeader.vue";

export default {
  components: {
    AdminSidebar,
    AdminHeader,
  },
  data() {
    return {
      users: [],
      loading: true,
      admin: {},
    };
  },
  async mounted() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await api.get("/api/user"); // ✅ correct
        this.users = res.data;
      } catch (err) {
        console.error(err.response?.data);
        alert(err.response?.data?.message || "Error");
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>
