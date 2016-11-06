"use strict";

// Configuration
var loginData = {
    'email'    :  process.env.ANCEMAIL,
    'password' :  process.env.ANCPASS
};

var personName = 'Brian Carlson';

var ec = protractor.ExpectedConditions;

function findPerson(name) {
    // If I'm in tree view, go to person view
    if (ec.presenceOf(element(by.css('.iconPersonFind.findPersonButton')))) {
        element(by.css('[for="typeAheadPersonText"] span')).click();
        browser.wait(ec.presenceOf(element(by.css('#personLinks .iconPerson'))));
        element(by.css('#personLinks .iconPerson')).click();
    }
    // Find person
    browser.wait(ec.presenceOf(element(by.css('.iconPersonFind'))));
    element(by.css('.iconPersonFind')).click();
    element(by.css('#personLookupField')).sendKeys(name);
    browser.wait(ec.presenceOf(element(by.css('#personLookupFieldResults li:first-child'))));
    element(by.css('#personLookupFieldResults li:first-child')).click();
    browser.wait(ec.presenceOf(element(by.css('#personCardContainer .userCardTitle'))));
}

function getPersonData() {
    var person = {};
    // Grab information
    element(by.css('[onclick="personAnalyticsTrackClick(\'editMenuEntry\');"]')).click();
    element(by.css('#quickEdit')).click();
    browser.wait(ec.presenceOf(element(by.css('#fname'))));
    return element(by.css('#fname')).getAttribute('value').then(function(name) {
        // First name + middle name
        person.fname = name;
        return element(by.css('#lname')).getAttribute('value');
    }).then(function(name) {
        // Last name
        person.lname = name;
        return element(by.css('#sufname')).getAttribute('value');
    }).then(function(name) {
        // Suffix
        person.sufname = name;
        if (person.sufname != '') {
            person.name = person.fname + ' ' + person.lname + ' ' + person.sufname;
        } else {
            person.name = person.fname + ' ' + person.lname;
        }
        return element(by.css('#bdate')).getAttribute('value');
    }).then(function(date) {
        // Birth date
        person.bdate = date;
        return element(by.css('#bplace')).getAttribute('value');
    }).then(function(place) {
        // Birth place
        person.bplace = place;
        return element(by.css('#genderRadioCollection + ul li input[checked="checked"]')).getAttribute('value');
    }).then(function(gender) {
        // Gender
        person.gender = gender;
        return element(by.css('#statusRadioCollection + ul li input[checked="checked"]')).getAttribute('value');
    }).then(function(status) {
        // Status (Living / Deceased)
        person.status = status;
        return element(by.css('#ddate')).getAttribute('value');
    }).then(function(date) {
        // Death date
        person.ddate = date;
        return element(by.css('#dplace')).getAttribute('value');
    }).then(function(place) {
        // Death place
        person.dplace = place;
        return element(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemMale')).getAttribute('href');
    }).then(function(url) {
        // Link to father
        person.father = url;
        return element(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemFemale')).getAttribute('href');
    }).then(function(url) {
        // Link to mother
        person.mother = url;
        return person;
    });
}

beforeEach(function(){
    isAngularSite(false);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; // 1 minute
});

describe('get-person', function() {
    it('should work', function() {
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

        // Find person
        findPerson(personName);
        getPersonData().then(function(person) {
            console.log('person:');
            console.log(person);
            browser.get(person.father);
            getPersonData().then(function(father) {
                console.log('father:');
                console.log(father);
                browser.get(person.mother);
                getPersonData().then(function(mother) {
                    console.log('mother:');
                    console.log(mother);
                });
            });
        });
    });
});
