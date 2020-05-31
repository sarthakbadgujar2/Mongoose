const mongoose = require('mongoose');
const Hero = mongoose.model('Hero');
const Squad = mongoose.model('Squad');

let data = require("../../Default_Heroes");
let heroData = data.heroes;
let squadData = data.squads;


function getOverall(hero) {
    let {
        strength:str,
        perception:per,
        endurance:end,
        charisma:cha,
        intelligence:int,
        agility:agi,
        luck:luc,
    } = hero.stats;
    
    let arr = [str, per, end, cha, int, agi, luc];
    return arr.reduce((acc, value) => acc + value);
}



getIndex = function(req, res, next) {
    res.render('index', { title: 'Mongoose' });
}

getHeroesIndex = function(req, res, next) {
    Hero.find({}, "", {lean: true}, (err, heroes) => {
        if(err) { return res.send({ error: err }); }
        
        for (hero of heroes) {
            hero.overall = getOverall(hero);
        }
        
        res.render('heroes', { title: 'Hall Of Heroes', heroes: heroes});
    });
}

getHeroesForm = function(req, res, next) {
    Squad.find((err, squads) => {
        if(err) { return res.send({ error: err }) }
        res.render('create-hero', { title: 'Create A Hero', squads: squads });
    });
}

createNewHero = function({body}, res, next) {
    let hero = {
        name: body.name,
        description: body.desc,
        stats: {
            strength: body.strength,
            perception: body.perception,
            endurance: body.endurance,
            charisma: body.charisma,
            intelligence: body.intelligence,
            agility: body.agility,
            luck: body.luck
        },
    }
    body.origin && (hero.origin = body.origin);
    body.squad && (hero.squad = body.squad);
    
    Hero.create(hero, (err, newHero) => {
        if(err) { return res.send({ error: err }) }
        res.redirect("/heroes");
    });
}

deleteHero = function({params}, res, next) {
    Hero.findByIdAndRemove(params.heroid, (err, hero) => {
        if(err) { return res.send({ error: err }) }
        res.redirect("/heroes");
    });
}

getUpdateForm = function({params}, res, next) {
    Hero.findById(params.heroid, (err, hero) => {
        if(err) { return res.send({ error: err }) }
        
        Squad.find((err, squads) => {
            if(err) { return res.send({ error: err }) }
            res.render('update-hero', { title: 'Update Hero', hero: hero, squads: squads });
        });
    });
}

updateHero = function({params, body}, res, next) {
    Hero.findById(params.heroid, (err, hero) => {
        if(err) { return res.send({ error: err }) }
        
        hero.name = body.name;
        hero.description = body.desc;
        hero.origin = body.origin;
        hero.stats.strength = body.strength;
        hero.stats.perception = body.perception;
        hero.stats.endurance = body.endurance;
        hero.stats.charisma = body.charisma;
        hero.stats.intelligence = body.intelligence;
        hero.stats.agility = body.agility;
        hero.stats.luck = body.luck;
        
        hero.squad = undefined;
        body.squad && (hero.squad = body.squad);
        
        hero.save((err, updatedHero) => {
            if(err) { return res.send({ error: err }) }
            res.redirect("/heroes");
        });
    });
}

reset = function(req, res, next) {  
      
    let p1 = new Promise(function(resolve, reject) {
        Hero.deleteMany({ }, (err, info) => {
            if(err) { reject("Error"); return res.send({ error: err }) }
            resolve("Success");
        });
    });
    let p2 = new Promise(function(resolve, reject) {
        Squad.deleteMany({ }, (err, info) => {
            if(err) { reject("Error"); return res.send({ error: err }) }
            resolve("Success");
        });
    });
    
    Promise.all([p1, p2]).then(function() { 
           
        let p1 = new Promise(function(resolve, reject) {
            Hero.insertMany(heroData, (err, info) => {
                if(err) { reject("Error"); return res.send({ error: err }) }
                resolve("Success");
            });
        });
        let p2 = new Promise(function(resolve, reject) {
            Squad.insertMany(squadData, (err, info) => {
                if(err) { reject("Error"); return res.send({ error: err }) }
                resolve("Success");
            });
        });
        
        Promise.all([p1, p2]).then(function() {
            res.redirect("/heroes");
        });
    });
}

getSquadsIndex = function(req, res, next) {
    
    Squad.find({}, "", {lean: true}, (err, squads) => {
        if(err) { return res.send({ error: err }) }
        
        Hero.find({squad: { $exists: true }}, "name stats squad", {lean: true}, (err, heroes) => {
            
            for(let i = 0; i < squads.length; i++) {
                squads[i].heroes = [];
                
                for(let j = 0; j < heroes.length; j++) {
                    if(heroes[j].squad == squads[i].name) {
                        heroes[j].overall = getOverall(heroes[j]);
                        squads[i].heroes.push(heroes[j]);
                        heroes.splice(j--, 1);
                    }
                }
                
                // Calculate squad overall.
                let overall = squads[i].heroes.reduce((acc, val) => acc + val.overall, 0);
                squads[i].overall = overall;
            }
            
            res.render('squads', { title: 'Super Squads', squads: squads });
        })
        
        
    });
}

getSquadForm = function(req, res, next) {
    res.render('create-squad', { title: 'Create A Squad' });
}

createSquad = function({body}, res, next) {
    let squad = { name: body.name }
    body.hq && (squad.hq = body.hq);
    
    // This will set the default of the headquarters.  We could have done in this in the schema.
    squad.hq || (squad.hq = "Unknown");
    
    
    Squad.create(squad, (err, squad) => {
        if(err) { return res.send({ error: err }) }
        res.redirect("/squads");
    });
}

deleteSquad = function({params}, res, next) {
    Squad.findByIdAndRemove(params.squadid, (err, squad) => {
        if(err) { return res.send({ error: err }) }
        console.log(squad);
        
        Hero.find({squad: { $exists: true }}, "squad", {}, (err, heroes) => {
            if(err) { return res.send({ error: err }) }
            
            let promises = [];
            for(hero of heroes) {
                if(hero.squad == squad.name) {
                    hero.squad = undefined;
                    console.log("REMOVE SQUAD");
                    
                    let promise = new Promise(function(resolve, reject) {
                        hero.save((err, updateHeroes) => {
                            if(err) { reject("Error"); return res.send({ error: err }) }
                            resolve("Success");
                        });
                    });
                    
                    promises.push(promise);
                }
            }
            
            Promise.all(promises).then(function() {
                res.redirect("/squads");
            });
        });
    });
}







module.exports = {
    getIndex,
    getHeroesIndex,
    getHeroesForm,
    createNewHero,
    deleteHero,
    getUpdateForm,
    updateHero,
    reset,
    getSquadsIndex,
    getSquadForm,
    createSquad,
    deleteSquad
};