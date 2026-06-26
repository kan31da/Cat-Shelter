import { v4 } from 'uuid';
import breeds from "./breeds.js";

export function getBreeds() {
    return breeds;
};

export function getBreedById(id) {
    return breeds.find(breed => breed.id === id);
};

export function addBreed(breed) {
    const newBreed = {
        id: v4(),
        name: breed,
    };

    breeds.push(newBreed);
};