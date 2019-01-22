const fs = require('fs');

const { db } = require('../src/connect')();

let name = process.argv[2];

let selector = {
    _id: {
        $regex: '^runner/'
    }
};

if (name) {
    selector.selector.fullname = {
        $eq: name
    };
}

db.find({ selector })
.then(res => {
    let { docs } = res;

    fs.writeFile(`${__dirname}/../secrets/output-data/fullRunnerData.json`, JSON.stringify(docs, null, 2), err => {
        if (err) {
            console.error(err);
        } else {
            console.log('Done!');
        }
    });
});
