<template>
    <div class="d-flex">
      <Sidebar />
      <div class="flex-fill">
        <Navbar :user="user" />
        <div class="p-4">
          <h4>Welcome {{ user.name }}</h4>
          <p>Role: {{ user.role }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from "../api/axios";
  import Sidebar from "../components/Sidebar.vue";
  import Navbar from "../components/Navbar.vue";
  
  export default {
    components: { Sidebar, Navbar },
    data() {
      return { user: {} };
    },
    async mounted() {
      const res = await api.get("/user/dashboard");
      this.user = res.data;
    },
  };
  </script>
  