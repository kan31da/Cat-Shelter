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