<!-- ═══ components/chat/ChatSidebar.vue ═════════════════════════════════════ -->
<template>
    <aside class="chat-sidebar">
      <section class="cs-section">
        <h6 class="cs-title">Users</h6>
        <template v-if="users.length">
          <div v-for="u in users" :key="u.id" class="cs-item" @click="$emit('startChat', u)">
            <div class="cs-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
            <span class="cs-name">{{ u.name }}</span>
          </div>
        </template>
        <p v-else class="cs-empty">No users found</p>
      </section>
  
      <section class="cs-section">
        <h6 class="cs-title">Chats</h6>
        <template v-if="chats.length">
          <div
            v-for="c in chats" :key="c.id"
            class="cs-item"
            :class="{ active: c.id === activeChat?.id }"
            @click="$emit('selectChat', c)"
          >
            <div class="cs-avatar chat">💬</div>
            <span class="cs-name">Chat #{{ c.id }}</span>
          </div>
        </template>
        <p v-else class="cs-empty">No chats yet</p>
      </section>
    </aside>
  </template>
  
  <script>
  export default {
    name: "ChatSidebar",
    props: {
      users:      { type: Array,  default: () => [] },
      chats:      { type: Array,  default: () => [] },
      activeChat: { type: Object, default: null },
    },
    emits: ["startChat", "selectChat"],
  };
  </script>
  
  <style scoped>
  .chat-sidebar { width: 280px; height: 100%; background: #fff; border-right: 1px solid var(--border-color); overflow-y: auto; flex-shrink: 0; }
  .cs-section   { padding: 12px 0; }
  .cs-title     { padding: 8px 16px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
  .cs-item      { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.2s; }
  .cs-item:hover { background: var(--secondary-color); }
  .cs-item.active { background: rgba(245,158,11,0.1); }
  .cs-avatar    { width: 34px; height: 34px; border-radius: 50%; background: var(--accent-color); color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cs-avatar.chat { background: #10b981; }
  .cs-name      { font-size: 14px; color: var(--text-primary); font-weight: 500; }
  .cs-empty     { padding: 8px 16px; font-size: 13px; color: var(--text-secondary); }
  </style>
  