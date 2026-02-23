<template>
    <div class="d-flex">
      <AppSidebar :isOpen="sidebarOpen" />
  
      <div class="main-content">
        <AppHeader
          :user="admin"
          title="Database Backup"
          @toggleSidebar="sidebarOpen = !sidebarOpen"
        />
  
        <div class="dashboard-content">
  
          <!-- ── Stat cards ── -->
          <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:2rem;">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon blue"><i class="bi bi-archive"></i></div>
              </div>
              <div class="stat-title">Total Backups</div>
              <div class="stat-value">{{ backups.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon green"><i class="bi bi-hdd"></i></div>
              </div>
              <div class="stat-title">Total Size</div>
              <div class="stat-value">{{ totalSize }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon amber"><i class="bi bi-clock-history"></i></div>
              </div>
              <div class="stat-title">Latest Backup</div>
              <div class="stat-value" style="font-size:1rem;">{{ latestBackup }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon purple"><i class="bi bi-calendar-check"></i></div>
              </div>
              <div class="stat-title">Auto Backup</div>
              <div class="stat-value" style="font-size:1rem;">Daily 00:00</div>
            </div>
          </div>
  
          <!-- ── Action bar ── -->
          <div class="chart-card" style="margin-bottom:1.5rem;">
            <div class="chart-header">
              <h3 class="chart-title">Actions</h3>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1rem;">
  
              <!-- Manual backup -->
              <button class="bk-btn green" @click="createBackup" :disabled="creating">
                <span v-if="creating">
                  <span class="spinner-border spinner-border-sm me-2"></span>Creating...
                </span>
                <span v-else><i class="bi bi-database-add me-2"></i>Backup Now</span>
              </button>
  
              <!-- Clean old -->
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <button class="bk-btn amber" @click="cleanBackups" :disabled="cleaning">
                  <span v-if="cleaning">
                    <span class="spinner-border spinner-border-sm me-2"></span>Cleaning...
                  </span>
                  <span v-else><i class="bi bi-trash3 me-2"></i>Clean Old</span>
                </button>
                <select v-model="cleanDays" class="bk-select">
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
  
              <!-- Refresh list -->
              <button class="bk-btn blue" @click="loadBackups" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-2"></i>Refresh
              </button>
  
            </div>
  
            <!-- Toast message -->
            <div v-if="toast.show" class="bk-toast" :class="toast.type" style="margin-top:1rem;">
              <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'" class="me-2"></i>
              {{ toast.message }}
            </div>
          </div>
  
          <!-- ── Backup list table ── -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">All Backups</h3>
              <span style="font-size:0.8rem;color:var(--text-secondary);font-family:'DM Mono',monospace;">
                Stored in: /backups/
              </span>
            </div>
  
            <div class="table-responsive">
              <table class="table activity-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Filename</th>
                    <th>Size</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="5" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span>Loading backups...
                    </td>
                  </tr>
  
                  <tr v-for="(bk, i) in backups" :key="bk.filename">
                    <td class="date-cell">{{ i + 1 }}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.75rem;">
                        <div style="width:36px;height:36px;border-radius:8px;background:rgba(59,130,246,0.1);
                                    color:var(--info-color);display:flex;align-items:center;justify-content:center;
                                    font-size:1.1rem;flex-shrink:0;">
                          <i class="bi bi-file-zip"></i>
                        </div>
                        <div>
                          <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);">
                            {{ bk.filename }}
                          </div>
                          <div style="font-size:0.75rem;color:var(--text-secondary);font-family:'DM Mono',monospace;">
                            .zip compressed
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge pending">{{ bk.sizeMB }}</span>
                    </td>
                    <td class="date-cell">{{ formatDate(bk.createdAt) }}</td>
                    <td>
                      <div style="display:flex;gap:0.5rem;">
                        <!-- Download -->
                        <button
                          class="bk-icon-btn blue"
                          @click="downloadBackup(bk.filename)"
                          title="Download"
                        >
                          <i class="bi bi-download"></i>
                        </button>
                        <!-- Delete -->
                        <button
                          class="bk-icon-btn red"
                          @click="deleteBackup(bk.filename)"
                          title="Delete"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
  
                  <tr v-if="!loading && backups.length === 0">
                    <td colspan="5" class="text-center py-4" style="color:var(--text-secondary);">
                      <i class="bi bi-archive" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>
                      No backups yet. Click "Backup Now" to create one.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- ── Info box ── -->
          <div class="chart-card" style="margin-top:1.5rem;">
            <div class="chart-header">
              <h3 class="chart-title">Backup Info</h3>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
              <div class="info-item">
                <i class="bi bi-clock me-2" style="color:var(--accent-color);"></i>
                <div>
                  <strong>Auto Schedule</strong>
                  <p>Runs automatically every day at midnight</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-file-zip me-2" style="color:var(--info-color);"></i>
                <div>
                  <strong>Format</strong>
                  <p>SQL dump compressed to .zip (max compression)</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-folder2 me-2" style="color:var(--success-color);"></i>
                <div>
                  <strong>Storage</strong>
                  <p>Saved in <code>backend/backups/</code> folder</p>
                </div>
              </div>
              <div class="info-item">
                <i class="bi bi-shield-check me-2" style="color:var(--danger-color);"></i>
                <div>
                  <strong>Auto Cleanup</strong>
                  <p>Old backups auto-deleted after 7 days</p>
                </div>
              </div>
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppSidebar from "../../components/AppSidebar.vue";
  import AppHeader  from "../../components/AppHeader.vue";
  import api        from "../../api/axios";
  import { getDashboard } from "../../api/userApi";
  
  export default {
    name: "BackupManager",
    components: { AppSidebar, AppHeader },
  
    data() {
      return {
        admin:     {},
        backups:   [],
        loading:   false,
        creating:  false,
        cleaning:  false,
        cleanDays: "7",
        sidebarOpen: false,
        toast: { show: false, message: "", type: "success" },
      };
    },
  
    computed: {
      totalSize() {
        const total = this.backups.reduce((sum, b) => sum + b.size, 0);
        if (total === 0) return "0 MB";
        return `${(total / (1024 * 1024)).toFixed(2)} MB`;
      },
      latestBackup() {
        if (!this.backups.length) return "None";
        return this.formatDate(this.backups[0].createdAt);
      },
    },
  
    async mounted() {
      try {
        const res = await getDashboard();
        this.admin = res.data;
      } catch { this.$router.push("/"); return; }
      await this.loadBackups();
    },
  
    methods: {
      async loadBackups() {
        this.loading = true;
        try {
          const res    = await api.get("/api/backup");
          this.backups = res.data.backups;
        } catch { this.showToast("Failed to load backups", "error"); }
        finally { this.loading = false; }
      },
  
      async createBackup() {
        this.creating = true;
        try {
          const res = await api.post("/api/backup");
          this.showToast(`Backup created: ${res.data.backup.filename}`, "success");
          await this.loadBackups();
        } catch (err) {
          this.showToast(err.response?.data?.message || "Backup failed", "error");
        } finally { this.creating = false; }
      },
  
      async cleanBackups() {
        if (!confirm(`Delete all backups older than ${this.cleanDays} days?`)) return;
        this.cleaning = true;
        try {
          const res = await api.delete(`/api/backup/clean?days=${this.cleanDays}`);
          this.showToast(res.data.message, "success");
          await this.loadBackups();
        } catch { this.showToast("Cleanup failed", "error"); }
        finally { this.cleaning = false; }
      },
  
      async downloadBackup(filename) {
        try {
          const res = await api.get(`/api/backup/download/${filename}`, { responseType: "blob" });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const a   = document.createElement("a");
          a.href    = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch { this.showToast("Download failed", "error"); }
      },
  
      async deleteBackup(filename) {
        if (!confirm(`Delete backup "${filename}"?`)) return;
        try {
          await api.delete(`/api/backup/${filename}`);
          this.showToast(`Deleted: ${filename}`, "success");
          await this.loadBackups();
        } catch { this.showToast("Delete failed", "error"); }
      },
  
      showToast(message, type = "success") {
        this.toast = { show: true, message, type };
        setTimeout(() => { this.toast.show = false; }, 4000);
      },
  
      formatDate(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString([], {
          year: "numeric", month: "short", day: "2-digit",
          hour: "2-digit", minute: "2-digit",
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .bk-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.65rem 1.25rem; border: none; border-radius: 10px;
    font-size: 0.875rem; font-weight: 600;
    font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.3s ease;
  }
  .bk-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .bk-btn.green { background: var(--success-color); color: #fff; }
  .bk-btn.green:hover:not(:disabled) { background: #0ea472; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
  .bk-btn.blue  { background: var(--info-color);    color: #fff; }
  .bk-btn.blue:hover:not(:disabled)  { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
  .bk-btn.amber { background: var(--accent-color);  color: #fff; }
  .bk-btn.amber:hover:not(:disabled) { background: #d97706; transform: translateY(-2px); }
  
  .bk-select {
    padding: 0.65rem 0.75rem; border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--secondary-color); color: var(--text-primary);
    font-family: 'Outfit', sans-serif; font-size: 0.875rem; cursor: pointer;
  }
  .bk-select:focus { outline: none; border-color: var(--accent-color); }
  
  .bk-icon-btn {
    width: 36px; height: 36px; border: none; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;
  }
  .bk-icon-btn.blue { background: rgba(59,130,246,0.1); color: var(--info-color); }
  .bk-icon-btn.blue:hover { background: var(--info-color); color: #fff; }
  .bk-icon-btn.red  { background: rgba(239,68,68,0.1);   color: var(--danger-color); }
  .bk-icon-btn.red:hover  { background: var(--danger-color);   color: #fff; }
  
  .bk-toast {
    padding: 0.75rem 1rem; border-radius: 10px;
    font-size: 0.9rem; font-weight: 500;
    display: flex; align-items: center;
  }
  .bk-toast.success { background: rgba(16,185,129,0.1); color: var(--success-color); border: 1px solid rgba(16,185,129,0.2); }
  .bk-toast.error   { background: rgba(239,68,68,0.1);  color: var(--danger-color);  border: 1px solid rgba(239,68,68,0.2); }
  
  .stat-icon.purple { background: rgba(139,92,246,0.15); color: #8B5CF6; }
  
  .info-item {
    display: flex; gap: 0.75rem; align-items: flex-start;
    padding: 1rem; background: var(--secondary-color);
    border-radius: 12px; border: 1px solid var(--border-color);
  }
  .info-item i { font-size: 1.25rem; margin-top: 2px; flex-shrink: 0; }
  .info-item strong { font-size: 0.9rem; color: var(--text-primary); display: block; margin-bottom: 2px; }
  .info-item p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }
  .info-item code { background: var(--border-color); padding: 1px 5px; border-radius: 4px; font-size: 0.8rem; }
  </style>