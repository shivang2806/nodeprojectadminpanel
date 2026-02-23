<!-- ═══ views/Chat.vue ══════════════════════════════════════════════════════ -->
<template>
  <div class="" style="height:100vh;overflow:hidden;">
    <AppSidebar :isOpen="sidebarOpen" />

    <div class="main-content flex-column">
      <AppHeader :user="currentUser" title="Chat" @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <div style="display:flex;flex:1;overflow:hidden;position:relative;height:700px;">
        <!-- Chat Sidebar -->
        <ChatSidebar
          :users="users"
          :chats="chats"
          :activeChat="activeChat"
          @startChat="onStartChat"
          @selectChat="onSelectChat"
        />

        <!-- Chat Area -->
        <div style="flex:1;display:flex;flex-direction:column;position:relative;">
          <div v-if="!activeChat" style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">
            <div style="text-align:center;">
              <i class="bi bi-chat-dots" style="font-size:3rem;display:block;margin-bottom:1rem;"></i>
              <p>Select a user or chat to start messaging</p>
            </div>
          </div>

          <template v-else>
            <div style="padding:1rem 1.5rem;border-bottom:1px solid var(--border-color);background:#fff;font-weight:600;">
              Chat #{{ activeChat.id }}
            </div>
            <ChatWindow :messages="messages" :userId="currentUser.id" />
            <ChatInput @send="sendMessage" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppSidebar  from "../components/AppSidebar.vue";
import AppHeader   from "../components/AppHeader.vue";
import ChatSidebar from "../components/chat/ChatSidebar.vue";
import ChatWindow  from "../components/chat/ChatWindow.vue";
import ChatInput   from "../components/chat/ChatInput.vue";
import { getDashboard } from "../api/userApi";
import { getChats, getMessages, startChat } from "../api/chatApi";
import socket from "../socket/socket";

export default {
  name: "Chat",
  components: { AppSidebar, AppHeader, ChatSidebar, ChatWindow, ChatInput },
  data() {
    return { currentUser: {}, users: [], chats: [], messages: [], activeChat: null, sidebarOpen: false };
  },
  async mounted() {
    try {
      const [dashRes, chatsRes] = await Promise.all([getDashboard(), getChats()]);
      this.currentUser = dashRes.data;
      this.chats = chatsRes.data;
    } catch { this.$router.push("/"); }

    socket.on("receive_message", (msg) => {
      if (this.activeChat && msg.chat_id === this.activeChat.id) {
        this.messages.push(msg);
      }
    });
  },
  beforeUnmount() { socket.off("receive_message"); },
  methods: {
    async onStartChat(user) {
      try {
        const res = await startChat(user.id);
        this.activeChat = res.data;
        this.messages = [];
        socket.emit("join_chat", this.activeChat.id);
        const msgRes = await getMessages(this.activeChat.id);
        this.messages = msgRes.data;
        const chatsRes = await getChats();
        this.chats = chatsRes.data;
      } catch (err) { console.error(err); }
    },
    async onSelectChat(chat) {
      this.activeChat = chat;
      this.messages = [];
      socket.emit("join_chat", chat.id);
      const res = await getMessages(chat.id);
      this.messages = res.data;
    },
    sendMessage(text) {
      if (!this.activeChat) return;
      socket.emit("send_message", { chatId: this.activeChat.id, message: text });
    },
  },
};
</script>
