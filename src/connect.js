const Cloudant = require('@cloudant/cloudant');
// The url should never be stored on github
const { url, dbName } = require('../secrets/login.json');

/**
 * @type { { connection: Cloudant.ServerScope, db: Cloudant.DocumentScope<any> } }
 */
let connection;

/**
 * Returns a connection to the db
 */
const connect = () => {
    if (!connection) {
        const cloudant = Cloudant({
            url,
            plugins: 'promises'
        }, () => {
            // console.log('Connected to database');
        });

        const db = cloudant.use(dbName);

        connection = {
            cloudant,
            db
        };
    }

    return connection;
};

module.exports = connect;
