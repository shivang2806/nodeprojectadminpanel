<template>
  <div class="d-flex">
    <AdminSidebar />

    <div class="flex-fill">
      <AdminHeader :user="user" />

      <div class="container-fluid p-4">
        <h4 class="mb-4">Welcome, {{ user.name }}</h4>

        <div class="row">
          <StatCard title="Total Users" value="120" color="primary" />
          <StatCard title="Active Users" value="95" color="success" />
          <StatCard title="Admins" value="5" color="warning" />
          <StatCard title="Blocked Users" value="20" color="danger" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar.vue";
import AdminHeader from "../../components/AdminHeader.vue";
import StatCard from "../../components/StatCard.vue";

export default {
  components: {
    AdminSidebar,
    AdminHeader,
    StatCard,
  },
  data() {
    return {
      user: {},
    };
  },
  async mounted() {
    const res = await api.get("/api/user/dashboard");
    this.user = res.data;
  },
};
</script>
