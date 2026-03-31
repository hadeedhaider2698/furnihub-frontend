const fs = require('fs');
try {
  let raw = fs.readFileSync('test-results-fixed.json', 'utf8');
  let firstBrace = raw.indexOf('{');
  if(firstBrace === -1) {
    console.log('No JSON found in file');
    process.exit(1);
  }
  raw = raw.substring(firstBrace);
  const data = JSON.parse(raw);
  const failed = data.testResults.filter(r => r.status === 'failed');
  if(failed.length === 0) {
    console.log('ALL FRONTEND UNIT TESTS PASSED!');
  } else {
    console.log(`FOUND ${failed.length} FAILING SUITES:`);
    failed.forEach(suite => {
      console.log('\nFAIL:', suite.name);
      suite.assertionResults.filter(a => a.status === 'failed').forEach(test => {
        console.log('  TEST:', test.title);
        if(test.failureMessages && test.failureMessages.length > 0) {
          console.log('    ERR:', test.failureMessages[0].split('\n')[0]);
        }
      });
    });
  }
} catch(e) {
  console.log('Error parsing JSON:', e.message);
}
