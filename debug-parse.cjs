const fs = require('fs');
const buffer = fs.readFileSync('test-results-final-utf8.json');
const raw = buffer.toString('utf8');
const firstBrace = raw.indexOf('{');
if (firstBrace === -1) {
    console.log('No JSON found');
    process.exit(1);
}
const jsonPart = raw.substring(firstBrace);
console.log('JSON START:', jsonPart.substring(0, 100).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
try {
    const data = JSON.parse(jsonPart);
    const failed = data.testResults.filter(r => r.status === 'failed');
    if (failed.length === 0) {
        console.log('ALL TESTS PASSED');
    } else {
        console.log('FAILED:', failed.length);
        failed.forEach(s => console.log('SUITE:', s.name));
    }
} catch (e) {
    console.log('ERR:', e.message);
}
