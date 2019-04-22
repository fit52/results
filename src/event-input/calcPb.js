/**
 * JavaScript
 * src/event-input/calcPb.js
 * 
 * Calculates if a participant has run a new
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
    let stats = Object.assign({}, runner.stats);
    
    let newPb = 0;
    
    let distance = result.distance.toString();
    if (!['2', '5'].includes(distance)) throw new Error('distance invalid');

    let fastest = stats[`records${distance}k`].fastest;
    let slowest = stats[`records${distance}k`].slowest;


    if (!fastest) {
        // There isn't a fastest time thus also not a slowest so set to both
        stats[`records${distance}k`].fastest = result;
        stats[`records${distance}k`].slowest = result;        
    } else {
        let fastestTime = moment.duration(fastest.time).asSeconds();
        let slowestTime = moment.duration(slowest.time).asSeconds();

        if (moment.duration(result.time).asSeconds() < fastestTime) {
            stats[`records${distance}k`].fastest = result;
            newPb = 1;
        }

        if (moment.duration(result.time).asSeconds() > slowestTime) {
            stats[`records${distance}k`].slowest = result;
        }
    }

    let bestAgeGrade = stats.recordsAgeGrade.best;
    let worstAgeGrade = stats.recordsAgeGrade.worst;

    if (!bestAgeGrade) {
        // There isn't a best age grade thus also not a worst so set to both
        stats.recordsAgeGrade.best = result;
        stats.recordsAgeGrade.worst = result;
    } else {
        if (result.ageGrade > bestAgeGrade.ageGrade) {
            stats.recordsAgeGrade.best = result;
        }

        if (result.ageGrade < worstAgeGrade.ageGrade) {
            stats.recordsAgeGrade.worst = result;
        }
    }
    
    stats.noPbs += newPb;
    let resPb = (newPb === 1);
    
    return {
        result: {
            ...result,
            pb: resPb
        },
        runner: {
            ...runner,
            stats
        }
    };
};

module.exports = calcPb;
