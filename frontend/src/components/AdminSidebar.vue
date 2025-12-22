<template>
  <div class="bg-light vh-100 p-3 border-end" style="width: 230px">
    <h5 class="text-center mb-4">Admin</h5>

    <ul class="nav flex-column gap-2">
      <li class="nav-item">
        <router-link class="nav-link" to="/admin/dashboard">
          📊 Dashboard
        </router-link>
      </li>

      <li class="nav-item">
        <router-link class="nav-link" to="/admin/users">
          👥 Users
        </router-link>
      </li>

      <li class="nav-item">
        <router-link class="nav-link" to="/admin/settings">
          ⚙️ Settings
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-link {
  color: #333;
  font-weight: 500;
}

.router-link-active {
  background-color: #0d6efd;
  color: white !important;
  border-radius: 5px;
}
</style>
