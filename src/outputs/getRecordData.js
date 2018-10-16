const fs = require('fs');
const moment = require('moment');

const { db } = require('../connect')();

const formatRecord = result => {
    delete result.uuid;
    delete result.pos;
    delete result.distance;
    let time = moment.duration(result.time);
    result.time = moment({minutes: time.minutes(), seconds: time.seconds()}).format('mm:ss');
    delete result.firstEvent;
    delete result.pb;
    delete result.noEvents;
    delete result.notes;

    return result;
};


db.get('global_records')
.then(res => {
    let path = `${__dirname}/../../secrets/output-data/global-records`;
    fs.mkdir(path, err => {
        if (err && err.code !== 'EEXIST') {
            console.log(err);
        }
    });

    delete res._id;
    delete res._rev;

    let ageGradeFormatted = [];
    for (let x of res.ageGrade) {
        ageGradeFormatted.push(formatRecord(x));
    }

    fs.writeFile(`${path}/ageGrade.txt`, JSON.stringify(ageGradeFormatted), err => {
        if (err) console.error(err.message);
    });

    delete res.ageGrade;

    for (let x in res) {
        let upper_cat = res[x];

        for (let y in upper_cat) {
            let lower_cat = upper_cat[y];
            let formated = [];

            for (let result of lower_cat) {
                formated.push(formatRecord(result));
            }

            fs.writeFile(`${path}/${x}${y}.txt`, JSON.stringify(formated), err => {
                if (err) console.error(err.message);
            });
        }
    }
});
