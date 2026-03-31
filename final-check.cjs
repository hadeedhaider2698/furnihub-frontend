const fs = require('fs');
let buffer = fs.readFileSync('test-results-final-utf8.json');
let raw = buffer.toString('utf8');
try {
  let firstBrace = raw.indexOf('{');
  if(firstBrace !== -1) raw = raw.substring(firstBrace);
  const data = JSON.parse(raw);
  const failed = data.testResults.filter(r => r.status === 'failed');
  if(failed.length === 0) {
    console.log('ALL FRONTEND UNIT TESTS PASSED! PRODUCTION READY.');
  } else {
    console.log('FAILED SUITES:', failed.length);
    failed.forEach(s => {
      console.log('\nSUITE:', s.name);
      s.assertionResults.filter(a => a.status === 'failed').forEach(t => {
        console.log('  TEST:', t.title, '-', (t.failureMessages[0] || '').split('\n')[0]);
      });
    });
    process.exit(1);
  }
} catch(e) {
  console.log('Error parsing JSON:', e.message);
  process.exit(1);
}
