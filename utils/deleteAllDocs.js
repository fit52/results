const { db } = require('../src/connect')();

db.list()
.then(res => {
    const docs = res.rows.map(row => {
        return {
            _id: row.id,
            _rev: row.value.rev,
            _deleted: true
        };
    });

    db.bulk({ docs }).then(() => console.log('Reset DB')).catch(err => console.error(err.message));
});
