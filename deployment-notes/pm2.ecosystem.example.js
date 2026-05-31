module.exports = {
  apps: [
    {
      name: 'game-apis',
      cwd: '/var/www/html/Bigslick_Game_Backend',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 3050,
      },
    },
  ],
};
