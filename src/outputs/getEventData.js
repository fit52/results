/**
 * Gets the data for an event
 * pass event no as arg
 */

const fs = require('fs');
const moment = require('moment');

const { db } = require('../connect')();

const eventNo = process.argv[2];
if (!eventNo) throw new Error('No Event Number Provided');

const path = `${__dirname}/../../secrets/output-data/event${eventNo}`;

/**
 * Outputs results from the event
 * @param {any[]} results The results from an event
 */
const outResults = async results => {
    let out = results.map(x => {
        delete x.event;
        delete x.pos;
        delete x.uuid;
        let time = moment.duration(x.time);
        x.time = moment({ hours: time.hours(), minutes: time.minutes(), seconds: time.seconds()}).format('HH:mm:ss');
        x.ageGrade = x.ageGrade + '%';
        delete x.firstEvent;
        delete x.pb;
        x.notes = x.notes.join(', ');

        return Object.values(x).join(',');
    });

    // console.log(out);

    out.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0; 
    });

    fs.writeFile(`${path}/results.csv`, out.join('\n'), err => {
        if (err) {
            console.error(err.message);
        } else {
            // console.log('done results');
        }
    });
};

/**
 * Outputs data from the event
 * @param {any[]} counts The counts from the event
 * @param {string} date The date of the event
 */
const outcounts = async (counts, date) => {
    let dateString = moment(date).format('D-MMM-YY');

    // let out = Object.assign({ dateString }, counts);
    let out = Object.values(counts);
    out.unshift(dateString);

    fs.writeFile(`${path}/counts.csv`, JSON.stringify(out).replace(/\[|\]|"/g, ''), err => {
        if (err) {
            console.error(err.message);
        } else {
            // console.log('done counts');
        }
    });
};


db.get(`event/${eventNo}`)
.then(async res => {
    fs.mkdir(path, { recursive: true }, err => {
        if (err && err.code !== 'EEXIST') {
            console.log(err);
        } else {
            outResults(res.results);
            outcounts(res.counts, res.date);
        }
    });
})
.then(() => {
    console.log(`Finished output for event ${eventNo}`);
})
.catch(err => {
    console.error(err);
});
