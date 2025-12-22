<template>
    <div class="d-flex">
      <CaptionSidebar />
  
      <div class="flex-fill">
        <CaptionHeader :user="user" />
  
        <div class="container-fluid p-4">
          <h4 class="mb-2">Welcome, {{ user.name }} 👋</h4>
          <p class="text-muted">Role: {{ user.role }}</p>
  
          <div class="row mt-4">
            <div class="col-md-4">
              <div class="card bg-primary text-white">
                <div class="card-body">
                  <h6>My Assignments</h6>
                  <p class="mb-0">View assigned tasks</p>
                </div>
              </div>
            </div>
  
            <div class="col-md-4">
              <div class="card bg-success text-white">
                <div class="card-body">
                  <h6>Completed Work</h6>
                  <p class="mb-0">Track completed jobs</p>
                </div>
              </div>
            </div>
  
            <div class="col-md-4">
              <div class="card bg-warning text-dark">
                <div class="card-body">
                  <h6>Earnings</h6>
                  <p class="mb-0">View payment summary</p>
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
  import CaptionSidebar from "../../components/CaptionSidebar.vue";
  import CaptionHeader from "../../components/CaptionHeader.vue";
  
  export default {
    components: {
      CaptionSidebar,
      CaptionHeader,
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
  
        // extra safety
        if (this.user.role !== "caption") {
          this.$router.push("/");
        }
      } catch (err) {
        this.$router.push("/");
      }
    },
  };
  </script>
  