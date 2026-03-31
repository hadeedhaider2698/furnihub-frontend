const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx vitest run --reporter=json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  fs.writeFileSync('clean-results.json', output);
} catch (error) {
  // vitest exits with 1 if tests fail, which throws here
  fs.writeFileSync('clean-results.json', error.stdout);
}
