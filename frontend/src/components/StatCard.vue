<template>
    <div class="stat-card">
      <div class="stat-header">
        <div class="stat-icon" :class="color">
          <i :class="icon"></i>
        </div>
      </div>
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-footer">
        <span class="stat-change" :class="changeDir">
          <i :class="changeDir === 'up' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
          {{ change }}
        </span>
        <span class="stat-period">vs last month</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StatCard",
    props: {
      title:     { type: String,  required: true },
      value:     { type: [String, Number], required: true },
      icon:      { type: String,  default: "bi bi-graph-up" },
      color:     { type: String,  default: "blue" },   // blue | green | amber | red | purple | cyan
      change:    { type: String,  default: "0%" },
      changeDir: { type: String,  default: "up" },     // up | down
    },
  };
  </script>