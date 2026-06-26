import http from 'http';

import fs from 'fs/promises';
import { addCat, getCats, getCatById, updateCat, deleteCat } from './catService.js';
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
        const bodyFormData = await readBodyFormData(req);
        const breedName = bodyFormData.get('breed');
        addBreed(breedName);

        return res.writeHead(302, { 'Location': '/' }).end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        const bodyFormData = await readBodyFormData(req);
        const newCat = {
            name: bodyFormData.get('name'),
            description: bodyFormData.get('description'),
            imageUrl: bodyFormData.get('imageUrl'),
            breed: bodyFormData.get('breed'),
            price: bodyFormData.get('price'),
        };

        addCat(newCat);

        return res.writeHead(302, { 'Location': '/' }).end();
    }

    if (req.method === 'POST' && req.url.startsWith('/cats/edit')) {
        const catId = req.url.split('/').pop();
        const bodyFormData = await readBodyFormData(req);
        updateCat(catId, {
            name: bodyFormData.get('name'),
            description: bodyFormData.get('description'),
            // imageUrl: bodyFormData.get('imageUrl'),
            breed: bodyFormData.get('breed'),
            price: bodyFormData.get('price'),
        });

        return res.writeHead(302, { 'Location': '/' }).end();
    }

    if (req.method === 'POST' && req.url.startsWith('/cats/delete')) {
        const catId = req.url.split('/').pop();
        deleteCat(catId);
        return res.writeHead(302, { 'Location': '/' }).end();
    }


    res.writeHead(200, { 'Content-Type': 'text/html' });
    let htmlContent = '';


    if (req.url === '/') {
        htmlContent = await renderHomePage();

    } else if (req.url.startsWith('/search')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const searchTerm = url.searchParams.get('name');
        const cats = getCats().filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
        htmlContent = await renderHomePage(cats);
    }
    else if (req.url === '/cats/add-cat') {
        htmlContent = await renderAddCatPage();

    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf-8');

    } else if (req.url.startsWith('/cats/edit')) {

        const catId = req.url.split('/').pop();
        const cat = getCatById(catId);

        if (!cat) {
            render404Page();
        }

        htmlContent = await renderEditCatPage(catId);

    } else if (req.url.startsWith('/cats/delete')) {

        const catId = req.url.split('/').pop();
        htmlContent = await deleteCatPage(catId);
    }
    else {
        htmlContent = await render404Page();
    }



    res.write(htmlContent);
    return res.end();
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});

async function render404Page() {
    const htmlContent = await fs.readFile('./src/views/404.html', 'utf-8');
    return htmlContent;
}

async function renderHomePage(cats = getCats()) {
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

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./src/views/addCat.html', 'utf-8');
    const breeds = await getBreeds();
    const breedOptions = breeds.map(breed => `<option value="${breed.id}">${breed.name}</option>`).join('\n');
    return htmlContent.replace('{{breedOptions}}', breedOptions);
}

async function renderEditCatPage(catId) {
    const htmlContent = await fs.readFile('./src/views/editCat.html', 'utf-8');
    const cat = getCatById(catId);
    const breeds = await getBreeds();
    const breedOptions = breeds.map(breed => `<option value="${breed.id}">${breed.name}</option>`).join('\n');

    return htmlContent.replace('{{catName}}', cat.name)
        .replace('{{catDescription}}', cat.description)
        .replace('{{catImageUrl}}', cat.imageUrl)
        .replace('{{catPrice}}', cat.price)
        .replace('{{catBreed}}', cat.breed)
        .replace('{{breedOptions}}', breedOptions);
}

async function deleteCatPage(catId) {
    const htmlContent = await fs.readFile('./src/views/catShelter.html', 'utf-8');
    const cat = getCatById(catId);
    const breeds = await getBreeds();
    const breedOptions = breeds
        .map(b => `<option value="${b.id}">${b.name}</option>`)
        .join('\n');

    return htmlContent
        .replace(/{{catName}}/g, cat.name)
        .replace(/{{catDescription}}/g, cat.description)
        .replace(/{{catImageUrl}}/g, cat.imageUrl)
        .replace(/{{catBreed}}/g, cat.breed)
        .replace(/{{breedOptions}}/g, breedOptions);
}

function readBodyFormData(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const formData = new URLSearchParams(body);
            resolve(formData);
        });
    });
}

