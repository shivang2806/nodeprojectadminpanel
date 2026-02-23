<template>
  <div class="d-flex">
    <AppSidebar :isOpen="sidebarOpen" />
    <div class="main-content">
      <AppHeader :user="admin" title="Import / Export Users" @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <div class="dashboard-content">

        <!-- ── Export Card ── -->
        <div class="chart-card" style="margin-bottom:1.5rem;">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="bi bi-file-earmark-arrow-down me-2" style="color:var(--success-color);"></i>
              Export Users to Excel
            </h3>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end;">
            <!-- Role filter -->
            <div>
              <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:0.4rem;">
                Filter by Role (optional)
              </label>
              <select v-model="exportFilter" class="bk-select">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="caption">Caption</option>
              </select>
            </div>

            <!-- Export button -->
            <button class="excel-btn green" @click="startExport" :disabled="queueing" style="width:auto;padding:0.65rem 1.5rem;">
              <span v-if="queueing">
                <span class="spinner-border spinner-border-sm me-2"></span>Queuing...
              </span>
              <span v-else>
                <i class="bi bi-send me-2"></i>Start Export
              </span>
            </button>
          </div>

          <!-- Queue success info -->
          <div v-if="activeJobId" class="queue-notice" style="margin-top:1.25rem;">
            <i class="bi bi-hourglass-split me-2"></i>
            Export job <strong>#{{ activeJobId }}</strong> is running in the background.
            Status updates automatically below.
          </div>
        </div>

        <!-- ── Active job progress ── -->
        <div v-if="activeJob" class="chart-card" style="margin-bottom:1.5rem;">
          <div class="chart-header">
            <h3 class="chart-title">Current Export</h3>
            <span class="status-badge" :class="stateBadge(activeJob.state)">{{ activeJob.state }}</span>
          </div>

          <!-- Progress bar -->
          <div v-if="activeJob.state === 'active' || activeJob.state === 'waiting'" style="margin-bottom:1.25rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.4rem;">
              <span style="color:var(--text-secondary);">Processing...</span>
              <span style="font-family:'DM Mono',monospace;font-weight:600;">{{ activeJob.progress }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" :style="{ width: activeJob.progress + '%' }"></div>
            </div>
          </div>

          <!-- Completed -->
          <div v-if="activeJob.state === 'completed'" class="result-box success">
            <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
              <div>
                <i class="bi bi-check-circle-fill" style="font-size:2rem;color:var(--success-color);"></i>
              </div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:1rem;color:var(--text-primary);">Export Complete!</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:2px;">
                  {{ activeJob.result?.totalRows }} users exported •
                  {{ activeJob.result?.filename }}
                </div>
              </div>
              <button class="excel-btn blue" style="width:auto;padding:0.65rem 1.25rem;" @click="downloadJob(activeJob.jobId)">
                <i class="bi bi-download me-2"></i>Download
              </button>
            </div>
          </div>

          <!-- Failed -->
          <div v-if="activeJob.state === 'failed'" class="result-box error">
            <i class="bi bi-exclamation-circle-fill me-2" style="color:var(--danger-color);"></i>
            Export failed: {{ activeJob.error }}
            <button class="excel-btn amber" style="width:auto;padding:0.5rem 1rem;margin-left:1rem;font-size:0.8rem;" @click="startExport">
              Retry
            </button>
          </div>
        </div>

        <!-- ── Export history ── -->
        <div class="chart-card" style="margin-bottom:1.5rem;">
          <div class="chart-header">
            <h3 class="chart-title">Export History</h3>
            <button class="chart-btn" @click="loadJobs">
              <i class="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>

          <div class="table-responsive">
            <table class="table activity-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Rows</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingJobs">
                  <td colspan="6" class="text-center py-3">
                    <span class="spinner-border spinner-border-sm me-2"></span>Loading...
                  </td>
                </tr>
                <tr v-for="job in jobs" :key="job.jobId">
                  <td>
                    <span style="font-family:'DM Mono',monospace;font-weight:600;color:var(--text-primary);">
                      #{{ job.jobId }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="stateBadge(job.state)">{{ job.state }}</span>
                  </td>
                  <td>
                    <div v-if="job.state === 'active'" style="display:flex;align-items:center;gap:0.5rem;">
                      <div class="progress-track" style="width:80px;">
                        <div class="progress-bar" :style="{ width: job.progress + '%' }"></div>
                      </div>
                      <span style="font-size:0.8rem;font-family:'DM Mono',monospace;">{{ job.progress }}%</span>
                    </div>
                    <span v-else style="color:var(--text-secondary);font-size:0.85rem;">
                      {{ job.state === 'completed' ? '100%' : '—' }}
                    </span>
                  </td>
                  <td class="deal-value">
                    {{ job.result?.totalRows ?? '—' }}
                  </td>
                  <td class="date-cell">{{ formatDate(job.createdAt) }}</td>
                  <td>
                    <button
                      v-if="job.state === 'completed'"
                      class="bk-icon-btn blue"
                      @click="downloadJob(job.jobId)"
                      title="Download"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                    <span v-else style="color:var(--text-secondary);font-size:0.85rem;">—</span>
                  </td>
                </tr>
                <tr v-if="!loadingJobs && jobs.length === 0">
                  <td colspan="6" class="text-center py-4" style="color:var(--text-secondary);">
                    No export jobs yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Import section (unchanged) ── -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="bi bi-file-earmark-arrow-up me-2" style="color:var(--info-color);"></i>
              Import Users from Excel
            </h3>
            <button class="chart-btn" @click="downloadTemplate" :disabled="downloading">
              <i class="bi bi-file-earmark-excel me-1"></i>
              {{ downloading ? "Downloading..." : "Get Template" }}
            </button>
          </div>

          <!-- File picker -->
          <label class="file-drop" :class="{ 'drag-over': dragOver }"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input type="file" accept=".xlsx,.xls" @change="onFileChange" ref="fileInput" style="display:none;" />
            <div v-if="!selectedFile" style="text-align:center;">
              <i class="bi bi-cloud-upload" style="font-size:2.5rem;color:var(--text-secondary);display:block;margin-bottom:0.75rem;"></i>
              <div style="font-weight:600;color:var(--text-primary);">Click or drag & drop Excel file</div>
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem;">.xlsx or .xls only</div>
            </div>
            <div v-else class="file-preview">
              <i class="bi bi-file-earmark-excel-fill" style="font-size:2rem;color:var(--success-color);"></i>
              <div>
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatSize(selectedFile.size) }}</div>
              </div>
              <button class="bk-icon-btn red" @click.prevent="clearFile" style="margin-left:auto;">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </label>

          <button
            v-if="selectedFile"
            class="excel-btn blue"
            style="margin-top:1rem;"
            @click="importUsers"
            :disabled="importing"
          >
            <span v-if="importing">
              <span class="spinner-border spinner-border-sm me-2"></span>Importing...
            </span>
            <span v-else><i class="bi bi-cloud-upload me-2"></i>Upload & Import</span>
          </button>

          <!-- Import result -->
          <div v-if="importResult" style="margin-top:1.25rem;">
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
              <div class="result-badge green"><i class="bi bi-check-circle-fill me-2"></i>{{ importResult.results.created }} Created</div>
              <div class="result-badge amber"><i class="bi bi-skip-forward-fill me-2"></i>{{ importResult.results.skipped }} Skipped</div>
              <div v-if="importResult.results.errors.length" class="result-badge red">
                <i class="bi bi-exclamation-circle-fill me-2"></i>{{ importResult.results.errors.length }} Errors
              </div>
            </div>
            <div v-if="importResult.note" class="info-box">
              <i class="bi bi-info-circle me-2"></i>{{ importResult.note }}
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

