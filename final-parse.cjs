const fs = require('fs');
const raw = fs.readFileSync('test-results-final.json', 'utf8');
const searchString = '{\"numTotalTestSuites\":';
const firstBrace = raw.indexOf(searchString);
if (firstBrace === -1) {
    console.log('No JSON data found');
    process.exit(1);
}
const jsonPart = raw.substring(firstBrace);
try {
    const data = JSON.parse(jsonPart);
    const failed = data.testResults.filter(r => r.status === 'failed');
    if (failed.length === 0) {
        console.log('ALL TESTS PASSED! SITE IS PRODUCTION READY.');
    } else {
        console.log('FAILED SUITES:', failed.length);
        failed.forEach(s => {
          console.log('\nSUITE:', s.name);
          s.assertionResults.filter(a => a.status === 'failed').forEach(t => {
            console.log('  TEST:', t.title, '-', (t.failureMessages[0] || '').split('\n')[0]);
          });
        });
    }
} catch (e) {
    console.log('ERR:', e.message);
}
