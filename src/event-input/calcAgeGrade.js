/**
 * Calculates the age grade for a give time, distance and gender
 * All data for the age grades is stored in 'age_grade_data/'
 */
const csvParse = require('csv-parse/lib/sync');
const { readFileSync } = require('fs');
const moment = require('moment');
const path = require('path');

/** @type { { [x: string]: any } } */
let cache = {};


/**
 * @param { string | number } age The age of the runner should be 5-100
 * @param { string | number } distance The distance ran can only be 2 or 5
 * @param { 'f' | 'm' } gender The gender of the runner - can be 'f' or 'm'
 * @param { string | moment.Duration } time The time ran should be in format hh:mm:ss.ms
 * 
 * @return { number } The percentage age grade as a decimal
 */
const calcAgeGrade = (age, distance, gender, time) => {
    age = age.toString();
    distance = distance.toString();
    gender = gender.toLowerCase().trim();
    /** @type { moment.Duration } */
    let runnerTime = moment.duration(time);
    if (runnerTime.asSeconds() === 0) throw new Error('invalid time');
    
    /* eslint-disable quotes */
    if (!['2', '5'].includes(distance)) throw new Error("Distance can be '2' or '5'");
    if (!['m', 'f'].includes(gender.toLowerCase())) throw new Error("Gender can be 'f' or 'm'");
    /* eslint-enable */
    
    let fileString = `${distance}k-${gender}.csv`;
    if (!cache[fileString]) {
        // console.log(`loaded: '${fileString}'`);
        cache[fileString] = csvParse(readFileSync(path.join(__dirname, '..', '..', 'age_grade_data', fileString)));
    }
    
    let ageGradeData = cache[fileString].find(x => {
        if (x[0] === age) return x;
    });
    if (!ageGradeData) throw new Error('Invalid age must be 5-100');

    let ageGradeTime = moment.duration(ageGradeData[2]);
    let ageGrade = ageGradeTime / runnerTime;
    // console.log(ageGrade);

    return ageGrade;
};

module.exports = calcAgeGrade;
