
<!-- ════════════════════════════════════════════════════════
     components/chat/ChatWindow.vue
     isMine uses strict Number comparison
     ════════════════════════════════════════════════════════ -->
     <template>
      <div class="cw-window" ref="window">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="cw-row"
          :class="isMine(msg) ? 'right' : 'left'"
        >
          <div v-if="!isMine(msg)" class="cw-sender-label">
            {{ msg.sender_name || `User ${msg.sender_id}` }}
          </div>
    
          <div class="cw-bubble" :class="isMine(msg) ? 'bubble-mine' : 'bubble-theirs'">
            <span class="cw-text">{{ msg.message }}</span>
            <span class="cw-time">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>
    
        <div v-if="messages.length === 0" class="cw-no-messages">
          <i class="bi bi-chat-square-dots"></i>
          <p>No messages yet. Say hello! 👋</p>
        </div>
      </div>
    </template>
    
    <script>
    export default {
      name: "ChatWindow",
      props: {
        messages:      { type: Array,           required: true },
        currentUserId: { type: [Number, String], required: true },
      },
      methods: {
        isMine(msg) {
          // Both normalized to Number before comparison
          return Number(msg.sender_id) === Number(this.currentUserId);
        },
        formatTime(ts) {
          if (!ts) return "";
          return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        },
      },
    };
    </script>
    
    <style scoped>
    .cw-window {
      flex: 1; padding: 1rem 1.25rem;
      overflow-y: auto; background: #e5ddd5;
      display: flex; flex-direction: column; gap: 6px;
    }
    .cw-row { display: flex; flex-direction: column; max-width: 68%; gap: 2px; }
    .cw-row.left  { align-self: flex-start; align-items: flex-start; }
    .cw-row.right { align-self: flex-end;   align-items: flex-end; }
    .cw-sender-label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); padding: 0 6px; }
    .cw-bubble { display: flex; align-items: flex-end; gap: 8px; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; word-break: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
    .bubble-theirs { background: #ffffff; border-top-left-radius: 2px; color: #111; }
    .bubble-mine   { background: #dcf8c6; border-top-right-radius: 2px; color: #111; }
    .cw-text { flex: 1; }
    .cw-time { font-size: 0.65rem; color: #8696a0; white-space: nowrap; align-self: flex-end; }
    .cw-no-messages { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8696a0; gap: 0.5rem; }
    .cw-no-messages i { font-size: 2.5rem; opacity: 0.5; }
    .cw-no-messages p { font-size: 0.9rem; }
    </style>