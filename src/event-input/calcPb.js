/**
 * Caculates if a participant has run a new
 * PB or if a new record time has been set and returns the result
 * and the new runner object
 */

const moment = require('moment');

/**
 * @param {object} result The result for the race
 * @param {object} runner The runner
 * 
 * @returns { { result: object, runner: object } } The modified result and runner objects
 */
const calcPb = (result, runner) => {
    let newPb = false;
    
    let distance = result.distance;
    if (!['2', '5'].includes(distance)) throw new Error('distance invalid');

    let fastest = runner.stats[`records${distance}k`].fastest;
    let slowest = runner.stats[`records${distance}k`].slowest;

    if (!fastest || !slowest) {
        if (!fastest) {
            runner.stats[`records${distance}k`].fastest = result;
        }

        if (!slowest) {
            runner.stats[`records${distance}k`].slowest = result;
        }
    } else {
        let fastestTime = moment.duration(fastest.time).asSeconds();
        let slowestTime = moment.duration(slowest.time).asSeconds();

        if (result.time.asSeconds() < fastestTime) {
            runner.stats[`records${distance}k`].fastest = result;
            newPb = true;
        }

        if (result.time.asSeconds() > slowestTime) {
            runner.stats[`records${distance}k`].slowest = result;
        }
    }

    let bestAgeGrade = runner.stats.recordsAgeGrade.best;
    let worstAgeGrade = runner.stats.recordsAgeGrade.worst;

    if (!bestAgeGrade || !worstAgeGrade) {
        if (!bestAgeGrade) {
            runner.stats.recordsAgeGrade.best = result;
        }

        if (!worstAgeGrade) {
            runner.stats.recordsAgeGrade.worst = result;
        }
    } else {
        if (result.ageGrade > bestAgeGrade.ageGrade) {
            runner.stats.recordsAgeGrade.best = result;
        }

        if (result.ageGrade < worstAgeGrade.ageGrade) {
            runner.stats.recordsAgeGrade.worst = result;
        }
    }

    if (newPb && !result.firstEvent) {
        runner.stats.noPbs ++;
        result.pb = true;
        result.notes.push('PB');
    }

    return {
        result,
        runner
    };
};

module.exports = calcPb;
