/**
 * JavaScript
 * Updates 'event/stats' to 'event/count'
 * to comply w/ #5
 */

const { db } = require('../src/connect')();

let docs;
db.find({
    selector: {
        _id: {
            $regex: '^event/'
        }
    }
}).then(res => {
    docs = res.docs.map(doc => {
        if (doc.counts) {
            console.log(`'${doc._id}' already using 'count'`);
            return doc;
        }
        const { stats, ...restOfDoc } = doc;
        return {
            ...restOfDoc,

            counts: {

                twok: stats.no2k,
                fivek: stats.no5k,
                total: stats.nototal,

                firstTimers: stats.noFirstTimes,
                pbs: stats.noPbs,

                volunteers: stats.noVolunteers
            }
        };
    });

    db.bulk({ docs }).then(() => console.log('done!')).catch(err => console.error(err));
    
});
