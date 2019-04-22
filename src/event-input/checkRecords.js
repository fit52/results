/**
 * JavaScript
 * src/event-input/checkRecords.js
 * 
 * Checks if a new global record has been set
 * and updates the document.
 */

const moment = require('moment');

/**
 * Checks if there any runner appears more than once in the
 * global records and removes duplicates
 * 
 * @param {any[]} records An array of the records
 * @param {string} name The name of the runner
 * 
 * @returns {object} The new state of the records without any duplicates
 */
const removeDuplicates = (records, name) => {
    let filtered = records.filter(value => {
        if (value.name === name) return value;
    });

    let pos;
    // console.log('length', filtered.length);
    switch (filtered.length) {
        case 0:
            break;

        case 1:
            break;
        
        case 2:
            pos = records.indexOf(filtered[1]);
            // console.log(pos);
            records.splice(pos, 1);
            break;
        
        default:
            throw new Error(`filtered length = ${filtered.length}`);
    }

    // console.log(records);
    return records;
};

/**
 * Calculates if the participant has broken a new fit52 record
 * 
 * @param {object} globalRecords The current records from the db
 * @param {object} result The result from the event
 * @param {'f' | 'm'} gender The gender of the participant
 * 
 * @returns {object} The new state of the global records
 */
const checkRecords = (globalRecords, result, gender) => {
    let distanceString = 'fastest' + result.distance + 'k';
    let genderString = (gender === 'f' ? 'fe' : '') + 'male';
    // console.log(distanceString, genderString);
    
    let category = globalRecords[distanceString][genderString].slice();
    if (!category) throw new Error('category not found');
    // console.log(category);

    for (let pos = 0; pos < category.length; pos++) {
        let x = category[pos];

        if (!x.time) {
            category.splice(pos, 0, result);
            break;
        }

        let recordTime = moment.duration(x.time).asSeconds();
        if (moment.duration(result.time).asSeconds() < recordTime) {
            category.splice(pos, 0, result);
            break;
        }
    }

    category = removeDuplicates(category, result.name);
    category.length = 5;
    // console.log(category);

    let ageGradeRecords = globalRecords.ageGrade.slice();
    for (let pos = 0; pos < ageGradeRecords.length; pos++) {
        let x = ageGradeRecords[pos];

        if (!x.ageGrade) {
            ageGradeRecords.splice(pos, 0, result);
            break;
        }

        if (result.ageGrade > x.ageGrade) {
            ageGradeRecords.splice(pos, 0, result);
            break;
        }
    }

    ageGradeRecords = removeDuplicates(ageGradeRecords, result.name);
    ageGradeRecords.length = 5;

    globalRecords[distanceString][genderString] = category;
    globalRecords.ageGrade = ageGradeRecords;
    return globalRecords;
};

module.exports = checkRecords;
