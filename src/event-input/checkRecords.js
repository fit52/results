const moment = require('moment');

/**
 * 
 * @param {any[]} records An array of the records
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
 */
const checkRecords = (globalRecords, result, gender) => {
    let distanceString = 'fastest' + result.distance.toString() + 'k';
    let genderString = (gender === 'f' ? 'fe' : '') + 'male';
    // console.log(distanceString, genderString);

    let category = globalRecords[distanceString][genderString];
    if (!category) throw new Error('category not found');
    // console.log(category);

    for (let x of category) {
        let pos = category.indexOf(x);

        if (!x.time) {
            category.splice(pos, 0, result);
            break;
        }

        let recordTime = moment.duration(x.time).asSeconds();
        if (result.time.asSeconds() < recordTime) {
            category.splice(pos, 0, result);
            break;
        }
    }

    category = removeDuplicates(category, result.name);
    category.length = 5;
    // console.log(category);

    let ageGradeRecords = globalRecords.ageGrade;
    for (let x of ageGradeRecords) {
        let pos = ageGradeRecords.indexOf(x);

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
