/**
 * Complies an 'event' object to go into the db
 * 
 * @param {object[]} results The results from the event
 * @returns {object} The event object
 */
const compileEvent = (results, noPb) => {
    let eventNumber = results[0].event.number;
    let eventDate = results[0].event.date;
    let course = results[0].event.course;
    
    let no2k = 0;
    let no5k = 0;
    let noFirstTimes = 0;
    let noPbs = 0;

    results = results.map(x => {
        x.distance = parseInt(x.distance);

        if (x.distance === 2) no2k ++;
        else if (x.distance === 5) no5k ++;

        if (x.firstEvent) noFirstTimes ++;
        if (x.pb) noPbs ++;

        return x;
    });

    let event = {
        _id: `event/${eventNumber}`,

        number: eventNumber,
        date: eventDate,
        course,

        volunteers: [],

        noPb,

        counts: {
            // 2k cannot be used as object props connot start w/ a number
            twok: no2k,
            fivek: no5k,
            total: no2k + no5k,

            firstTimes: noFirstTimes,
            pbs: noPbs,

            volunteers: 0
        },

        results: results
    };

    // console.log(event);
    return event;
};

module.exports = compileEvent;
