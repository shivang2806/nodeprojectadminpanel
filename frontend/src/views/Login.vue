<template>
    <div class="container mt-5" style="max-width: 400px">
      <h3 class="text-center mb-3">Admin Login</h3>
  
      <input v-model="email" class="form-control mb-2" placeholder="Email" />
      <input v-model="password" type="password" class="form-control mb-3" placeholder="Password" />
  
      <button class="btn btn-primary w-100" @click="login">Login</button>
    </div>
  </template>
  
  <script>
  import api from "../api/axios";
  
  export default {
    data() {
      return {
        email: "",
        password: "",
      };
    },
    methods: {
        async login() {
            const res = await api.post("/api/auth/login", {
                email: this.email,
                password: this.password,
            });

            localStorage.setItem("token", res.data.token);

            // get user info
            const user = (await api.get("/api/user/dashboard")).data;
            localStorage.setItem("role", user.role);

            if (user.role === "admin") {
              this.$router.push("/admin/dashboard");
            } else if (user.role === "customer") {
              this.$router.push("/customer/dashboard");
            } else if (user.role === "caption") {
              this.$router.push("/caption/dashboard");
            }
        }

    },
  };
  </script>
  