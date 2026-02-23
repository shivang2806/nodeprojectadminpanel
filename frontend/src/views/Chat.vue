<template>
  <div class="" style="height:100vh;overflow:hidden;">
    <AppSidebar :isOpen="sidebarOpen" />

    <div class="main-content d-flex flex-column">
      <AppHeader
        :user="currentUser"
        title="Chat"
        @toggleSidebar="sidebarOpen = !sidebarOpen"
      />

      <div style="display:flex;flex:1;overflow:hidden;">
        <ChatSidebar
          :users="users"
          :chats="chats"
          :activeChat="activeChat"
          :currentUserId="currentUser.id"
          @startChat="onStartChat"
          @selectChat="onSelectChat"
        />

        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <div v-if="!activeChat" class="chat-empty">
            <i class="bi bi-chat-dots"></i>
            <p>Select a user or conversation to start chatting</p>
          </div>

          <template v-else>
            <div class="chat-topbar">
              <div class="cs-avatar" style="width:36px;height:36px;font-size:14px;border-radius:50%;background:var(--accent-color);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
                {{ chatPartnerName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div style="font-weight:600;font-size:0.95rem;">{{ chatPartnerName }}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);">Chat #{{ activeChat.id }}</div>
              </div>
            </div>

            <ChatWindow
              :messages="messages"
              :currentUserId="currentUser.id"
            />

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
import { getDashboard, getChatUsers } from "../api/userApi";
import { getChats, getMessages, startChat } from "../api/chatApi";
import { getSocket } from "../socket/socket";   // ← getSocket(), not default import

export default {
  name: "ChatView",
  components: { AppSidebar, AppHeader, ChatSidebar, ChatWindow, ChatInput },

  data() {
    return {
      currentUser: {
        id:   Number(localStorage.getItem("user_id")),  // immediately from localStorage
        name: "",
        role: localStorage.getItem("role") || "",
      },
      users:       [],
      chats:       [],
      messages:    [],
      activeChat:  null,
      sidebarOpen: false,
    };
  },

  computed: {
    chatPartnerName() {
      if (!this.activeChat) return "";
      const myId = this.currentUser.id;
      return Number(this.activeChat.user1_id) === myId
        ? (this.activeChat.user2_name || `User ${this.activeChat.user2_id}`)
        : (this.activeChat.user1_name || `User ${this.activeChat.user1_id}`);
    },
  },

  async mounted() {
    try {
      const [dashRes, usersRes, chatsRes] = await Promise.all([
        getDashboard(),
        getChatUsers(),
        getChats(),
      ]);

      this.currentUser = {
        ...dashRes.data,
        id: Number(dashRes.data.id),
      };
      localStorage.setItem("user_id", String(this.currentUser.id));

      this.users = usersRes.data;
      this.chats = chatsRes.data;
    } catch {
      this.$router.push("/");
      return;
    }

    // Get the already-connected socket (connected at login)
    const socket = getSocket();
    if (socket) {
      socket.on("receive_message", (msg) => {
        if (this.activeChat && Number(msg.chat_id) === Number(this.activeChat.id)) {
          this.messages.push({
            ...msg,
            sender_id: Number(msg.sender_id),
          });
          this.$nextTick(() => this.scrollToBottom());
        }
      });
    }
  },

  beforeUnmount() {
    const socket = getSocket();
    if (socket) socket.off("receive_message");
  },

  methods: {
    async onStartChat(user) {
      try {
        const res = await startChat(user.id);
        this.activeChat = res.data;
        await this.loadMessages();
        await this.refreshChats();
      } catch (err) {
        console.error(err);
      }
    },

    async onSelectChat(chat) {
      this.activeChat = chat;
      await this.loadMessages();
    },

    async loadMessages() {
      this.messages = [];
      const socket = getSocket();
      if (socket) socket.emit("join_chat", this.activeChat.id);
      const res = await getMessages(this.activeChat.id);
      this.messages = res.data.map(m => ({
        ...m,
        sender_id: Number(m.sender_id),
      }));
      this.$nextTick(() => this.scrollToBottom());
    },

    async refreshChats() {
      const res = await getChats();
      this.chats = res.data;
    },

    sendMessage(text) {
      if (!this.activeChat) return;
      const socket = getSocket();
      if (socket) socket.emit("send_message", {
        chatId:  this.activeChat.id,
        message: text,
      });
    },

    scrollToBottom() {
      const el = this.$el.querySelector(".cw-window");
      if (el) el.scrollTop = el.scrollHeight;
    },
  },
};
</script>

<style scoped>
.chat-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: var(--text-secondary); gap: 1rem;
}
.chat-empty i { font-size: 3.5rem; opacity: 0.4; }
.chat-topbar {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: #fff; box-shadow: var(--shadow-sm);
}
</style>