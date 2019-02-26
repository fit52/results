/**
 * JavaScript
 * 
 * Gets the emails of the participants of the
 * runners in an event
 */

const fs = require('fs');
const minimist = require('minimist');
const { db } = require('../connect')();

const argv = minimist(process.argv.slice(2));

if (argv._.length === 0) throw new Error('No Event provided');

const { _: [ eventNo ] } = argv;
if (!/\d+/.test(eventNo)) throw new Error('Invalid Event provided');

db.find({
    selector: {
        _id: { $regex: '^runner/' },
        eventList: {
            $elemMatch: {
                'event.number': eventNo
            }
        }
    },
    fields: [
        'email'
    ]
})
.then(({ docs }) => {
    let out = docs.map(email => email.email );

    const dirPath = `${__dirname}/../../secrets/output-data/event${eventNo}`;
    fs.mkdir(dirPath, { recursive: true }, err => {
        if (err && err.code !== 'EEXIST'){
            console.error(err);
        } else {
            fs.writeFileSync(dirPath + '/emails.csv', out.join('\n'));
        }
    });
})
.then(() => console.log('Done!'))
.catch(err => console.error(err.message));
