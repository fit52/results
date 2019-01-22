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

        let time = moment.duration(x.time);
        x.time = moment({hours: time.hours(), minutes: time.minutes(), seconds: time.seconds()}).format('HH:mm:ss');
        
        x.ageGrade = x.ageGrade + '%';
        
        x.notes = x.notes.join(', ');

        return [
            x.name,
            x.distance,
            x.time,
            x.ageGrade,
            x.noEvents,
            x.notes
        ].join(', ');
    });

    // console.log(out);

    out.sort((a, b) => {
        let aName = a.substr(0, a.indexOf(',')).toUpperCase();
        let bName = b.substr(0, b.indexOf(',')).toUpperCase();

        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
    });


    out.unshift(
        'Name, Distance, Time, Age Grade, #Event, Notes'
    );

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


    let out = [
        'Date, #2K, #5K, #Total, #FirstTimers, #PBs',
        [
        dateString,
        counts.twok,
        counts.fivek,
        counts.total,
        counts.firstTimers,
        counts.pbs
    ].join(', ')];

    fs.writeFile(`${path}/counts.csv`, out.join('\n'), err => {
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
