<!-- ═══ components/chat/ChatWindow.vue ══════════════════════════════════════ -->
<template>
    <div class="cw-window">
      <div v-for="msg in messages" :key="msg.id" :class="['cw-row', msg.sender_id === userId ? 'right' : 'left']">
        <div class="cw-bubble">{{ msg.message }}</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ChatWindow",
    props: {
      messages: { type: Array,  required: true },
      userId:   { type: Number, required: true },
    },
  };
  </script>
  
  <style scoped>
  .cw-window  { flex: 1; padding: 16px; overflow-y: auto; background: #e5ddd5; display: flex; flex-direction: column; }
  .cw-row     { display: flex; margin-bottom: 8px; }
  .left       { justify-content: flex-start; }
  .right      { justify-content: flex-end; }
  .cw-bubble  { max-width: 65%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }
  .left  .cw-bubble { background: #fff; border-top-left-radius: 0; }
  .right .cw-bubble { background: #dcf8c6; border-top-right-radius: 0; }
  </style>
  