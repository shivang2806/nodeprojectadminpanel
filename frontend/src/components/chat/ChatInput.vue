<!-- ═══ components/chat/ChatInput.vue ═══════════════════════════════════════ -->
<template>
    <div class="ci-wrap">
      <input v-model="text" placeholder="Type a message" @keyup.enter="submit" />
      <button @click="submit" class="chart-btn active" style="border-radius:20px;padding:0 1.5rem;">Send</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "ChatInput",
    emits: ["send"],
    data() { return { text: "" }; },
    methods: {
      submit() {
        if (!this.text.trim()) return;
        this.$emit("send", this.text);
        this.text = "";
      },
    },
  };
  </script>
  
  <style scoped>
  .ci-wrap { display: flex; padding: 10px; background: #fff; border-top: 1px solid var(--border-color); gap: 10px; }
  .ci-wrap input { flex: 1; padding: 10px 16px; border-radius: 20px; border: 1px solid var(--border-color); font-family: 'Outfit', sans-serif; outline: none; }
  .ci-wrap input:focus { border-color: var(--accent-color); }
  </style>