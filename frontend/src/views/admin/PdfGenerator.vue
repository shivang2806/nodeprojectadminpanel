<template>
    <div class="d-flex">
      <AppSidebar :isOpen="sidebarOpen" />
  
      <div class="main-content">
        <AppHeader
          :user="admin"
          title="PDF Generator"
          @toggleSidebar="sidebarOpen = !sidebarOpen"
        />
  
        <div class="dashboard-content">
  
          <!-- ── Tabs ── -->
          <div class="pdf-tabs">
            <button
              v-for="tab in tabs" :key="tab.key"
              class="pdf-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <i :class="tab.icon + ' me-2'"></i>{{ tab.label }}
            </button>
          </div>
  
          <!-- ══ TAB 1: Users Report ══════════════════════════ -->
          <div v-if="activeTab === 'report'" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="bi bi-people me-2" style="color:var(--info-color);"></i>
                Users Report PDF
              </h3>
            </div>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">
              Generates a styled PDF report of all users from the database including summary stats,
              role badges, and a full users table.
            </p>
  
            <div class="preview-box">
              <i class="bi bi-file-earmark-person" style="font-size:3rem;color:var(--text-secondary);opacity:0.4;"></i>
              <div style="margin-top:0.75rem;">
                <div style="font-weight:600;">Users Report</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">
                  ID • Name • Email • Role • Joined Date
                </div>
              </div>
            </div>
  
            <button class="pdf-btn blue" @click="downloadUsersReport" :disabled="loading.report">
              <span v-if="loading.report">
                <span class="spinner-border spinner-border-sm me-2"></span>Generating...
              </span>
              <span v-else>
                <i class="bi bi-file-earmark-pdf me-2"></i>Download Users Report
              </span>
            </button>
          </div>
  
          <!-- ══ TAB 2: From HTML ══════════════════════════════ -->
          <div v-if="activeTab === 'html'" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="bi bi-code-slash me-2" style="color:var(--success-color);"></i>
                Convert HTML to PDF
              </h3>
            </div>
  
            <div class="row g-3">
              <!-- Left: inputs -->
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="pdf-label">Filename</label>
                  <input v-model="htmlForm.filename" class="pdf-input" placeholder="my-document" />
                </div>
  
                <div class="mb-3">
                  <label class="pdf-label">HTML Content</label>
                  <textarea
                    v-model="htmlForm.html"
                    class="pdf-input pdf-textarea"
                    placeholder="<h1>Hello World</h1><p>Your HTML here...</p>"
                    rows="10"
                  ></textarea>
                </div>
              </div>
  
              <!-- Right: options -->
              <div class="col-lg-6">
                <div class="pdf-options-card">
                  <div class="pdf-label" style="margin-bottom:1rem;">PDF Options</div>
  
                  <div class="mb-3">
                    <label class="pdf-label">Page Size</label>
                    <select v-model="htmlForm.options.format" class="pdf-input">
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
  
                  <div class="mb-3">
                    <label class="pdf-label">Orientation</label>
                    <div style="display:flex;gap:0.75rem;">
                      <label class="radio-opt" :class="{ active: !htmlForm.options.landscape }">
                        <input type="radio" :value="false" v-model="htmlForm.options.landscape" />
                        <i class="bi bi-file-earmark me-1"></i> Portrait
                      </label>
                      <label class="radio-opt" :class="{ active: htmlForm.options.landscape }">
                        <input type="radio" :value="true"  v-model="htmlForm.options.landscape" />
                        <i class="bi bi-file-earmark-ruled me-1"></i> Landscape
                      </label>
                    </div>
                  </div>
  
                  <div class="mb-3">
                    <label class="pdf-label">Margins (mm)</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                      <div>
                        <small style="color:var(--text-secondary);">Top</small>
                        <input v-model="htmlForm.options.margin.top"    class="pdf-input" placeholder="20mm" />
                      </div>
                      <div>
                        <small style="color:var(--text-secondary);">Bottom</small>
                        <input v-model="htmlForm.options.margin.bottom" class="pdf-input" placeholder="20mm" />
                      </div>
                      <div>
                        <small style="color:var(--text-secondary);">Left</small>
                        <input v-model="htmlForm.options.margin.left"   class="pdf-input" placeholder="15mm" />
                      </div>
                      <div>
                        <small style="color:var(--text-secondary);">Right</small>
                        <input v-model="htmlForm.options.margin.right"  class="pdf-input" placeholder="15mm" />
                      </div>
                    </div>
                  </div>
  
                  <label class="pdf-checkbox">
                    <input type="checkbox" v-model="htmlForm.options.printBackground" />
                    <span>Print background colors & images</span>
                  </label>
                </div>
              </div>
            </div>
  
            <!-- Quick templates -->
            <div style="margin:1.25rem 0 0.5rem;">
              <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">Quick Templates:</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.25rem;">
              <button
                v-for="tpl in templates" :key="tpl.label"
                class="chart-btn"
                @click="applyTemplate(tpl)"
              >{{ tpl.label }}</button>
            </div>
  
            <button class="pdf-btn green" @click="convertHtml" :disabled="loading.html || !htmlForm.html.trim()">
              <span v-if="loading.html">
                <span class="spinner-border spinner-border-sm me-2"></span>Converting...
              </span>
              <span v-else>
                <i class="bi bi-arrow-right-circle me-2"></i>Convert to PDF
              </span>
            </button>
          </div>
  
          <!-- ══ TAB 3: From URL ═══════════════════════════════ -->
          <div v-if="activeTab === 'url'" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="bi bi-globe me-2" style="color:var(--accent-color);"></i>
                Convert URL to PDF
              </h3>
            </div>
  
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">
              Enter any public URL and convert the full page to PDF using a headless browser.
            </p>
  
            <div class="row g-3">
              <div class="col-lg-8">
                <div class="mb-3">
                  <label class="pdf-label">Page URL</label>
                  <div class="input-wrapper">
                    <i class="bi bi-link-45deg"></i>
                    <input
                      v-model="urlForm.url"
                      class="pdf-input"
                      placeholder="https://example.com"
                      style="padding-left:2.5rem;"
                    />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="pdf-label">Filename</label>
                  <input v-model="urlForm.filename" class="pdf-input" placeholder="webpage" />
                </div>
              </div>
              <div class="col-lg-4">
                <div class="pdf-options-card">
                  <div class="pdf-label" style="margin-bottom:1rem;">Options</div>
                  <div class="mb-3">
                    <label class="pdf-label">Page Size</label>
                    <select v-model="urlForm.options.format" class="pdf-input">
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  <label class="pdf-checkbox">
                    <input type="checkbox" v-model="urlForm.options.landscape" />
                    <span>Landscape</span>
                  </label>
                </div>
              </div>
            </div>
  
            <button
              class="pdf-btn amber"
              @click="convertUrl"
              :disabled="loading.url || !urlForm.url.trim()"
              style="margin-top:1rem;"
            >
              <span v-if="loading.url">
                <span class="spinner-border spinner-border-sm me-2"></span>Loading page...
              </span>
              <span v-else>
                <i class="bi bi-file-earmark-arrow-down me-2"></i>Convert to PDF
              </span>
            </button>
  
            <div class="info-box" style="margin-top:1rem;">
              <i class="bi bi-info-circle me-2"></i>
              URL must be publicly accessible. Internal/localhost URLs are not supported.
            </div>
          </div>
  
          <!-- ── Toast ── -->
          <div v-if="toast.show" class="pdf-toast" :class="toast.type">
            <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'" class="me-2"></i>
            {{ toast.message }}
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
    name: "PdfGenerator",
    components: { AppSidebar, AppHeader },
  
    data() {
      return {
        admin:       {},
        sidebarOpen: false,
        activeTab:   "report",
  
        tabs: [
          { key: "report", label: "Users Report", icon: "bi bi-people"     },
          { key: "html",   label: "From HTML",    icon: "bi bi-code-slash"  },
          { key: "url",    label: "From URL",      icon: "bi bi-globe"      },
        ],
  
        loading: { report: false, html: false, url: false },
  
        htmlForm: {
          html:     "",
          filename: "document",
          options: {
            format:          "A4",
            landscape:       false,
            printBackground: true,
            margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
          },
        },
  
        urlForm: {
          url:      "",
          filename: "webpage",
          options:  { format: "A4", landscape: false },
        },
  
        toast: { show: false, message: "", type: "success" },
  
        templates: [
          {
            label: "Invoice",
            html: `<style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#1E3A5F;border-bottom:2px solid #F59E0B;padding-bottom:10px}.row{display:flex;justify-content:space-between;margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1E3A5F;color:#fff;padding:10px;text-align:left}td{padding:10px;border-bottom:1px solid #eee}.total{font-size:18px;font-weight:700;text-align:right;margin-top:16px;color:#1E3A5F}</style><h1>Invoice #INV-2026-001</h1><div class="row"><span>Date: January 25, 2026</span><span>Due: February 25, 2026</span></div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody><tr><td>Service A</td><td>2</td><td>$500</td><td>$1,000</td></tr><tr><td>Service B</td><td>1</td><td>$250</td><td>$250</td></tr></tbody></table><div class="total">Total: $1,250</div>`,
            filename: "invoice",
          },
          {
            label: "Report",
            html: `<style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#1E3A5F;margin-bottom:4px}p{color:#64748B;font-size:14px}.cards{display:flex;gap:16px;margin:20px 0}.card{flex:1;padding:16px;border-radius:10px;background:#F8FAFC;border:1px solid #E2E8F0}.card h3{font-size:28px;font-weight:700;color:#0F172A;margin:4px 0}.card span{font-size:12px;color:#64748B;text-transform:uppercase}</style><h1>Monthly Report — January 2026</h1><p>Generated on ${new Date().toLocaleDateString()}</p><div class="cards"><div class="card"><span>Total Users</span><h3>2,847</h3></div><div class="card"><span>Revenue</span><h3>$94.2K</h3></div><div class="card"><span>Active Deals</span><h3>142</h3></div></div><p>This report summarizes the key metrics for the month of January 2026.</p>`,
            filename: "monthly-report",
          },
          {
            label: "Certificate",
            html: `<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FFFBEB}.cert{text-align:center;padding:60px;border:8px double #F59E0B;max-width:600px}.title{font-size:14px;text-transform:uppercase;letter-spacing:4px;color:#64748B}.name{font-size:36px;font-weight:700;color:#1E3A5F;margin:16px 0;font-style:italic}.desc{font-size:16px;color:#475569;line-height:1.8}.date{margin-top:40px;font-size:13px;color:#94A3B8}</style><div class="cert"><div class="title">Certificate of Achievement</div><div style="font-size:48px;margin:16px 0;">🏆</div><div class="desc">This is to certify that</div><div class="name">John Doe</div><div class="desc">has successfully completed the program</div><div class="date">${new Date().toLocaleDateString()}</div></div>`,
            filename: "certificate",
          },
        ],
      };
    },
  
    async mounted() {
      try {
        const res  = await getDashboard();
        this.admin = res.data;
      } catch { this.$router.push("/"); }
    },
  
    methods: {
      // ── Users report ─────────────────────────────────────
      async downloadUsersReport() {
        this.loading.report = true;
        try {
          const res = await api.get("/api/pdf/users-report", { responseType: "blob" });
          this.triggerDownload(res.data, `users-report-${Date.now()}.pdf`);
          this.showToast("Users report downloaded!", "success");
        } catch { this.showToast("Failed to generate report", "error"); }
        finally { this.loading.report = false; }
      },
  
      // ── From HTML ─────────────────────────────────────────
      async convertHtml() {
        if (!this.htmlForm.html.trim()) return;
        this.loading.html = true;
        try {
          const res = await api.post("/api/pdf/from-html", {
            html:     this.htmlForm.html,
            filename: this.htmlForm.filename,
            options:  this.htmlForm.options,
          }, { responseType: "blob" });
          this.triggerDownload(res.data, `${this.htmlForm.filename || "document"}.pdf`);
          this.showToast("PDF generated!", "success");
        } catch { this.showToast("Conversion failed", "error"); }
        finally { this.loading.html = false; }
      },
  
      // ── From URL ──────────────────────────────────────────
      async convertUrl() {
        if (!this.urlForm.url.trim()) return;
        this.loading.url = true;
        try {
          const res = await api.post("/api/pdf/from-url", {
            url:      this.urlForm.url,
            filename: this.urlForm.filename,
            options:  this.urlForm.options,
          }, { responseType: "blob" });
          this.triggerDownload(res.data, `${this.urlForm.filename || "webpage"}.pdf`);
          this.showToast("Page converted to PDF!", "success");
        } catch { this.showToast("Conversion failed. Check the URL and try again.", "error"); }
        finally { this.loading.url = false; }
      },
  
      // ── Apply quick template ──────────────────────────────
      applyTemplate(tpl) {
        this.htmlForm.html     = tpl.html;
        this.htmlForm.filename = tpl.filename;
      },
  
      // ── Helpers ───────────────────────────────────────────
      triggerDownload(blob, filename) {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const a   = document.createElement("a");
        a.href    = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
  
      showToast(message, type = "success") {
        this.toast = { show: true, message, type };
        setTimeout(() => { this.toast.show = false; }, 4000);
      },
    },
  };
  </script>
  
  <style scoped>
  /* ── Tabs ── */
  .pdf-tabs {
    display: flex; gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0;
  }
  .pdf-tab {
    padding: 0.75rem 1.25rem; border: none; background: none;
    color: var(--text-secondary); font-weight: 600; font-size: 0.9rem;
    cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all 0.2s ease;
    font-family: 'Outfit', sans-serif; border-radius: 8px 8px 0 0;
  }
  .pdf-tab:hover  { color: var(--text-primary); background: var(--secondary-color); }
  .pdf-tab.active { color: var(--accent-color); border-bottom-color: var(--accent-color); background: rgba(245,158,11,0.05); }
  
  /* ── Buttons ── */
  .pdf-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.75rem 1.5rem; border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 600; font-family: 'Outfit', sans-serif;
    cursor: pointer; transition: all 0.3s ease;
  }
  .pdf-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none !important; }
  .pdf-btn.blue  { background: var(--info-color);    color: #fff; }
  .pdf-btn.blue:hover:not(:disabled)  { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
  .pdf-btn.green { background: var(--success-color); color: #fff; }
  .pdf-btn.green:hover:not(:disabled) { background: #0ea472; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
  .pdf-btn.amber { background: var(--accent-color);  color: #fff; }
  .pdf-btn.amber:hover:not(:disabled) { background: #d97706; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(245,158,11,0.3); }
  
  /* ── Form inputs ── */
  .pdf-label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 0.4rem; }
  .pdf-input {
    width: 100%; padding: 0.65rem 0.9rem; border-radius: 10px;
    border: 1px solid var(--border-color); background: var(--secondary-color);
    color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  .pdf-input:focus { outline: none; border-color: var(--accent-color); background: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
  .pdf-textarea { resize: vertical; min-height: 200px; font-family: 'DM Mono', monospace; font-size: 0.8rem; }
  
  /* ── Options card ── */
  .pdf-options-card {
    background: var(--secondary-color); border: 1px solid var(--border-color);
    border-radius: 14px; padding: 1.25rem; height: 100%;
  }
  
  /* ── Radio options ── */
  .radio-opt {
    flex: 1; padding: 0.6rem 1rem; border-radius: 8px;
    border: 1px solid var(--border-color); background: #fff;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    display: flex; align-items: center; gap: 0.4rem;
    transition: all 0.2s;
  }
  .radio-opt input { display: none; }
  .radio-opt.active { border-color: var(--accent-color); background: rgba(245,158,11,0.08); color: var(--accent-color); font-weight: 600; }
  
  /* ── Checkbox ── */
  .pdf-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); }
  .pdf-checkbox input { accent-color: var(--accent-color); width: 16px; height: 16px; }
  
  /* ── Preview box ── */
  .preview-box {
    height: 140px; border-radius: 12px; border: 1px dashed var(--border-color);
    background: var(--secondary-color); display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--text-secondary); margin-bottom: 1.25rem; gap: 0.25rem;
  }
  
  /* ── URL input wrapper ── */
  .input-wrapper { position: relative; }
  .input-wrapper i { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
  
  /* ── Info box ── */
  .info-box {
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
    border-radius: 10px; padding: 0.75rem 1rem;
    color: var(--info-color); font-size: 0.875rem;
  }
  
  /* ── Toast ── */
  .pdf-toast {
    position: fixed; bottom: 2rem; right: 2rem;
    padding: 1rem 1.5rem; border-radius: 12px;
    font-weight: 600; font-size: 0.9rem;
    display: flex; align-items: center;
    box-shadow: var(--shadow-lg); z-index: 9999;
    animation: slideUp 0.3s ease;
  }
  .pdf-toast.success { background: #fff; color: var(--success-color); border: 1px solid rgba(16,185,129,0.3); }
  .pdf-toast.error   { background: #fff; color: var(--danger-color);  border: 1px solid rgba(239,68,68,0.3);  }
  </style>