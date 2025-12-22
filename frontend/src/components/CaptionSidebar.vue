<template>
    <div class="bg-light vh-100 p-3 border-end" style="width: 220px">
      <h5 class="text-center mb-4">Caption</h5>
  
      <ul class="nav flex-column gap-2">
        <li class="nav-item">
          <router-link class="nav-link" to="/caption/dashboard">
            🏠 Dashboard
          </router-link>
        </li>
  
        <li class="nav-item">
          <router-link class="nav-link" to="/caption/assignments">
            📋 Assignments
          </router-link>
        </li>
  
        <li class="nav-item">
          <router-link class="nav-link" to="/caption/earnings">
            💰 Earnings
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
    background-color: #0dcaf0;
    color: #000 !important;
    border-radius: 6px;
  }
  </style>
  