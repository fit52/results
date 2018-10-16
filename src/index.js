const processEvent = require('./event-input/processEvent');

let args = process.argv;

processEvent(args.slice(2));
