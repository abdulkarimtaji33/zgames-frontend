module.exports = {
  apps: [
    {
      name: 'cgagames-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5555',
      cwd: '/var/www/cgagames-frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5555,
      },
    },
  ],
};
