module.exports = {
  apps: [
    {
      name: 'poseidon-backend',
      script: 'server.js',
      cwd: '/home/poseidonadm/backend',
      env: {
        NODE_ENV: 'production',
        NODE_PATH: '/home/poseidonadm/backend/node_modules'
      }
    }
  ]
};
