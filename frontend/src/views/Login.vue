<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">D</div>
        <span class="login-logo-text">DevTools</span>
      </div>

      <h2 class="login-title">Welcome back</h2>
      <p class="login-subtitle">Sign in to your account to continue</p>

      <div v-if="error" class="login-error">
        <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
      </div>

      <div class="mb-3">
        <label class="form-label">Email address</label>
        <div class="input-wrapper">
          <i class="bi bi-envelope"></i>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="you@company.com"
            @keyup.enter="handleLogin"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label">Password</label>
        <div class="input-wrapper">
          <i class="bi bi-lock"></i>
          <input
            v-model="password"
            :type="showPass ? 'text' : 'password'"
            class="form-control"
            placeholder="••••••••"
            @keyup.enter="handleLogin"
            style="padding-right:3rem;"
          />
          <i
            :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"
            style="left:auto;right:1rem;cursor:pointer;"
            @click="showPass = !showPass"
          ></i>
        </div>
      </div>

      <button class="btn-login" @click="handleLogin" :disabled="loading">
        <span v-if="loading">
          <span class="spinner-border spinner-border-sm me-2"></span>Signing in...
        </span>
        <span v-else>Sign In</span>
      </button>
    </div>
  </div>
</template>

<script>
import { login } from "../api/authApi";
import { connectSocket } from "../socket/socket";   // ← named import

const ROLE_ROUTES = {
  admin:    "/admin/dashboard",
  customer: "/customer/dashboard",
  caption:  "/caption/dashboard",
};

export default {
  name: "Login",
  data() {
    return { email: "", password: "", error: "", loading: false, showPass: false };
  },
  methods: {
    async handleLogin() {
      this.error = "";
      if (!this.email || !this.password) {
        this.error = "Please enter your email and password.";
        return;
      }
      this.loading = true;
      try {
        const res = await login(this.email, this.password);
        const { token, role, user } = res.data;

        // 1. Save to localStorage
        localStorage.setItem("token",   token);
        localStorage.setItem("role",    role);
        localStorage.setItem("user_id", String(user.id));

        // 2. Connect socket AFTER token is saved
        connectSocket();

        // 3. Redirect
        this.$router.push(ROLE_ROUTES[role] || "/");
      } catch (err) {
        this.error = err.response?.data?.message || "Login failed.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>