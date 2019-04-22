/**
 * JavaScript
 * src/event-input/compileResults.js
 * 
 * Compiles the results (and runners) from a race and outputs
 * the new data
 */

const moment = require('moment');

const calcAgeGrade = require('./calcAgeGrade');
const calcPb = require('./calcPb');
const getResults = require('./getResults');

/**
 * Compiles results and runners after a race givien the files
 * for the finishers and stopwatches
 * 
 * @param {string[]} argv The finisher & stopwatch / past-event data
 * 
 * @returns {{ results: object[], runners: object[] }} The compiled results and runners
 */
const compileResults = async (argv) => {
    const { db } = require('../connect')();

    let eventRes = await db.find({
        selector: {
            _id: {
                $regex: '^event/'
            }
        }
    });
    let events = eventRes.docs;

    let { results, date } = getResults(argv._);


    const checkEvents = (date, events) => {  
        for (let event of events) {
            if (date.toISOString() === event.date) {
                return true;
            }
        }

        return false;
    };
    
    if (checkEvents(date, events)) {
        throw new Error('Error: event already in db');
    }

    let runnersRes = await db.find({
        selector: {
            _id: {
                $regex: '^runner/'
            }
        }
    });

    let runners = runnersRes.docs;

    let compiledResults = [];
    let compiledRunners = [];

    let checkEventRunner = (resEventDate, runnerEventList) => {
        for (let event of runnerEventList) {
            if (resEventDate.toISOString() === event.event.date) {
                return true;
            }
        }

        return false;
    };

    // console.log(new Date(Date.now() - new Date(runners[0].dob)).getUTCFullYear() - 1970);
    
    for (let result of results) {
        result.event.number = events.length + 1;

        let name = result.name;
        // console.log(name);

        let runner = runners.find(element => {
            return element.fullname === name;
        });

        if (!runner) throw new Error(`${name} not found`);

        if (checkEventRunner(result.event.date, runner.eventList)) {
            throw new Error('Error: runner already run this event');
        }

        // Must be calculated 1st as a pb should be false if it is their 1st event
        if (runner.eventList.length === 0) {
            result.firstEvent = true;
            result.notes.push('First Event');
        }

        // Don't calculate ageGrades or PBs if the noPb flag provided
        if (!argv.noPb) {
            let age = moment().diff(new Date(runner.dob), 'years');
            result.ageGrade = calcAgeGrade(age, result.distance, runner.gender, result.time);

            let pbRes = calcPb(result, runner);
            // These 2 lines may be unnecessary
            result = pbRes.result;
            runner = pbRes.runner;
        } else {
            result.ageGrade = 0;
        }

        runner.eventList.push(result);
        runner.stats[`no${result.distance}k`] ++;
        runner.stats.noTotalEvents ++;

        result.noEvents = runner.stats.noTotalEvents;
        result.uuid = runner.uuid;

        compiledResults.push(result);
        compiledRunners.push(runner);
    }

    return {
        results: compiledResults,
        runners: compiledRunners,
    };
};

module.exports = compileResults;
