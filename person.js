module.exports = {
    init: init,
    save: savePerson,
    findPersons: findPersons
};

const _         = require('lodash');
const Sequelize = require('sequelize');
const ec        = protractor.ExpectedConditions;

// Configuration
const loginData = module.exports.loginData = {
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

Person.belongsToMany(Person, { as: 'Children', through: 'PersonChildren' });

function savePerson(p) {
    console.log('Saving person: ' + p.name);
    return Person.upsert(p);
}

function init() {
    return sequelize.sync();
}

function findPersons(matchObject = {}, offset = 0, limit = 10) {
    Person.findAndCountAll({
        where: matchObject,
        offset: 0,
        limit: limit
    })
    .then(function(result) {
        console.log('FOUND:', result.count);
        return result.rows;
    });
}
