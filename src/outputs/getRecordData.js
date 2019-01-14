const fs = require('fs');
const moment = require('moment');

const { db } = require('../connect')();

const formatRecord = (result, ageGrade = false) => {
    let out = [];

    out.push(result.name);

    if (ageGrade) {
        out.push(result.ageGrade + '%');
    } else {
        let time = moment.duration(result.time);
        out.push(moment({ hours: time.hours(), minutes: time.minutes(), seconds: time.seconds()}).format('HH:mm:ss'));
    }

    out.push(result.event.number);
    out.push(moment(result.event.date).format('DD/MM/YYYY'));
    out.push(result.event.course);

    return out.join(',');
};


db.get('global_records')
.then(res => {
    let path = `${__dirname}/../../secrets/output-data/global-records`;
    fs.mkdir(path, { recursive: true }, err => {
        if (err && err.code !== 'EEXIST') {
            console.log(err);
        } else {
            delete res._id;
            delete res._rev;

            let ageGradeFormatted = [];

            ageGradeFormatted.push([
                'Name', 'Time', 'Event', 'Date', 'Course'
            ]);
            for (let x of res.ageGrade) {
                ageGradeFormatted.push(formatRecord(x, true));
            }

            fs.writeFile(`${path}/ageGrade.csv`, ageGradeFormatted.join('\n'), err => {
                if (err) console.error(err.message);
            });

            // Need to delete ageGrade as we iterate over the object; not including age grade
            delete res.ageGrade;

            for (let x in res) {
                let upper_cat = res[x];

                for (let y in upper_cat) {
                    let lower_cat = upper_cat[y];
                    let formated = [];

                    formated.push(
                        'Name, Time, Event, Date, Course'
                    );

                    for (let result of lower_cat) {
                        formated.push(formatRecord(result));
                    }

                    fs.writeFile(`${path}/${x}${y}.csv`, formated.join('\n'), err => {
                        if (err) console.error(err.message);
                    });
                }
            }
        }
    });
})
.then(() => console.log('Done!'));
