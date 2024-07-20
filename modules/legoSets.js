// Import the JSON data
const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

// Initialize an empty array
let sets = [];

// Function to initialize the data
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(set => {
                const theme = themeData.find(theme => theme.id === set.theme_id).name;
                sets.push({ ...set, theme });
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Function to get all sets
function getAllSets() {
    return new Promise((resolve) => {
        resolve(sets);
    });
}

// Function to get a set by its number
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        const set = sets.find(set => set.set_num === setNum);
        if (set) {
            resolve(set);
        } else {
            reject("Set not found");
        }
    });
}

// Function to get sets by theme
function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        const filteredSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
        if (filteredSets.length > 0) {
            resolve(filteredSets);
        } else {
            reject("No sets found for the given theme");
        }
    });
}

// Export the functions as a module
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };


