const fs = require('fs');
let raw = fs.readFileSync('test-results.json');
if (raw[0] === 0xff && raw[1] === 0xfe) {
  raw = Buffer.from(raw.buffer, raw.byteOffset + 2, raw.length - 2).toString('utf16le');
} else {
  raw = raw.toString('utf8');
}
try {
  let firstBrace = raw.indexOf('{');
  if(firstBrace !== -1) raw = raw.substring(firstBrace);
  const data = JSON.parse(raw);
  const failed = data.testResults.filter(r => r.status === 'failed');
  failed.forEach(suite => {
    console.log('\n================================');
    console.log('FAILING SUITE:', suite.name);
    suite.assertionResults.filter(a => a.status === 'failed').forEach(test => {
      console.log('  TEST:', test.title);
      test.failureMessages.forEach(msg => {
        const lines = msg.split('\n');
        console.log('    ERR:', lines[0]);
        if(lines[1]) console.log('         ', lines[1]);
      });
    });
  });
} catch(e) {
  console.log('Error parsing JSON:', e.message);
  console.log('Snippet:', raw.substring(0, 500));
}
