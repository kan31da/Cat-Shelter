import http from 'http';

import fs from 'fs/promises';

const server = http.createServer(async (req, res) => {

    if (req.url === '/content/styles/site.css') {
        const cssFile = await fs.readFile('./src/content/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssFile);
        return res.end();
    }

    const homePage = await fs.readFile('./src/views/home/index.html', 'utf-8');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(homePage);
    res.end();
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});