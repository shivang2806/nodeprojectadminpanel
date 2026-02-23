<template>
    <div class="d-flex">
      <AppSidebar :isOpen="sidebarOpen" />
  
      <div class="main-content">
        <AppHeader
          :user="admin"
          title="System Monitor"
          @toggleSidebar="sidebarOpen = !sidebarOpen"
        />
  
        <div class="dashboard-content">
  
          <!-- ── Top bar ── -->
          <div class="monitor-topbar">
            <div class="live-indicator" :class="{ active: connected }">
              <span class="pulse"></span>
              {{ connected ? "Live" : "Reconnecting..." }}
            </div>
            <div class="last-update" v-if="lastUpdate">
              Updated {{ timeAgo(lastUpdate) }}
            </div>
            <div style="margin-left:auto;display:flex;gap:0.75rem;">
              <button class="chart-btn" @click="addTestJob" :disabled="testLoading">
                <i class="bi bi-plus-circle me-1"></i>
                {{ testLoading ? "Adding..." : "Add Test Job" }}
              </button>
              <button class="chart-btn" @click="clearLogs">
                <i class="bi bi-trash3 me-1"></i>Clear Logs
              </button>
            </div>
          </div>
  
          <!-- ── System cards ── -->
          <div class="stats-grid" style="margin-bottom:1.5rem;">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon green"><i class="bi bi-clock"></i></div>
              </div>
              <div class="stat-title">Uptime</div>
              <div class="stat-value" style="font-size:1.5rem;">{{ system.uptimeHuman || "—" }}</div>
              <div class="stat-footer"><span class="stat-period">Server running time</span></div>
            </div>
  
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon blue"><i class="bi bi-memory"></i></div>
              </div>
              <div class="stat-title">Memory Usage</div>
              <div class="stat-value" style="font-size:1.5rem;">{{ system.memUsedMB || 0 }} MB</div>
              <div class="stat-footer">
                <div class="mini-bar">
                  <div class="mini-fill" :style="{ width: system.memPercent + '%' }" :class="memClass"></div>
                </div>
                <span class="stat-period">{{ system.memPercent || 0 }}% of {{ system.memTotalMB || 0 }} MB</span>
              </div>
            </div>
  
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon amber"><i class="bi bi-cpu"></i></div>
              </div>
              <div class="stat-title">CPU Load (1m avg)</div>
              <div class="stat-value" style="font-size:1.5rem;">{{ system.cpuLoad1 || "0.00" }}</div>
              <div class="stat-footer"><span class="stat-period">{{ system.platform }} • {{ system.nodeVersion }}</span></div>
            </div>
  
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon purple"><i class="bi bi-layers"></i></div>
              </div>
              <div class="stat-title">Total Jobs (all time)</div>
              <div class="stat-value" style="font-size:1.5rem;">
                {{ queues.reduce((s,q) => s + q.total, 0) }}
              </div>
              <div class="stat-footer"><span class="stat-period">Across all queues</span></div>
            </div>
          </div>
  
          <!-- ── Queues + Schedulers row ── -->
          <div class="row g-4" style="margin-bottom:1.5rem;">
  
            <!-- Queues -->
            <div class="col-lg-6">
              <div class="chart-card" style="height:100%;">
                <div class="chart-header">
                  <h3 class="chart-title">
                    <i class="bi bi-stack me-2" style="color:var(--info-color);"></i>Queues
                  </h3>
                  <span class="live-badge">Live</span>
                </div>
  
                <div v-if="!queues.length" class="empty-state">No queues registered</div>
  
                <div v-for="q in queues" :key="q.name" class="queue-card">
                  <div class="queue-header">
                    <div>
                      <div class="queue-name">{{ q.name }}</div>
                      <div class="queue-desc">{{ q.description }}</div>
                    </div>
                    <span class="q-total">{{ q.total }} total</span>
                  </div>
  
                  <!-- Progress breakdown -->
                  <div class="q-bar-track" title="Queue breakdown">
                    <div class="q-bar-seg waiting"   :style="{ flex: q.waiting   || 0 }"></div>
                    <div class="q-bar-seg active"    :style="{ flex: q.active    || 0 }"></div>
                    <div class="q-bar-seg completed" :style="{ flex: q.completed || 0 }"></div>
                    <div class="q-bar-seg failed"    :style="{ flex: q.failed    || 0 }"></div>
                  </div>
  
                  <div class="q-stats">
                    <div class="q-stat waiting">
                      <i class="bi bi-hourglass-split"></i>
                      <span>{{ q.waiting }}</span>
                      <small>Waiting</small>
                    </div>
                    <div class="q-stat active">
                      <i class="bi bi-play-circle-fill"></i>
                      <span>{{ q.active }}</span>
                      <small>Active</small>
                    </div>
                    <div class="q-stat completed">
                      <i class="bi bi-check-circle-fill"></i>
                      <span>{{ q.completed }}</span>
                      <small>Done</small>
                    </div>
                    <div class="q-stat failed">
                      <i class="bi bi-x-circle-fill"></i>
                      <span>{{ q.failed }}</span>
                      <small>Failed</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Schedulers -->
            <div class="col-lg-6">
              <div class="chart-card" style="height:100%;">
                <div class="chart-header">
                  <h3 class="chart-title">
                    <i class="bi bi-calendar-check me-2" style="color:var(--success-color);"></i>Schedulers
                  </h3>
                  <span class="live-badge">Live</span>
                </div>
  
                <div v-if="!schedulers.length" class="empty-state">No schedulers registered</div>
  
                <div v-for="s in schedulers" :key="s.name" class="sched-card">
                  <div class="sched-left">
                    <div class="sched-dot" :class="s.status"></div>
                    <div>
                      <div class="sched-name">{{ s.name }}</div>
                      <div class="sched-desc">{{ s.description }}</div>
                    </div>
                  </div>
  
                  <div class="sched-right">
                    <div class="sched-meta">
                      <i class="bi bi-terminal me-1"></i>
                      <code>{{ s.schedule }}</code>
                    </div>
                    <div class="sched-meta">
                      <i class="bi bi-arrow-repeat me-1"></i>
                      {{ s.runCount }} runs
                    </div>
                  </div>
  
                  <div class="sched-times">
                    <div v-if="s.lastRun" class="sched-time">
                      <span class="t-label">Last:</span>
                      <span>{{ formatTime(s.lastRun) }}</span>
                    </div>
                    <div v-if="s.nextRun" class="sched-time">
                      <span class="t-label">Next:</span>
                      <span>{{ formatTime(s.nextRun) }}</span>
                    </div>
                    <div v-if="s.lastError" class="sched-error">
                      <i class="bi bi-exclamation-triangle me-1"></i>{{ s.lastError }}
                    </div>
                  </div>
  
                  <span class="sched-badge" :class="s.status">{{ s.status }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- ── Activity Log ── -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="bi bi-terminal me-2" style="color:var(--accent-color);"></i>
                Activity Log
              </h3>
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="display:flex;gap:0.4rem;">
                  <button
                    v-for="f in logFilters" :key="f.key"
                    class="log-filter-btn"
                    :class="{ active: logFilter === f.key }"
                    @click="logFilter = f.key"
                  >{{ f.label }}</button>
                </div>
                <button class="chart-btn" @click="clearLogs">
                  <i class="bi bi-trash3 me-1"></i>Clear
                </button>
              </div>
            </div>
  
            <div class="log-terminal">
              <div
                v-for="log in filteredLogs"
                :key="log.id"
                class="log-line"
                :class="log.level"
              >
                <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                <span class="log-badge" :class="log.type">{{ log.type }}</span>
                <span class="log-level" :class="log.level">{{ log.level.toUpperCase() }}</span>
                <span class="log-msg">{{ log.message }}</span>
              </div>
  
              <div v-if="!filteredLogs.length" class="log-empty">
                <i class="bi bi-terminal me-2"></i>No log entries yet...
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
    name: "SystemMonitor",
    components: { AppSidebar, AppHeader },
  
    data() {
      return {
        admin:       {},
        sidebarOpen: false,
        connected:   false,
        lastUpdate:  null,
        testLoading: false,
        eventSource: null,
  
        system:     {},
        queues:     [],
        schedulers: [],
        logs:       [],
  
        logFilter: "all",
        logFilters: [
          { key: "all",       label: "All"       },
          { key: "queue",     label: "Queue"     },
          { key: "scheduler", label: "Scheduler" },
          { key: "system",    label: "System"    },
          { key: "error",     label: "Errors"    },
        ],
      };
    },
  
    computed: {
      memClass() {
        const p = this.system.memPercent || 0;
        if (p > 85) return "danger";
        if (p > 65) return "warning";
        return "good";
      },
      filteredLogs() {
        if (this.logFilter === "all")   return this.logs;
        if (this.logFilter === "error") return this.logs.filter(l => l.level === "error");
        return this.logs.filter(l => l.type === this.logFilter);
      },
    },
  
    async mounted() {
      try {
        const res  = await getDashboard();
        this.admin = res.data;
      } catch { this.$router.push("/"); return; }
  
      // Load initial stats
      await this.loadStats();
  
      // Start SSE stream
      this.startStream();
    },
  
    beforeUnmount() {
      this.stopStream();
    },
  
    methods: {
      async loadStats() {
        try {
          const res        = await api.get("/api/monitor/stats");
          this.system      = res.data.system;
          this.queues      = res.data.queues;
          this.schedulers  = res.data.schedulers;
          this.logs        = res.data.logs;
          this.lastUpdate  = res.data.timestamp;
        } catch (err) { console.error("loadStats:", err); }
      },
  
      startStream() {
        const token = localStorage.getItem("token");
        // Pass token as query param for SSE (headers not supported in EventSource)
        this.eventSource = new EventSource(
          `http://localhost:3000/api/monitor/stream?token=${token}`
        );
  
        this.eventSource.onopen = () => {
          this.connected = true;
        };
  
        this.eventSource.onmessage = (e) => {
          try {
            const data       = JSON.parse(e.data);
            this.system      = { ...this.system, ...data.system };
            this.queues      = data.queues;
            this.schedulers  = data.schedulers;
            this.logs        = data.logs;
            this.lastUpdate  = data.timestamp;
            this.connected   = true;
          } catch { /* ignore parse errors */ }
        };
  
        this.eventSource.onerror = () => {
          this.connected = false;
          this.stopStream();
          // Reconnect after 5s
          setTimeout(() => this.startStream(), 5000);
        };
      },
  
      stopStream() {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      },
  
      async addTestJob() {
        this.testLoading = true;
        try {
          const res = await api.post("/api/monitor/queue/test", { role: null });
          alert(`Test job #${res.data.jobId} added to queue!`);
        } catch { alert("Failed to add test job"); }
        finally { this.testLoading = false; }
      },
  
      async clearLogs() {
        try {
          await api.post("/api/monitor/logs/clear");
          this.logs = [];
        } catch { /* ignore */ }
      },
  
      timeAgo(iso) {
        const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
        if (diff < 5)  return "just now";
        if (diff < 60) return `${diff}s ago`;
        return `${Math.floor(diff / 60)}m ago`;
      },
  
      formatTime(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString([], {
          month: "short", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        });
      },
  
      formatLogTime(iso) {
        return new Date(iso).toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        });
      },
    },
  };
  </script>
  
  <style scoped>
  /* ── Top bar ── */
  .monitor-topbar {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .live-indicator {
    display: flex; align-items: center; gap: 0.5rem;
    font-weight: 600; font-size: 0.875rem;
    color: var(--text-secondary); font-family: 'DM Mono', monospace;
  }
  .live-indicator.active { color: var(--success-color); }
  .pulse {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--text-secondary);
  }
  .live-indicator.active .pulse {
    background: var(--success-color);
    animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.6; }
  }
  .last-update { font-size: 0.8rem; color: var(--text-secondary); font-family: 'DM Mono', monospace; }
  
  /* ── Stat card extras ── */
  .stat-icon.purple { background: rgba(139,92,246,0.15); color: #8B5CF6; }
  .mini-bar   { width: 100%; height: 5px; background: var(--border-color); border-radius: 99px; overflow: hidden; margin-bottom: 4px; }
  .mini-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
  .mini-fill.good    { background: var(--success-color); }
  .mini-fill.warning { background: var(--warning-color); }
  .mini-fill.danger  { background: var(--danger-color); }
  
  /* ── Live badge ── */
  .live-badge {
    font-size: 0.7rem; font-weight: 700; padding: 3px 8px;
    border-radius: 6px; background: rgba(16,185,129,0.15);
    color: var(--success-color); font-family: 'DM Mono', monospace;
    animation: blink 2s ease infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  
  /* ── Queue card ── */
  .queue-card {
    padding: 1.25rem; border-radius: 14px;
    border: 1px solid var(--border-color);
    background: var(--secondary-color);
    margin-bottom: 1rem;
  }
  .queue-card:last-child { margin-bottom: 0; }
  .queue-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .queue-name   { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); font-family: 'DM Mono', monospace; }
  .queue-desc   { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
  .q-total      { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); font-family: 'DM Mono', monospace; }
  
  .q-bar-track  { display: flex; height: 8px; border-radius: 99px; overflow: hidden; margin-bottom: 1rem; background: var(--border-color); gap: 1px; }
  .q-bar-seg    { min-width: 4px; transition: flex 0.5s ease; }
  .q-bar-seg.waiting   { background: var(--warning-color); }
  .q-bar-seg.active    { background: var(--info-color); }
  .q-bar-seg.completed { background: var(--success-color); }
  .q-bar-seg.failed    { background: var(--danger-color); }
  
  .q-stats  { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.5rem; }
  .q-stat   { display: flex; flex-direction: column; align-items: center; padding: 0.5rem; border-radius: 8px; gap: 2px; }
  .q-stat span  { font-size: 1.25rem; font-weight: 700; font-family: 'DM Mono', monospace; }
  .q-stat small { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .q-stat.waiting   { background: rgba(245,158,11,0.1);  color: var(--warning-color);  }
  .q-stat.active    { background: rgba(59,130,246,0.1);  color: var(--info-color);     }
  .q-stat.completed { background: rgba(16,185,129,0.1);  color: var(--success-color);  }
  .q-stat.failed    { background: rgba(239,68,68,0.1);   color: var(--danger-color);   }
  .q-stat i { font-size: 1rem; }
  
  /* ── Scheduler card ── */
  .sched-card {
    display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 12px; border: 1px solid var(--border-color);
    background: var(--secondary-color);
    margin-bottom: 0.75rem; position: relative;
  }
  .sched-card:last-child { margin-bottom: 0; }
  .sched-left  { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 160px; }
  .sched-dot   { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .sched-dot.running { background: var(--success-color); box-shadow: 0 0 0 3px rgba(16,185,129,0.2); animation: pulse 2s infinite; }
  .sched-dot.stopped { background: var(--text-secondary); }
  .sched-dot.error   { background: var(--danger-color); box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
  .sched-name  { font-weight: 700; font-size: 0.9rem; font-family: 'DM Mono', monospace; color: var(--text-primary); }
  .sched-desc  { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .sched-right { display: flex; flex-direction: column; gap: 3px; }
  .sched-meta  { font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: center; }
  .sched-meta code { background: var(--border-color); padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; color: var(--accent-color); }
  .sched-times { display: flex; flex-direction: column; gap: 2px; }
  .sched-time  { font-size: 0.78rem; color: var(--text-secondary); display: flex; gap: 0.35rem; }
  .t-label     { font-weight: 600; color: var(--text-primary); }
  .sched-error { font-size: 0.75rem; color: var(--danger-color); margin-top: 2px; }
  .sched-badge {
    font-size: 0.7rem; font-weight: 700; padding: 3px 10px;
    border-radius: 6px; text-transform: uppercase; font-family: 'DM Mono', monospace;
    margin-left: auto;
  }
  .sched-badge.running { background: rgba(16,185,129,0.15); color: var(--success-color); }
  .sched-badge.stopped { background: rgba(100,116,139,0.15); color: var(--text-secondary); }
  .sched-badge.error   { background: rgba(239,68,68,0.15);  color: var(--danger-color); }
  
  /* ── Log terminal ── */
  .log-terminal {
    background: #0F172A; border-radius: 12px;
    padding: 1rem; min-height: 300px; max-height: 420px;
    overflow-y: auto; font-family: 'DM Mono', monospace;
    display: flex; flex-direction: column; gap: 2px;
  }
  .log-line  { display: flex; align-items: baseline; gap: 0.6rem; font-size: 0.78rem; padding: 3px 4px; border-radius: 4px; transition: background 0.1s; }
  .log-line:hover { background: rgba(255,255,255,0.04); }
  .log-line.error   { background: rgba(239,68,68,0.08); }
  .log-line.warning { background: rgba(245,158,11,0.06); }
  .log-time  { color: #475569; flex-shrink: 0; font-size: 0.72rem; }
  .log-badge { font-size: 0.68rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; flex-shrink: 0; }
  .log-badge.queue     { background: rgba(59,130,246,0.2);  color: #93C5FD; }
  .log-badge.scheduler { background: rgba(16,185,129,0.2);  color: #6EE7B7; }
  .log-badge.system    { background: rgba(139,92,246,0.2);  color: #C4B5FD; }
  .log-level { font-size: 0.68rem; font-weight: 700; flex-shrink: 0; }
  .log-level.success { color: #6EE7B7; }
  .log-level.info    { color: #93C5FD; }
  .log-level.warning { color: #FCD34D; }
  .log-level.error   { color: #FCA5A5; }
  .log-msg   { color: #CBD5E1; word-break: break-word; }
  .log-empty { color: #475569; text-align: center; padding: 2rem; margin: auto; }
  
  /* ── Log filter buttons ── */
  .log-filter-btn {
    padding: 4px 10px; border: 1px solid var(--border-color);
    background: transparent; border-radius: 6px; font-size: 0.78rem;
    cursor: pointer; color: var(--text-secondary); transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .log-filter-btn:hover, .log-filter-btn.active {
    background: var(--accent-color); color: #fff; border-color: var(--accent-color);
  }
  
  /* ── Empty state ── */
  .empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
  </style>