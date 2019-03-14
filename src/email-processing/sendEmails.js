/**
 * JavaScript
 * 
 * Gets the emails of the participants of the
 * runners in an event
 */

const minimist = require('minimist');
const path = require('path');
const { db } = require('../connect')();

const argv = minimist(process.argv.slice(2));

if (argv._.length === 0) throw new Error('No Event provided');

const { _: [ eventNo ] } = argv;
if (!/\d+/.test(eventNo)) throw new Error('Invalid Event provided');

const dirPath = path.normalize(`${__dirname}/../../secrets/output-data/event${eventNo}`);

db.find({
    selector: {
        _id: { $regex: `^(runner/|event/${eventNo})` },
        eventList: {
            $or: [
                { $exists: false },
                {
                    $elemMatch: {
                        'event.number': eventNo
                    }
                }
            ]
        }
    },
    fields: [
        '_id',
        'results',
        'uuid',
        'email'
    ]
})
.then(({ docs }) => {
    // fs.writeFileSync(`${__dirname}/../../secrets/tempout.json`, JSON.stringify(docs, null, 4));

    let event = docs.find(value => value._id === `event/${eventNo}`);

    docs.splice(docs.indexOf(event), 1);

    for (let runner of docs) {
        let result = event.results.find(value => value.uuid === runner.uuid);

        

    }

})
.then(() => console.log(`Output to ${path.join(dirPath, 'emails.csv' )}`))
.catch(err => console.error(err.message));
