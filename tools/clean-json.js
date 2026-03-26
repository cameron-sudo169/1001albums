import fs from "fs";

const path = "./src/data/albums_with_genre_reason.json";

// Read the JSON file
const data = JSON.parse(fs.readFileSync(path, "utf-8"));

// Remove every 7th album (array index 6, 13, 20, ...)
const cleaned = data.filter((_, index) => (index + 1) % 7 !== 0);

// Write it back
fs.writeFileSync(path, JSON.stringify(cleaned, null, 2));

console.log("Cleaned JSON written successfully!");
