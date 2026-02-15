const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/polls',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(JSON.stringify({
  question: 'Test Poll?',
  options: ['Option 1', 'Option 2']
}));
req.end();
