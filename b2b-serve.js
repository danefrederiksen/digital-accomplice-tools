const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3851;
const FILE = path.join(__dirname, 'b2b-outreach.html');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(FILE));
}).listen(PORT, () => console.log(`B2B Outreach running at http://localhost:${PORT}`));
