const fs = require('fs');

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
    let data = JSON.stringify(res.docs);

    fs.writeFileSync(`${__dirname}/../../secrets/output-data/runnerData.txt`, data);
    console.log(`Written ${res.docs.length} runners to file`);
})
.catch(err => {
    console.log(err.message);
});
