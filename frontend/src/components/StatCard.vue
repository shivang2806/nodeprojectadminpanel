<template>
    <div class="col-md-3 mb-4">
      <div class="card text-white" :class="'bg-' + color">
        <div class="card-body">
          <h6 class="card-title">{{ title }}</h6>
          <h3 class="card-text">{{ value }}</h3>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      value: [String, Number],
      color: {
        type: String,
        default: "primary",
      },
    },
  };
  </script>
  