const checkRecords = require('./checkRecords');
const compileEvent = require('./compileEvent');
const compileResults = require('./compileResults');

const { db } = require('../connect')();

const updateRunners = async (runners) => {
    db.bulk({ docs: runners })
    // .then(res => console.log(res))
    .catch(err => console.error(err.message));
};

const insertEvent = async (event) => {
    db.insert(event)
    // .then(res => console.log(res))
    .catch(err => console.error(err.message));
};

const updateRecords = async (globalRecords) => {
    db.insert(globalRecords)
    // .then(res => console.log(res))
    .catch(err => console.error(err));
};

/**
 * Processes the results for an event given the finishs and times
 * files should be provided in order finisher, times
 * 
 * @param {string[]} argv The paths for the files to get the data from
 */
const processEvent = argv => {
    if (Object.keys(argv).length === 0) throw new Error('No files specified');
    compileResults(argv)
    .then(async res => {
        let results = res.results;
        let runners = res.runners;

        let event = compileEvent(results, argv.noPb);

        let globalRecords;
        if (!argv.noPb) {
            await db.get('global_records')
            .then(res => {
                if (typeof res !== 'object') {
                    throw new Error(res);
                }

                globalRecords = res;
            });

            for (let i = 0; i < results.length; i++) {
                // console.log(globalRecords);
                let result = results[i];
                let gender = runners[i].gender;

                globalRecords = checkRecords(globalRecords, result, gender);
            }
        }

        // console.log(globalRecords);

        return {
            runners,
            event,
            globalRecords
        };
    })
    .then(async data => {
        // console.log(data.event);
        // console.log(data.runners);
        // console.log(data.globalRecords);
        insertEvent(data.event);
        updateRunners(data.runners);
        if (data.globalRecords) updateRecords(data.globalRecords);
    })
    .then(() => {
        console.log(`Finished: ${argv}`);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
};

module.exports = processEvent;
