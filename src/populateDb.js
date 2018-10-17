const csvParse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

const { db } = require('./connect')();

let runners = csvParse(fs.readFileSync(path.join('.', process.argv[2])));

let data = [];

runners.forEach(runner => {
    if (!['f', 'm'].includes(runner[3].toLowerCase())) throw new Error(`${runner.slice(0, 2)} Invalid gender: ${runner[3]}. Should be 'f' or 'm'`);
    if (![0, 1, 2, 3].includes(parseInt(runner[5]))) throw new Error(`Invalid exercise value: ${runner[5]}. Should be 0-3`);
    
    let _uuid = uuid();
    
    data.push({
        _id: `runner/${_uuid}`,
        uuid: _uuid,

        firstname: runner[0],
        lastname: runner[1],
        fullname: `${runner[0]} ${runner[1]}`,
        dob: new Date(runner[2]),
        gender: runner[3].toLowerCase(),
        email: runner[4],
        exercise: runner[5],
        IBM: Math.abs(parseInt(runner[6]) - 1),
        optin: 'y',

        stats: {
            records2k: {
                fastest: undefined,
                slowest: undefined
            },
    
            records5k: {
                fastest: undefined,
                slowest: undefined
            },
    
            recordsAgeGrade: {
                best: undefined,
                worst: undefined
            },

            noPbs: 0,
            
            no2k: 0,
            no5k: 0,
            noTotalEvents: 0,
            achievements: [],
            volunteering: []
        },

        eventList: []
    });
});

if (process.argv[3]) {
    let arr = new Array(5).fill({});

    data.push({
        _id: 'global_records',
        fastest2k: {
            female: arr,
            male: arr
        },

        fastest5k: {
            female: arr,
            male: arr
        },

        ageGrade: arr
    });
}

// console.log(data);
db.bulk({ docs: data }).then(res => console.log(`Added ${res.length} runners`)).catch(err => console.error(err.message));
