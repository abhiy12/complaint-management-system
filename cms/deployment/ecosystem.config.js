// PM2 process file for bare-metal / VM deployment (non-Docker path)
module.exports = {
  apps: [
    {
      name: 'cms-api',
      cwd: '../backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '400M',
      out_file: '../backend/logs/pm2-out.log',
      error_file: '../backend/logs/pm2-error.log'
    }
  ]
};
