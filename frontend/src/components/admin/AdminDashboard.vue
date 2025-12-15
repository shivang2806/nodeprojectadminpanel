<template>
    <div class="d-flex">
      <AdminSidebar />
      <div class="flex-fill">
        <AdminNavbar :user="user" />
  
        <div class="p-4">
          <h3>Admin Dashboard</h3>
          <div class="row mt-3">
            <div class="col-md-4">
              <div class="card bg-primary text-white">
                <div class="card-body">
                  <h5>Total Users</h5>
                  <h2>{{ users }}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </div>
  </template>
  
  <script>
  import api from "../../api/axios";
  import AdminSidebar from "../../components/admin/AdminSidebar.vue";
  import AdminNavbar from "../../components/admin/AdminNavbar.vue";
  
  export default {
    components: { AdminSidebar, AdminNavbar },
    data() {
      return { user: {}, users: 0 };
    },
    async mounted() {
      this.user = (await api.get("/user/dashboard")).data;
      this.users = (await api.get("/user")).data.length;
    },
  };
  </script>
  ./AdminSidebar.vue./AdminNavbar.vue./AdminSidebar.vue./AdminNavbar.vue