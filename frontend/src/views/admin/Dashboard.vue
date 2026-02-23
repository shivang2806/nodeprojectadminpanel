<template>
    <div class="">
      <AppSidebar :isOpen="sidebarOpen" />
  
      <div class="main-content">
        <AppHeader
          :user="user"
          title="Dashboard Overview"
          searchPlaceholder="Search customers, deals..."
          @toggleSidebar="sidebarOpen = !sidebarOpen"
        />
  
        <div class="dashboard-content">
          <div class="stats-grid">
            <StatCard title="Total Customers" value="2,847" icon="bi bi-people"       color="blue"  change="12.5%" changeDir="up" />
            <StatCard title="Revenue"         value="$94.2K" icon="bi bi-currency-dollar" color="green" change="8.3%"  changeDir="up" />
            <StatCard title="Active Deals"    value="142"    icon="bi bi-cart-check"   color="amber" change="3.1%"  changeDir="down" />
            <StatCard title="Conversion Rate" value="68.4%"  icon="bi bi-graph-up"     color="red"   change="5.2%"  changeDir="up" />
          </div>
  
          <!-- Charts row -->
          <div class="row">
            <div class="col-lg-8 mb-4">
              <div class="chart-card">
                <div class="chart-header">
                  <h3 class="chart-title">Sales Performance</h3>
                  <div class="chart-actions">
                    <button class="chart-btn" :class="{ active: period === 'week' }"  @click="period = 'week'">Week</button>
                    <button class="chart-btn" :class="{ active: period === 'month' }" @click="period = 'month'">Month</button>
                    <button class="chart-btn" :class="{ active: period === 'year' }"  @click="period = 'year'">Year</button>
                  </div>
                </div>
                <div class="chart-placeholder">
                  <i class="bi bi-graph-up"></i>
                  <p>Sales chart visualization</p>
                  <small>Integrate Chart.js or Recharts</small>
                </div>
              </div>
            </div>
            <div class="col-lg-4 mb-4">
              <div class="chart-card">
                <div class="chart-header">
                  <h3 class="chart-title">Deal Distribution</h3>
                </div>
                <div class="chart-placeholder">
                  <i class="bi bi-pie-chart"></i>
                  <p>Distribution by category</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Recent transactions -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Recent Transactions</h3>
              <button class="chart-btn" @click="$router.push('/admin/users')">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table activity-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Deal Value</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in transactions" :key="tx.id">
                    <td>
                      <div class="customer-info">
                        <div class="customer-avatar">{{ tx.initials }}</div>
                        <div class="customer-details">
                          <h6>{{ tx.name }}</h6>
                          <p>{{ tx.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="deal-value">{{ tx.value }}</td>
                    <td><span class="status-badge" :class="tx.status.toLowerCase()">{{ tx.status }}</span></td>
                    <td class="date-cell">{{ tx.date }}</td>
                    <td>
                      <div class="header-icon-btn" style="width:36px;height:36px;">
                        <i class="bi bi-three-dots-vertical"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppSidebar from "../../components/AppSidebar.vue";
  import AppHeader  from "../../components/AppHeader.vue";
  import StatCard   from "../../components/StatCard.vue";
  import { getDashboard } from "../../api/userApi";
  
  export default {
    name: "AdminDashboard",
    components: { AppSidebar, AppHeader, StatCard },
    data() {
      return {
        user: {},
        sidebarOpen: false,
        period: "month",
        transactions: [
          { id: 1, initials: "AM", name: "Alice Martinez",    email: "alice@techcorp.com",   value: "$12,450", status: "Completed", date: "Jan 25, 2026" },
          { id: 2, initials: "BS", name: "Brian Smith",       email: "brian@startup.io",     value: "$8,900",  status: "Pending",   date: "Jan 24, 2026" },
          { id: 3, initials: "CJ", name: "Catherine Johnson", email: "cj@enterprise.com",    value: "$24,000", status: "Completed", date: "Jan 23, 2026" },
          { id: 4, initials: "DW", name: "David Wilson",      email: "david@innovations.net",value: "$5,600",  status: "Cancelled", date: "Jan 22, 2026" },
          { id: 5, initials: "EB", name: "Emma Brown",        email: "emma@creative.studio", value: "$16,300", status: "Pending",   date: "Jan 21, 2026" },
        ],
      };
    },
    async mounted() {
      try {
        const res = await getDashboard();
        this.user = res.data;
      } catch { this.$router.push("/"); }
    },
  };
  </script>
  
  <style scoped>
  .chart-placeholder {
    height: 300px; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--secondary-color); border-radius: 12px;
    border: 1px dashed var(--border-color); color: var(--text-secondary);
    gap: 0.5rem;
  }
  .chart-placeholder i { font-size: 3rem; }
  .chart-placeholder small { font-family: 'DM Mono', monospace; }
  </style>