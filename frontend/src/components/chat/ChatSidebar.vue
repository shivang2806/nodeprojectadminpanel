<!-- ═══════════════════════════════════════════════════════════════════════
     components/chat/ChatSidebar.vue  (updated: shows partner name in list)
     ═══════════════════════════════════════════════════════════════════════ -->
     <template>
      <aside class="chat-sidebar">
    
        <!-- Users to start a new chat -->
        <section class="cs-section">
          <h6 class="cs-title">New Chat</h6>
          <template v-if="users.length">
            <div
              v-for="u in users"
              :key="'u' + u.id"
              class="cs-item"
              @click="$emit('startChat', u)"
            >
              <div class="cs-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
              <span class="cs-name">{{ u.name }}</span>
            </div>
          </template>
          <p v-else class="cs-empty">No users available</p>
        </section>
    
        <div class="cs-divider"></div>
    
        <!-- Existing chats -->
        <section class="cs-section">
          <h6 class="cs-title">Conversations</h6>
          <template v-if="chats.length">
            <div
              v-for="c in chats"
              :key="'c' + c.id"
              class="cs-item"
              :class="{ active: c.id === activeChat?.id }"
              @click="$emit('selectChat', c)"
            >
              <div class="cs-avatar chat">
                {{ partnerName(c).charAt(0).toUpperCase() }}
              </div>
              <div style="min-width:0;">
                <div class="cs-name">{{ partnerName(c) }}</div>
                <div class="cs-sub">Chat #{{ c.id }}</div>
              </div>
            </div>
          </template>
          <p v-else class="cs-empty">No conversations yet</p>
        </section>
    
      </aside>
    </template>
    
    <script>
    export default {
      name: "ChatSidebar",
      props: {
        users:         { type: Array,  default: () => [] },
        chats:         { type: Array,  default: () => [] },
        activeChat:    { type: Object, default: null },
        currentUserId: { type: Number, default: null },
      },
      emits: ["startChat", "selectChat"],
      methods: {
        partnerName(chat) {
          if (!this.currentUserId) return `Chat #${chat.id}`;
          return chat.user1_id === this.currentUserId
            ? (chat.user2_name || `User ${chat.user2_id}`)
            : (chat.user1_name || `User ${chat.user1_id}`);
        },
      },
    };
    </script>
    
    <style scoped>
    .chat-sidebar {
      width: 280px; height: 100%;
      background: #fff;
      border-right: 1px solid var(--border-color);
      overflow-y: auto; flex-shrink: 0;
      display: flex; flex-direction: column;
    }
    .cs-section   { padding: 8px 0; }
    .cs-title     { padding: 10px 16px 6px; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
    .cs-divider   { height: 1px; background: var(--border-color); margin: 4px 0; }
    .cs-item      { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.2s; }
    .cs-item:hover  { background: var(--secondary-color); }
    .cs-item.active { background: rgba(245,158,11,0.1); border-right: 3px solid var(--accent-color); }
    .cs-avatar    { width: 38px; height: 38px; border-radius: 50%; background: var(--accent-color); color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cs-avatar.chat { background: #10b981; }
    .cs-name      { font-size: 14px; color: var(--text-primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cs-sub       { font-size: 11px; color: var(--text-secondary); font-family: 'DM Mono', monospace; }
    .cs-empty     { padding: 8px 16px; font-size: 13px; color: var(--text-secondary); }
    </style>