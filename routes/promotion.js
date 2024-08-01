const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { ifNotLoggedIn, ifLoggedIn, isAdmin, isUserProduction, isUserOrder, isAdminUserOrder } = require('../middleware')

router.post('/adddis', (req, res, next) => {
    let Data = req.body;
    console.log('Body:', req.body); // Check request body

    const query = `
        INSERT INTO discount (dc_name, dc_detail, dc_diccountprice, datestart, dateend,deleted_at)
        VALUES (?, ?, ?, ?, ?,?);
    `;
    const values = [
        Data.dc_name,
        Data.dc_detail,
        Data.dc_diccountprice,
        Data.datestart,
        Data.dateend,
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

router.get('/readdis', (req, res, next) => {
    var query = 'select *,DATE_FORMAT(discount.datestart, "%d-%m-%Y") AS datestart,DATE_FORMAT(discount.dateend, "%d-%m-%Y") AS dateend from discount'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

router.get('/readdis/:id', (req, res, next) => {
    const id = req.params.id;
    var query = `SELECT discount.*, 
    DATE_FORMAT(datestart, '%Y-%m-%d') AS datestart,
    DATE_FORMAT(dateend, '%Y-%m-%d') AS dateend
     FROM discount WHERE dc_id = ?`;
  
    connection.query(query, [id], (err, results) => {
      if (!err) {
        if (results.length > 0) {
          return res.status(200).json(results[0]);
        } else {
          return res.status(404).json({ message: "Staff not found" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  });


  router.patch('/update/:id' ,(req, res, next) => {
    const dc_id = req.params.id;
    const discount = req.body;
  
    
      var query = "UPDATE discount SET dc_name=?, dc_detail=?, dc_diccountprice=?, datestart=?, dateend=? WHERE dc_id=?";
      connection.query(query, [discount.dc_name, discount.dc_detail, discount.dc_diccountprice, discount.datestart, discount.dateend, dc_id], (err, results) => {
        if (!err) {
          if (results.affectedRows === 0) {
            console.error(err);
            return res.status(404).json({ message: "id does not found" });
          }
          return res.status(200).json({ message: "update success" });
        } else {
          return res.status(500).json(err);
        }
      });
    
  });



router.get('/readfree', (req, res, next) => {
    var query = 'select *,DATE_FORMAT(discount.datestart, "%d-%m-%Y") AS datestart,DATE_FORMAT(discount.dateend, "%d-%m-%Y") AS dateend from discount'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

  //addpro free
//   router.post('/addfree', (req, res, next) => {
//     // const ingredient_lot = req.body;
//     // const ingredient_lot_detail = req.body;
//     // const promotion = req.body.promotion[0]; // Access the first item in the productionOrder array
//     const { pm_name, pm_datestart, pm_dateend, promotiondetail } = req.body;
//     // const promotiondetail = req.body.promotiondetail;


//     const query = "INSERT INTO promotion (pm_name ,pm_datestart,pm_dateend,deleted_at) VALUES (?,?,?,null)";

//     connection.query(query, [pm_name,pm_datestart,pm_dateend], (err, results) => {

//         if (!err) {
//             const pmd_id = results.insertId;

//             const values = promotiondetail.map(detail => [
//                 detail.pm_id,
//                 detail.smbuy_id,
//                 detail.smfree_id,
//                 null // กำหนดให้ deleted_at เป็น null
//             ]);

//             const detailQuery = `
//                 INSERT INTO promotiondetail (pm_id, smbuy_id, smfree_id, deleted_at) 
//                 VALUES ?
//             `;

//             connection.query(detailQuery, [values], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 } else {
//                     return res.status(200).json({ message: "success", pmd_id });
//                 }
//             });
//         } else {
//             console.error("MySQL Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         }
//     });

// });

//เพิ่ม transaction ยังไม่เทส
router.post('/addfree', (req, res, next) => {
    const { pm_name, pm_datestart, pm_dateend, promotiondetail } = req.body;

    // Start the transaction
    connection.beginTransaction((err) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }

        const query = "INSERT INTO promotion (pm_name, pm_datestart, pm_dateend, deleted_at) VALUES (?,?,?,null)";

        connection.query(query, [pm_name, pm_datestart, pm_dateend], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    console.error("MySQL Error:", err);
                    return res.status(500).json({ message: "error", error: err });
                });
            }

            const pmd_id = results.insertId;

            const values = promotiondetail.map(detail => [
                pmd_id, // Use the inserted pm_id
                detail.smbuy_id,
                detail.smfree_id,
                null // Set deleted_at to null
            ]);

            const detailQuery = `
                INSERT INTO promotiondetail (pm_id, smbuy_id, smfree_id, deleted_at) 
                VALUES ?
            `;

            connection.query(detailQuery, [values], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ message: "error", error: err });
                    });
                }

                // Commit the transaction
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("MySQL Error:", err);
                            return res.status(500).json({ message: "error", error: err });
                        });
                    }

                    return res.status(200).json({ message: "success", pmd_id });
                });
            });
        });
    });
});




module.exports = router;