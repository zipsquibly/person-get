"use strict";

// Configuration
var loginData = {
    'email'    : process.env.ANCEMAIL,
    'password' : process.env.ANCPASS,
    'dbhost'   : process.env.DBHOST || 'localhost',
    'dbuser'   : process.env.DBUSER,
    'dbpass'   : process.env.DBPASS,
    'dbname'   : process.env.DBNAME || 'person_get'
};

var personName = 'Brian Carlson';

var Sequelize = require('sequelize'),
    person    = require('./person.js'),
    _         = require('lodash');

var ec        = protractor.ExpectedConditions,
    sequelize = new Sequelize(`postgres://${loginData.dbuser}:${loginData.dbpass}@${loginData.dbhost}:5432/${loginData.dbname}`);

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

beforeEach(function() {
    isAngularSite(false);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000000; // 1 minute
});

var treeId = 0,
    tree_regex = /^http:\/\/[a-zA-Z]*.ancestry.com\/tree\/([0-9]*)/,
    tree_tree = [],
    tree_dont = [];

function insertPerson(p) {
    if (p && !_.includes(tree_dont, p)) {
        tree_tree.push(p);
        tree_dont.push(p);
    }
}

function savePerson(p) {
    console.log('Saving person: ' + p.name);
    return Person.upsert(p).then(function() {
        insertPerson(p.father);
        insertPerson(p.mother);
        _.each(p.siblings, insertPerson);
        _.each(p.spouse, insertPerson);
        _.each(p.children, insertPerson);
    });
}

function startTree() {
    return person.getPersonData().then(function(p) {
        tree_dont.push(p.id);
        return sequelize.sync().then(function() {
            return savePerson(p);
        });
    });
}

function foo(done) {
    if (tree_tree.length) {
        var id = tree_tree.shift();
        person.goToPerson(treeId, id);
        return person.getPersonData().then(function (p) {
            return savePerson(p);
        }).then(function() {
            return foo(done);
        });
    } else {
        done();
    }
}

describe('get-person', function() {
    it('should work', function(done) {
        browser.get('http://www.ancestry.com');

        expect(browser.getTitle()).toEqual('Ancestry® | Genealogy, Family Trees & Family History Records');

        // Sign in with supplied credentials
        element(by.css('.ancLoginBtn')).click();
        element(by.css('#smpUserName')).sendKeys(loginData.email);
        element(by.css('#smpPassword')).sendKeys(loginData.password);
        element(by.css('#smpSigninBtn')).click();

        browser.wait(ec.presenceOf(element(by.css('#navTrees'))));

        // Go to tree
        element(by.css('#navTrees')).click();
        element(by.css('#navTreesMenu ul li:first-child')).click();

        var p;

        // Get ID of tree
        browser.getCurrentUrl().then(function(url) {
            treeId = parseInt(url.match(tree_regex)[1]);

            // Find person
            person.findPerson(personName);

            startTree().then(function() {
                foo(done);
            });
        });
    });
});
