const mysql = require("mysql2");

const db = mysql.createConnection(
    // Run dev
    // {
    //     host: 'loclalhost',
    //     port:'3306',
    //     user:'root',
    //     password:'1234',
    //     database:'softdough2'
    //     // database:'softdough'
    // }

    // Production
        {
        host: 'db',
        port:'3306',
        user:'root',
        password:'P@ssword1234',
        database:'softdough2'
        // database:'softdough'
    }
);

db.connect((err) => {
    if (err) {
        console.error("Connection failed. Error:", err);
    } else {
        console.log("Connection successful.");
    }
});

module.exports = db;