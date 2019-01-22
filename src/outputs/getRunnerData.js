const fs = require('fs');
const moment = require('moment');

const { db } = require('../connect')();

db.find({
    selector: {
        _id: {
            $regex: '^runner/'
        }
    }
})
.then(res => {
    // console.log(res.docs);
    let runners = res.docs;

    let formatted = [];

    for (let runner of runners) {
        let temp = [];

        // console.log(runner);

        temp.push(runner.fullname);
        temp.push(runner.stats.no2k);
        temp.push(runner.stats.no5k);
        temp.push(runner.stats.noTotalEvents);
        for (let i = 2; i <= 5; i += 3) {
            if (runner.stats[`records${i}k`].fastest) {
                let time = moment.duration(runner.stats[`records${i}k`].fastest.time);
                temp.push(moment({ hours: time.hours(), minutes: time.minutes(), seconds: time.seconds()}).format('HH:mm:ss'));
            } else {
                temp.push('');
            }
        }

        temp.push(runner.stats.noPbs);
        if (runner.stats.recordsAgeGrade.best) {
            temp.push(runner.stats.recordsAgeGrade.best.ageGrade + '%');
        } else {
            temp.push('');
        }

        temp.push('');

        formatted.push(temp);
        
    }

    // console.log(formatted);
    formatted.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
    });
    // console.log(formatted);

    formatted.unshift([
        'Full Name', '2k', '5k', 'Total', '2k PB', '5k PB', '#PBs', 'Best AG', 'Vol'
    ]);

    let output = formatted.map(x => x.join(',')).join('\n');

    fs.writeFileSync(`${__dirname}/../../secrets/output-data/runnerData.csv`, output);
    console.log('done!');
})
.catch(err => {
    console.log(err.message);
});
