/**
 * JavaScript
 * src/event-input/getResults.js
 * 
 * Retrieves the raw data from the csv outputs
 * from the stopwatch and runner files
 */

const csvParse = require('csv-parse/lib/sync');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const getStopwatch = (_path) => {
    let stopwatchFile = fs.readFileSync(path.join('.', _path), 'utf8');

    let stopwatch = csvParse(stopwatchFile, { relax_column_count: true });
    // console.log(stopwatch.length);
    let date = moment.utc(stopwatch.splice(0, 1)[0][3].slice(1, 11), 'DD/MM/YYYY');

    let times = stopwatch.map(x => {
        return moment.duration(x[1].trim());
    });

    return {
        date,
        times: times
    };
};

const getFinishers = (_path) => {
    let finisherFile = fs.readFileSync(path.join('.', _path), 'utf8');

    let finishers = csvParse(finisherFile, { relax_column_count: true });

    if (finishers[finishers.length - 1].length === 0) {
        finishers.pop();
    }

    let course = parseInt(finishers.pop()[0]);

    finishers.sort((a, b) => { 
        return a[0] - b[0];
    });

    finishers = finishers.map(x => {
        x.shift();
        return x;
    });

    return {
        finishers,
        course
    };
};

const getAllData = (_path) => {
    let data = csvParse(fs.readFileSync(path.join('.', _path)), { relax_column_count: true });
    // console.log(data);
    let date_course = data.pop();

    let date = moment(date_course[0], 'DD/MM/YYYY');

    let course = parseInt(date_course[1]);

    data.sort((a, b) => {
        return moment.duration(a[2]) - moment.duration(b[2]);
    });

    let finishers = [];
    let times = [];


    data.forEach(x => {
        finishers.push(x.slice(0, 2));
        times.push(moment.duration(x[2]));
    });

    // console.log(finishers);
    
    return {
        finishers,
        times,
        date,
        course
    };
};

const mergeFinishTimes = (finishers, times, date, course) => {
    if (finishers.length !== times.length) throw new Error('Conflict in times and finishers');

    let output = [];
    for (let i = 0; i < finishers.length; i++) {
        if (['2', '5'].contains(finishers[i][1])) throw new Error('Invalid Distance');
        output.push({
            event: {
                number: 0,
                date: date,
                course: course
            },

            uuid: '',
            name: finishers[i][0],
            
            pos: i + 1,
            distance: parseInt(finishers[i][1]),

            time: times[i],
            ageGrade: 0,

            firstEvent: false,
            pb: false,
            noEvents: 0,
            notes: []
        });
    }

    return output;
};

const getResults = (files) => {
    let finishers, times, date, course;
    
    if (files.length > 1) {
        let finisherData = getFinishers(files[0]);
        finishers = finisherData.finishers;
        course = finisherData.course;
        
        let stopwatch = getStopwatch(files[1]);
        times = stopwatch.times;
        date = stopwatch.date;
    } else {
        let data = getAllData(files[0]);
        finishers = data.finishers;
        times = data.times;
        date = data.date;
        course = data.course;
    }

    return {
        results: mergeFinishTimes(finishers, times, date, course),
        date
    };
};

module.exports = getResults;
