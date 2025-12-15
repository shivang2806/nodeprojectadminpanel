<template>
    <div class="d-flex">
      <UserSidebar />
      <div class="flex-fill">
        <UserNavbar />
  
        <div class="p-4">
          <h3>Welcome {{ user.name }}</h3>
          <p class="text-muted">
            Role: {{ user.role }}
          </p>
  
          <div class="alert alert-info">
            This is a user-only dashboard (no admin access)
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from "../../api/axios";
  import UserSidebar from "../../components/user/UserSidebar.vue";
  import UserNavbar from "../../components/user/UserNavbar.vue";
  
  export default {
    components: { UserSidebar, UserNavbar },
    data() {
      return { user: {} };
    },
    async mounted() {
      this.user = (await api.get("/user/dashboard")).data;
    },
  };
  </script>
  ./UserSidebar.vue./UserNavbar.vue./UserSidebar.vue./UserNavbar.vue