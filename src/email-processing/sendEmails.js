/**
 * JavaScript
 * 
 * Gets the emails of the participants of the
 * runners in an event
 * 
 * Testing should be done with event 10
 */

const Email = require('email-templates');
const minimist = require('minimist');
const moment = require('moment');
const nodemailer = require('nodemailer');
const { db } = require('../connect')();

const formatAgeGrade = (ageGrade) => {
    let normalAge = ageGrade;
    if (typeof ageGrade === 'number' && ageGrade < 1) {
        normalAge = (ageGrade * 100).toFixed(2);
    }
    return normalAge;
};

const transport = nodemailer.createTransport({
    host: '', // Add the host here
    port: 1000, // And the port here
});

const email = new Email({
    // preview: false, // Uncomment this to stop opening previews
    // send: true, // Uncomment this to send emails
    transport,
    message: {
        from: 'example@example.com' // Set the email address to send from
    },
    juiceResources: {
        webResources: {
            relativeTo: `${__dirname}/css`
        }
    }
});


const argv = minimist(process.argv.slice(2));

if (argv._.length === 0) throw new Error('No Event provided');

const { _: [ eventNo ] } = argv;
if (!/\d+/.test(eventNo)) throw new Error('Invalid Event provided');

db.find({
    selector: {
        // Uncomment this block to use the real email addresses
        // _id: { $regex: `^(runner/|event/${eventNo})` },
        // eventList: {
        //     $or: [
        //         { $exists: false },
        //         {
        //             $elemMatch: {
        //                 'event.number': eventNo
        //             }
        //         }
        //     ]
        // }
        _id: `event/${eventNo}`
    },
    fields: [
        '_id',
        'results',
        'uuid',
        'forename',
        'email'
    ]
})
.then(({ docs }) => {
    let event = docs.find(value => value._id === `event/${eventNo}`);
    docs.splice(docs.indexOf(event), 1);

    // Remove to use real email addresses
    docs = require('./fakeEmails.json');

    for (let runner of docs) {
        let result = event.results.find(value => value.uuid === runner.uuid);

        let timeMoment = moment.duration(result.time);
        let time = moment({hours: timeMoment.hours(), minutes: timeMoment.minutes(), seconds: timeMoment.seconds()}).format('mm:ss');

        email.send({
            template: `${__dirname}/emails/fit52-results`,
            message: {
                to: runner.email
            },
            locals: {
                date: moment(result.event.date).format('DD/MM/YYYY'),
                forename: result.name, // This should be changed to runner.forename
                distance: result.distance,
                pb: result.pb,
                time,
                ageGrade: `${formatAgeGrade(result.ageGrade)}%`
            }
        })
        .catch(err => console.error(err.message));

    }
})
.then(() => console.log('Done!'))
.catch(err => console.error(err.message));
