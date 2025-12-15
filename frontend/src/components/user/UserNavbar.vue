<template>
    <nav class="navbar navbar-light bg-light px-3">
      <span class="navbar-brand">User Dashboard</span>
  
      <button class="btn btn-outline-danger btn-sm" @click="logout">
        Logout
      </button>
    </nav>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        localStorage.clear();
        this.$router.push("/");
      },
    },
  };
  </script>
  