const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './tests/setup.js',
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test_jwt_secret_12345',
    },
  },
});
