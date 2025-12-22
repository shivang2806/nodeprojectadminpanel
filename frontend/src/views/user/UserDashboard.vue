<template>
  <div class="d-flex">
    <CustomerSidebar />

    <div class="flex-fill">
      <CustomerHeader :user="user" />

      <div class="container-fluid p-4">
        <h4 class="mb-2">Welcome, {{ user.name }} 👋</h4>
        <p class="text-muted">Role: {{ user.role }}</p>

        <div class="row mt-4">
          <div class="col-md-4">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <h6>My Profile</h6>
                <p class="mb-0">View your details</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card bg-success text-white">
              <div class="card-body">
                <h6>Orders</h6>
                <p class="mb-0">Your order history</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card bg-warning text-dark">
              <div class="card-body">
                <h6>Support</h6>
                <p class="mb-0">Get help & support</p>
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
import CustomerSidebar from "../../components/CustomerSidebar.vue";
import CustomerHeader from "../../components/CustomerHeader.vue";

export default {
  components: {
    CustomerSidebar,
    CustomerHeader,
  },
  data() {
    return {
      user: {},
    };
  },
  async mounted() {
    try {
      const res = await api.get("/api/user/dashboard");
      this.user = res.data;
    } catch (err) {
      console.error(err);
      this.$router.push("/");
    }
  },
};
</script>