const POLL_INTERVAL = 2000; // poll every 2 seconds while job is active

export default {
  name: "UserExcel",
  components: { AppSidebar, AppHeader },

  data() {
    return {
      admin:        {},
      sidebarOpen:  false,
      exportFilter: "",
      queueing:     false,
      activeJobId:  null,
      activeJob:    null,
      pollTimer:    null,
      jobs:         [],
      loadingJobs:  false,
      downloading:  false,
      importing:    false,
      selectedFile: null,
      importResult: null,
      dragOver:     false,
    };
  },

  async mounted() {
    try {
      const res = await getDashboard();
      this.admin = res.data;
    } catch { this.$router.push("/"); return; }
    await this.loadJobs();
  },

  beforeUnmount() {
    this.stopPolling();
  },

  methods: {
    // ── Export ──────────────────────────────────────────
    async startExport() {
      this.queueing    = true;
      this.activeJob   = null;
      this.activeJobId = null;
      this.stopPolling();
      try {
        const params = this.exportFilter ? `?role=${this.exportFilter}` : "";
        const res    = await api.post(`/api/user/export${params}`);
        this.activeJobId = res.data.jobId;
        this.startPolling(this.activeJobId);
        await this.loadJobs();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to start export");
      } finally {
        this.queueing = false;
      }
    },

    // ── Poll job status ──────────────────────────────────
    startPolling(jobId) {
      this.pollTimer = setInterval(async () => {
        try {
          const res = await api.get(`/api/user/export/status/${jobId}`);
          this.activeJob = res.data;

          // Refresh jobs list every poll
          await this.loadJobs();

          // Stop polling when done
          if (["completed", "failed"].includes(res.data.state)) {
            this.stopPolling();
          }
        } catch {
          this.stopPolling();
        }
      }, POLL_INTERVAL);
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    // ── Load job history ─────────────────────────────────
    async loadJobs() {
      this.loadingJobs = true;
      try {
        const res  = await api.get("/api/user/export/jobs");
        this.jobs  = res.data.jobs;
      } catch { /* silent */ }
      finally { this.loadingJobs = false; }
    },

    // ── Download completed export ─────────────────────────
    async downloadJob(jobId) {
      try {
        const res = await api.get(`/api/user/export/download/${jobId}`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a   = document.createElement("a");
        a.href    = url;
        a.download = `users-export-${jobId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch { alert("Download failed"); }
    },

    // ── Import ───────────────────────────────────────────
    async downloadTemplate() {
      this.downloading = true;
      try {
        const res = await api.get("/api/user/import-template", { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a   = document.createElement("a");
        a.href    = url; a.download = "users-import-template.xlsx";
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      } catch { alert("Failed to download template"); }
      finally { this.downloading = false; }
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (file) { this.selectedFile = file; this.importResult = null; }
    },

    onDrop(e) {
      this.dragOver = false;
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        this.selectedFile = file; this.importResult = null;
      }
    },

    clearFile() {
      this.selectedFile = null;
      this.$refs.fileInput.value = "";
      this.importResult = null;
    },

    async importUsers() {
      if (!this.selectedFile) return;
      this.importing = true;
      try {
        const form = new FormData();
        form.append("file", this.selectedFile);
        const res = await api.post("/api/user/import", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.importResult = res.data;
        this.clearFile();
      } catch (err) {
        alert(err.response?.data?.message || "Import failed");
      } finally { this.importing = false; }
    },

    // ── Helpers ──────────────────────────────────────────
    stateBadge(state) {
      return { completed: "completed", failed: "cancelled", active: "pending", waiting: "pending" }[state] || "pending";
    },

    formatDate(iso) {
      if (!iso) return "—";
      return new Date(iso).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    },

    formatSize(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },
  },
};
</script>

<style scoped>
.excel-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.75rem 1.25rem; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.3s ease;
}
.excel-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.excel-btn.green { background: var(--success-color); color: #fff; }
.excel-btn.green:hover:not(:disabled) { background: #0ea472; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
.excel-btn.blue  { background: var(--info-color); color: #fff; }
.excel-btn.blue:hover:not(:disabled)  { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
.excel-btn.amber { background: var(--accent-color); color: #fff; }
.excel-btn.amber:hover:not(:disabled) { background: #d97706; transform: translateY(-2px); }

.bk-select {
  padding: 0.65rem 0.75rem; border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--secondary-color); color: var(--text-primary);
  font-family: 'Outfit', sans-serif; font-size: 0.875rem;
}
.bk-select:focus { outline: none; border-color: var(--accent-color); }

.queue-notice {
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 10px; padding: 0.75rem 1rem;
  color: var(--info-color); font-size: 0.9rem; font-weight: 500;
}

/* Progress bar */
.progress-track {
  width: 100%; height: 8px;
  background: var(--secondary-color);
  border-radius: 99px; overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--success-color));
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* Result boxes */
.result-box {
  padding: 1rem 1.25rem; border-radius: 12px;
  display: flex; align-items: center;
}
.result-box.success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); }
.result-box.error   { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.2); color: var(--danger-color); }

/* Result badges */
.result-badge { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; }
.result-badge.green { background: rgba(16,185,129,0.1); color: var(--success-color); }
.result-badge.amber { background: rgba(245,158,11,0.1);  color: var(--accent-color); }
.result-badge.red   { background: rgba(239,68,68,0.1);   color: var(--danger-color); }

/* File drop zone */
.file-drop {
  display: block; width: 100%; padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 14px; cursor: pointer;
  transition: all 0.3s ease; background: var(--secondary-color);
}
.file-drop:hover, .file-drop.drag-over {
  border-color: var(--accent-color);
  background: rgba(245,158,11,0.04);
}
.file-preview { display: flex; align-items: center; gap: 1rem; }
.file-name    { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
.file-size    { font-size: 0.8rem; color: var(--text-secondary); font-family: 'DM Mono', monospace; }

.bk-icon-btn {
  width: 36px; height: 36px; border: none; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;
}
.bk-icon-btn.blue { background: rgba(59,130,246,0.1); color: var(--info-color); }
.bk-icon-btn.blue:hover { background: var(--info-color); color: #fff; }
.bk-icon-btn.red  { background: rgba(239,68,68,0.1);   color: var(--danger-color); }
.bk-icon-btn.red:hover  { background: var(--danger-color); color: #fff; }

.info-box {
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
  border-radius: 10px; padding: 0.75rem 1rem;
  color: var(--info-color); font-size: 0.9rem; font-weight: 500;
}
</style>