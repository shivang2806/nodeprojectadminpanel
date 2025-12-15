<template>
    <nav class="navbar navbar-dark bg-dark px-3">
      <span class="navbar-brand">Admin Panel</span>
  
      <div class="dropdown">
        <button class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown">
          {{ user.name }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <button class="dropdown-item text-danger" @click="logout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    props: ["user"],
    methods: {
      logout() {
        localStorage.removeItem("token");
        this.$router.push("/");
      },
    },
  };
  </script>
  