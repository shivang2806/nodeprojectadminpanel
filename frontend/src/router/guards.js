// ─── router/guards.js ─────────────────────────────────────────────────────────
export const roleGuard = (allowedRoles) => (to, from, next) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token || !allowedRoles.includes(role)) return next("/");
  next();
};
