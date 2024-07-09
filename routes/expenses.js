const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { ifNotLoggedIn, ifLoggedIn, isAdmin, isUserProduction, isUserOrder, isAdminUserOrder } = require('../middleware')

//ยังไม่เทส

router.post('/addtype',(req, res, next) => {
    let type = req.body;
    query = "insert into expensesType (ept_name) values(?)";
    connection.query(query, [type.ept_name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
})



module.exports = router;