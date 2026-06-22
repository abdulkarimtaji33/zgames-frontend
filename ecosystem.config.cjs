module.exports = {
  apps: [
    {
      name: 'zgames-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5556',
      cwd: '/var/www/zgames-frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5556,
      },
    },
  ],
};
