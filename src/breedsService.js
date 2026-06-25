import breeds from "./breeds.js";

export function getBreeds() {
    return breeds;
};

export function getBreedById(id) {
    return breeds.find(breed => breed.id === id);
};

export function addBreed(breed) {
    const newBreed = {
        id: (breeds.length + 1).toString(),
        name: breed,
    };

    breeds.push(newBreed);
};