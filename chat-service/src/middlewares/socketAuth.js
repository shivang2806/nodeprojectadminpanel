io.use((socket, next) => {
    console.log("🔑 Socket token:", socket.handshake.auth.token);
    next();
  });
  