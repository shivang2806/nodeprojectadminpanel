<template>
    <div class="bg-dark text-white vh-100 p-3" style="width:230px">
      <h5 class="mb-4">Admin Panel</h5>
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link class="nav-link text-white" to="/admin/dashboard">
            Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link text-white" to="/admin/users">
            Users
          </router-link>
        </li>
      </ul>
    </div>
  </template>
  