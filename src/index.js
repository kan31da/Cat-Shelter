import http from 'http';

import fs from 'fs/promises';
import cats from './cats.js';
import { addBreed, getBreeds } from './breedsService.js';
import { log } from 'console';

const server = http.createServer(async (req, res) => {

    if (req.url === '/content/styles/site.css') {
        const cssFile = await fs.readFile('./src/content/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssFile);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            const formData = new URLSearchParams(body);
            const breedName = formData.get('breed');
            addBreed(breedName);
        });

        return res.writeHead(302, { 'Location': '/' }).end();
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    let htmlContent = '';

    switch (req.url) {

        case '/':
            htmlContent = await renderHomePage();
            break;

        case '/cats/add-cat':
            htmlContent = await fs.readFile('./src/views/addCat.html', 'utf-8');
            break;

        case '/cats/add-breed':
            htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf-8');
            break;

        default:
            htmlContent = await fs.readFile('./src/views/404.html', 'utf-8');
            break;
    }

    res.write(htmlContent);
    return res.end();
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});

async function renderHomePage() {
    const htmlContent = await fs.readFile('./src/views/home/index.html', 'utf-8');

    // const catsHtml = cats.map(cat => `
    //     <li>
    //         <img src="${cat.imageUrl}" alt="${cat.name}">
    //         <h3>${cat.name}</h3>
    //         <p><span>Price: </span>${cat.price}$</p>
    //         <p><span>Breed: </span>${cat.breed}</p>
    //         <p><span>Description: </span>${cat.description}</p>

    //         <ul class="buttons">
    //             <li class="btn edit"><a href="/cats/edit/${cat.id}">Change Info</a></li>
    //             <li class="btn delete"><a href="/cats/delete/${cat.id}">New Home</a></li>
    //         </ul>
    //     </li>
    // `).join('');

    // return htmlContent.replace('{{cats}}', catsHtml);

    const catTemplate = (cat) => `
        <li>
            <img src="${cat.imageUrl}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Price: </span>${cat.price}$</p>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>

            <ul class="buttons">
                <li class="btn edit"><a href="/cats/edit/${cat.id}">Change Info</a></li>
                <li class="btn delete"><a href="/cats/delete/${cat.id}">New Home</a></li>
            </ul>
        </li>
    `;

    const catsContent = `<ul>${cats.map(catTemplate).join('\n')}</ul>`;

    return htmlContent.replace('{{cats}}', catsContent);
}
