const fs = require('fs');
let buffer = fs.readFileSync('test-results-fixed.json');
let raw;
if (buffer[0] === 0xff && buffer[1] === 0xfe) {
  raw = buffer.toString('utf16le');
} else {
  raw = buffer.toString('utf8');
}
try {
  let firstBrace = raw.indexOf('{');
  if(firstBrace !== -1) raw = raw.substring(firstBrace);
  const data = JSON.parse(raw);
  const failed = data.testResults.filter(r => r.status === 'failed');
  if(failed.length === 0) {
    console.log('ALL FRONTEND UNIT TESTS PASSED!');
  } else {
    failed.forEach(suite => {
      console.log('\nFAIL:', suite.name);
      suite.assertionResults.filter(a => a.status === 'failed').forEach(test => {
        console.log('  TEST:', test.title, '-', (test.failureMessages[0] || '').split('\n')[0]);
      });
    });
  }
} catch(e) {
  console.log('Error parsing JSON:', e.message);
}
