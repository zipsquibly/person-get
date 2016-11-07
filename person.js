module.exports = {
    findPerson    : findPerson,
    getPersonData : getPersonData,
    goToPerson    : goToPerson
};

var ec = protractor.ExpectedConditions;

var id_regex = /^http:\/\/person.ancestry.com\/tree\/[0-9]*\/person\/(-?[0-9]*)/;

var _ = require('lodash');

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

function goToPerson(tree, id) {
    browser.get(`http://person.ancestry.com/tree/${tree}/person/${id}/facts`);
    browser.wait(ec.presenceOf(element(by.css('#personCardContainer .userCardTitle'))));
}

function getPersonData() {
    var person = {};
    // Grab information
    return browser.getCurrentUrl().then(function(url) {
        person.id = url.match(id_regex)[1];
        element(by.css('[onclick="personAnalyticsTrackClick(\'editMenuEntry\');"]')).click();
        element(by.css('#quickEdit')).click();
        browser.wait(ec.presenceOf(element(by.css('#fname'))));
        return element(by.css('#fname')).getAttribute('value');
    }).then(function(name) {
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
        //console.log('looking for father');
        return element.all(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemMale')).count().then(function(hasFather) {
            if (hasFather) {
                return element(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemMale')).getAttribute('href').then(function(url) {
                    // ID of father
                    person.father = url.match(id_regex)[1];
                    console.log(`found father ${person.father}`);
                });
            } else {
                person.father = false;
            }
        });
    }).then(function() {
        //console.log('looking for mother');
        return element.all(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemFemale')).count().then(function(hasMother) {
            if (hasMother) {
                return element(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchParent\');"].factItemFemale')).getAttribute('href').then(function(url) {
                    // ID of mother
                    person.mother = url.match(id_regex)[1];
                    console.log(`found mother ${person.mother}`);
                });
            } else {
                person.mother = false;
            }
        });
    }).then(function() {
        //console.log('looking for siblings');
        //element(by.css('#toggleSiblingsButton')).click();
        person.siblings = [];
        return element.all(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchSibling\');"].factItem')).each(function(sibling) {
            sibling.getAttribute('href').then(function(url) {
                person.siblings.push(url.match(id_regex)[1]);
                console.log(`found sibling ${person.siblings[0]}`);
            });
        });
    }).then(function() {
        //console.log('looking for spouse(s)');
        //element(by.css('#toggleSiblingsButton')).click();
        person.spouse = [];
        return element.all(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchSpouse\');"].factItem')).each(function(spouse) {
            spouse.getAttribute('href').then(function(url) {
                person.spouse.push(url.match(id_regex)[1]);
                console.log(`found spouse ${person.spouse[0]}`);
            });
        });
    }).then(function() {
        //console.log('looking for children');
        //element(by.css('#toggleSiblingsButton')).click();
        person.children = [];
        return element.all(by.css('#familySection li [onclick="personAnalyticsTrackFactsPersonClick(\'ResearchChild\');"].factItem')).each(function(child) {
            child.getAttribute('href').then(function(url) {
                var cid = url.match(id_regex)[1];
                if (!_.includes(person.children, cid)) {
                    person.children.push(cid);
                    console.log(`found child ${cid}`);
                }
            });
        });
    }).then(function() {
        return person;
    });
}
