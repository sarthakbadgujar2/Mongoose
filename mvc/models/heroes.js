const mongoose = require( 'mongoose' );
mongoose.set('useCreateIndex', true);

// const heroSchema = new mongoose.Schema({
//     name: String
// });


// This is the same thing as before.
// const heroSchema = new mongoose.Schema({
//     name: {
//         type: String
//     }
// });


// Create this schema after doing heroSchema with 3 paths.
const statsSchema = new mongoose.Schema({
    strength:     { type: Number, default: 30, min: 0, max: 100 },
    perception:   { type: Number, default: 30, min: 0, max: 100 },
    endurance:    { type: Number, default: 30, min: 0, max: 100 },
    charisma:     { type: Number, default: 30, min: 0, max: 100 },
    intelligence: { type: Number, default: 30, min: 0, max: 100 },
    agility:      { type: Number, default: 30, min: 0, max: 100 },
    luck:         { type: Number, default: 30, min: 0, max: 100 }
});


const heroSchema = new mongoose.Schema({
    
    // Adding unique will cause a warning in the console.
    // Fix it by adding the line of code at the top of this file on line 2.
    name:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    origin:      { type: String, default: "Unknown" },
    
    // Add this path after creating the statsSchema.
    stats:       { type: statsSchema, required: true },
    squad: String
});



// Create the squad schema after finishing the hero schema.
const squadSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    hq: String
});



mongoose.model('Squad', squadSchema);
mongoose.model('Hero', heroSchema);