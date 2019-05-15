/**
 * JavaScript
 *
 * Gets the emails of the participants of the
 * runners in an event
 *
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
    host: 'smtp.hursley.ibm.com',
    port: 25,
});

const email = new Email({
    preview: false,
    send: true, // Set to true to actually send emails
    transport,
    message: {
        from: 'hursley.fit52@gmail.com' // Set the email address to send from
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
        'firstname',
        'email'
    ]
})
.then(({ docs }) => {
    let event = docs.find(value => value._id === `event/${eventNo}`);
    docs.splice(docs.indexOf(event), 1);

    for (let runner of docs) {
        let result = event.results.find(value => value.uuid === runner.uuid);

        let timeMoment = moment.duration(result.time);
        let time = moment({
            hours: timeMoment.hours(),
            minutes: timeMoment.minutes(),
            seconds: timeMoment.seconds()
        }).format('mm:ss');

        email.send({
            template: `${__dirname}/emails/fit52-results`,
            message: {
                to: runner.email
            },
            locals: {
                eventNo,
                date: moment(result.event.date).format('DD/MM/YYYY'),
                forename: runner.firstname,
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
