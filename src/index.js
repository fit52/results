const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
    boolean: [ 'noPb' ],
    // stopEarly: true
});

const processEvent = require('./event-input/processEvent');

console.log(argv);

processEvent(argv);
