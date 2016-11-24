
const _         = require('lodash');
const Sequelize = require('sequelize');
const Promise   = require('bluebird');

// Configuration
const loginData = {
    'email'    : process.env.ANCEMAIL,
    'password' : process.env.ANCPASS,
    'dbhost'   : process.env.DBHOST || 'localhost',
    'dbuser'   : process.env.DBUSER,
    'dbpass'   : process.env.DBPASS,
    'dbname'   : process.env.DBNAME || 'person_get'
};

const sequelize = new Sequelize(`postgres://${loginData.dbuser}:${loginData.dbpass}@${loginData.dbhost}:5432/${loginData.dbname}`);

var Person = sequelize.define('person', {
    id      : {type : Sequelize.STRING, primaryKey : true},
    fname   : Sequelize.STRING,
    lname   : Sequelize.STRING,
    sufname : Sequelize.STRING,
    name    : Sequelize.STRING,
    bdate   : Sequelize.STRING,
    bplace  : Sequelize.STRING,
    gender  : Sequelize.STRING,
    status  : Sequelize.STRING,
    ddate   : Sequelize.STRING,
    dplace  : Sequelize.STRING,
    father  : Sequelize.STRING,
    mother  : Sequelize.STRING
});

Person.belongsToMany(Person, { as: 'Children', through: 'person_children' });
Person.belongsToMany(Person, { as: 'Spouses', through: 'person_spouses' });
Person.belongsToMany(Person, { as: 'Siblings', through: 'person_siblings' });

function savePerson(personData, children = [], spouses = [], siblings = []) {
    let person;
    return upsertPerson(personData).then(function(p) {
        person = p;
        console.log('Saved person: ' + person);
        return makeRelations(children);
    }).then(function (rels){
        return person.addChildren(rels);
    }).then(function() {
        return makeRelations(spouses);
    }).then(function (rels){
        return person.addSpouses(rels);
    }).then(function() {
        return makeRelations(siblings);
    }).then(function (rels){
        return person.addSiblings(rels);
    });
}

function upsertPerson(personData) {
    return Person.findById(personData.id).then(function(p){
        if (!p) {
            return Person.create(personData);
        } else {
            return p.update(personData);
        }
    });
}

function createIfNotExists(id) {
    return Person.findById(id).then(function(p){
        if (!p) {
          return Person.create({id: id});
        } else {
          return p;
        }
    });
}

function makeRelations(relations) {
    return Promise.mapSeries(relations, createIfNotExists);
}

function init() {
    return sequelize.sync();
}

function findPersons(matchObject = {}, offset = 0, limit = 10) {
    return Person.findAndCountAll({
        where: matchObject,
        offset: 0,
        limit: limit
    })
    .then(function(result) {
        console.log('FOUND:', result.count);
        return result.rows;
    });
}

module.exports = {
    loginData: loginData,
    init: init,
    save: savePerson,
    findPersons: findPersons,
    Person: Person
};
