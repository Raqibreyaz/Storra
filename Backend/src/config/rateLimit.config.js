export const RATE_LIMIT_PRESETS = {
  // Reads — generous limit
  READ: {
    limit: parseInt(process.env.READ_RATE_LIMIT || 150),
    windowMin: parseInt(process.env.READ_RATE_LIMIT_WINDOW || 15),
    identifyBy: "user",
  },

  // Creates — high limit to allow for bulk uploads
  WRITE: {
    limit: 100, // Increased from 20 to allow for bulk folder uploads
    windowMin: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW || 15),
    identifyBy: "user",
  },

  // Mutations — high limit for bulk rename/delete
  MUTATE: {
    limit: 100, // Increased from 40 for better UX during bulk actions
    windowMin: parseInt(process.env.MUTATE_RATE_LIMIT_WINDOW || 15),
    identifyBy: "user",
  },

  // Auth — register, login (after OTP)
  AUTH: {
    limit: parseInt(process.env.AUTH_RATE_LIMIT || 10),
    windowMin: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || 15),
    identifyBy: "ip",
  },

  // 3rd-party OAuth — Google / GitHub login
  OAUTH: { 
    limit: 10, 
    windowMin: 15, 
    identifyBy: "ip" 
  },

  // OTP sending — strictly limited per IP
  OTP: {
    limit: parseInt(process.env.OTP_RATE_LIMIT || 5),
    windowMin: parseInt(process.env.OTP_RATE_LIMIT_WINDOW || 15),
    identifyBy: "ip",
  },

  // Sensitive admin ops
  ADMIN: {
    limit: parseInt(process.env.ADMIN_RATE_LIMIT || 20),
    windowMin: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW || 15),
    identifyBy: "user",
  },

  // Logout
  LOGOUT: { limit: 10, windowMin: 15, identifyBy: "user" },
  LOGOUT_ALL: { limit: 5, windowMin: 15, identifyBy: "user" },
};
