import { v4 } from 'uuid';
import cats from "./cats.js";
import { getBreedById } from "./breedsService.js";

export function getCats() {
    return cats;
}

export function addCat(cat) {
    const breed = getBreedById(cat.breed)?.name || 'Unknown Breed';
    const newCat = {
        id: v4(),
        ...cat,
        breed: breed,
    }
    cats.push(newCat);
}

export function getCatById(id) {
    return cats.find(cat => cat.id === id);
}

export function updateCat(id, updatedCat) {
    const catIndex = cats.findIndex(cat => cat.id === id);

    if (catIndex !== -1) {
        const breed = getBreedById(updatedCat.breed)?.name || 'Unknown Breed';
        cats[catIndex] = {
            ...cats[catIndex],
            ...updatedCat,
            breed: breed,
        };
    }
}

export function deleteCat(id) {
    const catIndex = cats.findIndex(cat => cat.id === id);
    cats.splice(catIndex, 1);
}