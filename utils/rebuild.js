/**
 * JavaScript
 * utils/rebuild.js
 * 
 * Provides functionality to rebuild the db from
 * a given event
 */

const { db } = require('../src/connect')();

const calcPb = require('../src/event-input/calcPb');
const checkRecords = require('../src/event-input/checkRecords');

let upToEvent = process.argv[2];
if (!upToEvent) throw new Error('no event given');
try {
    upToEvent = parseInt(upToEvent);
} catch (error) {
    throw new Error('invalid event number given');
}

// Reset Runners
const clearRunners = (res) => {
    let docs = res.docs.map(runner => {
        runner.stats = {
            records2k: {
                fastest: undefined,
                slowest: undefined
            },
    
            records5k: {
                fastest: undefined,
                slowest: undefined
            },
    
            recordsAgeGrade: {
                best: undefined,
                worst: undefined
            },

            noPbs: 0,
            
            no2k: 0,
            no5k: 0,
            noTotalEvents: 0,
            achievements: [],
            volunteering: []
        };

        runner.eventList.length = 0;
        return runner;
    });

    // console.log(docs[0]);
    return docs;
};


// Get all runners and remove all data but the personal info
db.find({
    selector: {
        _id: {
            $regex: '^runner/'
        }
    }
})
.then(clearRunners)
// Clear the global record
.then(async runners => {
    let out;

    await db.get('global_records')
    .then(res => {
        let arr = new Array(5).fill({});

        out = {
            _id: res._id,
            _rev: res._rev,

            fastest2k: {
                female: arr,
                male: arr
            },
    
            fastest5k: {
                female: arr,
                male: arr
            },
    
            ageGrade: arr
        };

        
    });

    return { runners, global_records: out };
})
.then(async docs => {
    let events;

    await db.find({
        selector: {
            _id: {
                $regex: '^event/'
            }
        }
    })
    .then(res => {
        let temp = res.docs;

        temp.sort((a, b) => {
            let noA = a._id.match(/\/(\d*)$/)[1];
            let noB = b._id.match(/\/(\d*)$/)[1];

            return noA - noB;
        });

        events = temp.filter(x => {
            let eventNo = x._id.match(/\/(\d*)$/)[1];

            return eventNo <= upToEvent;
        });
        // events = temp;
    });

    let global_records = docs.global_records;
    for (let event of events) {
        for (let result of event.results) {
            let runnerindex = docs.runners.findIndex(x => x.uuid === result.uuid);
            let runner = docs.runners[runnerindex];

            result.distance = result.distance.toString();

            if (!event.noPb) {
                let pbRes = calcPb(result, runner);
                // This line may be unnecessary
                runner = pbRes.runner;
                global_records = checkRecords(global_records, result, runner.gender);
            }

            runner.eventList.push(result);
            runner.stats[`no${result.distance}k`] ++;
            runner.stats.noTotalEvents ++;
            
            // console.log(docs.global_records);
            docs.runners[runnerindex] = runner;
        }
    }

    // console.log(docs.global_records);
    let out = [].concat(docs.runners, [global_records]);

    db.bulk({ docs: out })
    .then(() => {
        console.log('done!');
    });
})
.catch(err => {
    console.error(err.message);
});

