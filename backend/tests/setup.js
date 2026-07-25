const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Setting up database schema for tests...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to setup database for tests:', error.message);
  }
};
