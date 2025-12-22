<template>
    <div class="d-flex">
      <Sidebar />
      <div class="flex-fill">
        <Navbar :user="admin" />
  
        <div class="p-4">
          <h4>Users</h4>
  
          <button class="btn btn-success mb-3" @click="openForm()">Add User</button>
  
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.role }}</td>
                <td>
                  <button class="btn btn-sm btn-warning" @click="openForm(u)">Edit</button>
                  <button class="btn btn-sm btn-danger ms-1" @click="remove(u.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
  
          <!-- Form -->
          <div v-if="show">
            <input v-model="form.name" class="form-control mb-2" placeholder="Name" />
            <input v-model="form.email" class="form-control mb-2" placeholder="Email" />
            <input v-model="form.password" type="password" class="form-control mb-2" placeholder="Password" />
            <select v-model="form.role" class="form-control mb-2">
              <option>admin</option>
              <option>customer</option>
              <option>caption</option>
            </select>
  
            <button class="btn btn-primary" @click="save">Save</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from "../api/axios";
  import Sidebar from "../components/Sidebar.vue";
  import Navbar from "../components/Navbar.vue";
  
  export default {
    components: { Sidebar, Navbar },
    data() {
      return {
        users: [],
        admin: {},
        show: false,
        form: {},
      };
    },
    async mounted() {
      this.admin = (await api.get("/api/user/dashboard")).data;
      this.load();
    },
    methods: {
      async load() {
        this.users = (await api.get("/user")).data;
      },
      openForm(user = {}) {
        this.form = { ...user };
        this.show = true;
      },
      async save() {
        if (this.form.id) {
          await api.put(`/user/${this.form.id}`, this.form);
        } else {
          await api.post("/user", this.form);
        }
        this.show = false;
        this.load();
      },
      async remove(id) {
        await api.delete(`/user/${id}`);
        this.load();
      },
    },
  };
  </script>
  