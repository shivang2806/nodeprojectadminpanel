<template>
    <div class="d-flex">
      <AppSidebar :isOpen="sidebarOpen" />
  
      <div class="main-content">
        <AppHeader
          :user="admin"
          title="Import / Export Users"
          @toggleSidebar="sidebarOpen = !sidebarOpen"
        />
  
        <div class="dashboard-content">
  
          <!-- ── Top action cards ── -->
          <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">
  
            <!-- EXPORT card -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon green"><i class="bi bi-file-earmark-arrow-down"></i></div>
              </div>
              <div class="stat-title">Export Users</div>
              <div class="stat-value" style="font-size:1.1rem;margin-bottom:0.75rem;">
                Download full users list as Excel
              </div>
              <button class="excel-btn green" @click="exportUsers" :disabled="exporting">
                <span v-if="exporting">
                  <span class="spinner-border spinner-border-sm me-2"></span>Exporting...
                </span>
                <span v-else><i class="bi bi-download me-2"></i>Export .xlsx</span>
              </button>
            </div>
  
            <!-- TEMPLATE card -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon amber"><i class="bi bi-file-earmark-excel"></i></div>
              </div>
              <div class="stat-title">Import Template</div>
              <div class="stat-value" style="font-size:1.1rem;margin-bottom:0.75rem;">
                Download blank template for import
              </div>
              <button class="excel-btn amber" @click="downloadTemplate" :disabled="downloading">
                <span v-if="downloading">
                  <span class="spinner-border spinner-border-sm me-2"></span>Downloading...
                </span>
                <span v-else><i class="bi bi-file-earmark-arrow-down me-2"></i>Get Template</span>
              </button>
            </div>
  
            <!-- IMPORT card -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon blue"><i class="bi bi-file-earmark-arrow-up"></i></div>
              </div>
              <div class="stat-title">Import Users</div>
              <div class="stat-value" style="font-size:1.1rem;margin-bottom:0.75rem;">
                Upload filled Excel to bulk-add users
              </div>
              <label class="excel-btn blue" style="cursor:pointer;text-align:center;">
                <i class="bi bi-upload me-2"></i>Choose File
                <input type="file" accept=".xlsx,.xls" @change="onFileChange" style="display:none;" ref="fileInput" />
              </label>
            </div>
  
          </div>
  
          <!-- ── Selected file preview + upload ── -->
          <div v-if="selectedFile" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Ready to Import</h3>
            </div>
  
            <div class="file-preview">
              <div class="file-icon"><i class="bi bi-file-earmark-excel-fill"></i></div>
              <div class="file-info">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatSize(selectedFile.size) }}</div>
              </div>
              <button class="excel-btn red" @click="clearFile" style="margin-left:auto;width:auto;padding:0.5rem 1rem;">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
  
            <button
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
          </div>
  
          <!-- ── Import result ── -->
          <div v-if="importResult" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Import Result</h3>
              <button class="chart-btn" @click="importResult = null">Dismiss</button>
            </div>
  
            <!-- Summary badges -->
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;">
              <div class="result-badge green">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ importResult.results.created }} Created
              </div>
              <div class="result-badge amber">
                <i class="bi bi-skip-forward-fill me-2"></i>
                {{ importResult.results.skipped }} Skipped (already exist)
              </div>
              <div class="result-badge red" v-if="importResult.results.errors.length">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
                {{ importResult.results.errors.length }} Errors
              </div>
            </div>
  
            <!-- Default password note -->
            <div class="info-box" v-if="importResult.note">
              <i class="bi bi-info-circle me-2"></i>{{ importResult.note }}
            </div>
  
            <!-- Error table -->
            <div v-if="importResult.results.errors.length" style="margin-top:1rem;">
              <h6 style="font-weight:600;margin-bottom:0.75rem;color:var(--danger-color);">
                <i class="bi bi-exclamation-triangle me-2"></i>Rows with errors
              </h6>
              <div class="table-responsive">
                <table class="table activity-table">
                  <thead>
                    <tr>
                      <th>Row / Email</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(err, i) in importResult.results.errors" :key="i">
                      <td class="deal-value">{{ err.row || err.email || '—' }}</td>
                      <td style="color:var(--danger-color);">{{ err.reason }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
  
          <!-- ── Instructions ── -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">How to Import</h3>
            </div>
            <div class="steps-list">
              <div class="step" v-for="(s, i) in steps" :key="i">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-text">
                  <strong>{{ s.title }}</strong>
                  <p>{{ s.desc }}</p>
                </div>
              </div>
            </div>
  
            <div style="margin-top:1.5rem;">
              <h6 style="font-weight:600;margin-bottom:0.75rem;">Excel Column Format</h6>
              <div class="table-responsive">
                <table class="table activity-table">
                  <thead>
                    <tr>
                      <th>Column</th><th>Required</th><th>Allowed Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="deal-value">B — Name</td>
                      <td><span class="status-badge completed">Yes</span></td>
                      <td>Any text</td>
                    </tr>
                    <tr>
                      <td class="deal-value">C — Email</td>
                      <td><span class="status-badge completed">Yes</span></td>
                      <td>Valid email address</td>
                    </tr>
                    <tr>
                      <td class="deal-value">D — Role</td>
                      <td><span class="status-badge completed">Yes</span></td>
                      <td>
                        <span class="status-badge completed" style="margin-right:4px;">admin</span>
                        <span class="status-badge pending"   style="margin-right:4px;">customer</span>
                        <span class="status-badge cancelled">caption</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
    name: "UserExcel",
    components: { AppSidebar, AppHeader },
  
    data() {
      return {
        admin:        {},
        sidebarOpen:  false,
        exporting:    false,
        downloading:  false,
        importing:    false,
        selectedFile: null,
        importResult: null,
        steps: [
          { title: "Download the template",   desc: "Click 'Get Template' to download a pre-formatted Excel file." },
          { title: "Fill in user data",       desc: "Add Name, Email and Role for each user in the correct columns." },
          { title: "Upload the file",         desc: "Click 'Choose File', select your filled Excel, then click Upload & Import." },
          { title: "Review the results",      desc: "Check how many users were created, skipped, or had errors." },
        ],
      };
    },
  
    async mounted() {
      try {
        const res = await getDashboard();
        this.admin = res.data;
      } catch { this.$router.push("/"); }
    },
  
    methods: {
      // ── Export ──
      async exportUsers() {
        this.exporting = true;
        try {
          const res = await api.get("/api/user/export", { responseType: "blob" });
          this.triggerDownload(res.data, `users-export-${Date.now()}.xlsx`);
        } catch { alert("Export failed. Please try again."); }
        finally { this.exporting = false; }
      },
  
      // ── Template ──
      async downloadTemplate() {
        this.downloading = true;
        try {
          const res = await api.get("/api/user/import-template", { responseType: "blob" });
          this.triggerDownload(res.data, "users-import-template.xlsx");
        } catch { alert("Failed to download template."); }
        finally { this.downloading = false; }
      },
  
      // ── File select ──
      onFileChange(e) {
        const file = e.target.files[0];
        if (file) {
          this.selectedFile = file;
          this.importResult = null;
        }
      },
  
      clearFile() {
        this.selectedFile = null;
        this.$refs.fileInput.value = "";
        this.importResult = null;
      },
  
      // ── Import ──
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
          alert(err.response?.data?.message || "Import failed.");
        } finally {
          this.importing = false;
        }
      },
  
      // ── Helpers ──
      triggerDownload(blob, filename) {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a   = document.createElement("a");
        a.href    = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
  
      formatSize(bytes) {
        if (bytes < 1024)       return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      },
    },
  };
  </script>
  
  <style scoped>
  /* ── Buttons ── */
  .excel-btn {
    display: flex; align-items: center; justify-content: center;
    width: 100%; padding: 0.75rem 1.25rem;
    border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 600;
    font-family: 'Outfit', sans-serif;
    cursor: pointer; transition: all 0.3s ease;
  }
  .excel-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .excel-btn.green  { background: var(--success-color); color: #fff; }
  .excel-btn.green:hover:not(:disabled)  { background: #0ea472; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
  .excel-btn.blue   { background: var(--info-color);    color: #fff; }
  .excel-btn.blue:hover:not(:disabled)   { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
  .excel-btn.amber  { background: var(--accent-color);  color: #fff; }
  .excel-btn.amber:hover:not(:disabled)  { background: #d97706; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(245,158,11,0.3); }
  .excel-btn.red    { background: var(--danger-color);  color: #fff; }
  .excel-btn.red:hover:not(:disabled)    { background: #dc2626; transform: translateY(-2px); }
  
  /* ── File preview ── */
  .file-preview {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }
  .file-icon { font-size: 2.5rem; color: #10B981; line-height: 1; }
  .file-name { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
  .file-size { font-size: 0.8rem; color: var(--text-secondary); font-family: 'DM Mono', monospace; margin-top: 2px; }
  
  /* ── Result badges ── */
  .result-badge {
    display: inline-flex; align-items: center;
    padding: 0.5rem 1rem; border-radius: 10px;
    font-weight: 600; font-size: 0.9rem;
  }
  .result-badge.green { background: rgba(16,185,129,0.1);  color: var(--success-color); }
  .result-badge.amber { background: rgba(245,158,11,0.1);  color: var(--accent-color);  }
  .result-badge.red   { background: rgba(239,68,68,0.1);   color: var(--danger-color);  }
  
  /* ── Info box ── */
  .info-box {
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 10px; padding: 0.75rem 1rem;
    color: var(--info-color); font-size: 0.9rem; font-weight: 500;
  }
  
  /* ── Steps ── */
  .steps-list { display: flex; flex-direction: column; gap: 1rem; }
  .step { display: flex; gap: 1rem; align-items: flex-start; }
  .step-num {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    background: var(--accent-color); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.9rem;
  }
  .step-text strong { font-size: 0.95rem; color: var(--text-primary); }
  .step-text p { font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0; }
  </style>