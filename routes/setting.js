const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { ifNotLoggedIn, ifLoggedIn, isAdmin, isUserProduction, isUserOrder, isAdminUserOrder } = require('../middleware')

router.post('/addaddreess', (req, res, next) => {
    let Data = req.body;
    console.log('Body:', req.body); // Check request body

    const query = `
        INSERT INTO shop (sh_name, sh_address, sh_tel, sh_province, sh_district,sh_ampher,sh_zipcode,deleted_at)
        VALUES (?, ?, ?, ?, ?,?,?,?);
    `;
    const values = [
        Data.sh_name,
        Data.sh_address,
        Data.sh_tel,
        Data.sh_province,
        Data.sh_district,
        Data.sh_ampher,
        Data.sh_zipcode,
        null
    ];

    connection.query(query, values, (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

router.get('/address', (req, res, next) => {
    var query = 'select * from shop'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})


module.exports = router;