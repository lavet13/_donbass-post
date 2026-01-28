module.exports = {
  apps: [
    {
      name: "telegram-bot",
      script: "./dist/server.cjs",
      instances: 1,
      exec_mode: "fork",

      // Environment
      env_production: {
        NODE_ENV: "production",
      },

      // Auto-restart settings
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: "30s",

      // Logging
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Advanced features
      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Optional but recommended for bots
      autorestart: true, // restart on crash (default true, but explicit)
      cron_restart: "", // if you ever want scheduled restart (e.g. '0 4 * * *')
    },
  ],
};
