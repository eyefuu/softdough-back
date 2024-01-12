const express = require("express");
const connection = require("../connection");
const router = express.Router();

router.post('/add', (req, res, next) => {
    let ingredientData = req.body;
    let ind_stock = 0; // ตั้งค่าเริ่มต้นเป็น 0

    // กำหนดค่า status เป็น 'ไม่มี'
    let status = "0";

    const query = `
        INSERT INTO ingredient (ind_name, un_purchased, qtyminimum, un_ind, qty_per_unit, ind_stock, status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
        ingredientData.ind_name,
        ingredientData.un_purchased,
        ingredientData.qtyminimum,
        ingredientData.un_ind,
        ingredientData.qty_per_unit,
        ind_stock,
        status,
    ];

    connection.query(query, params, (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

//เพิ่มเรื่องจอยตาราง
router.get('/read', (req, res, next) => {
    var query = `
    SELECT ingredient.*, 
           unit1.un_name AS un_purchased_name,
           unit2.un_name AS un_ind_name 
    FROM ingredient 
    LEFT JOIN unit AS unit1 ON ingredient.un_purchased = unit1.un_id
    LEFT JOIN unit AS unit2 ON ingredient.un_ind = unit2.un_id
`;
    //LEFT JOIN แทน JOIN เพื่อให้ข้อมูลจากตาราง ingredient แสดงออกมาทั้งหมด แม้ว่าข้อมูลใน unit อาจจะไม่ตรงกับเงื่อนไขใน JOIN

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});


// router.get('/read/:id', (req, res, next) => {
//     const ind_id = req.params.id;
//     var query = 'SELECT * FROM ingredient WHERE ind_id = ?';

//     connection.query(query, [ind_id], (err, results) => {
//         if (!err) {
//             if (results.length > 0) {
//                 return res.status(200).json(results[0]);
//             } else {
//                 return res.status(404).json({ message: "ingredient not found" });
//             }
//         } else {
//             return res.status(500).json(err);
//         }
//     });
//   });
router.get('/read/:id', (req, res, next) => {
    const ind_id = req.params.id;
    var query = `
    SELECT ingredient.*, 
    unit1.un_name AS un_purchased_name,
    unit2.un_name AS un_ind_name 
FROM ingredient 
LEFT JOIN unit AS unit1 ON ingredient.un_purchased = unit1.un_id
LEFT JOIN unit AS unit2 ON ingredient.un_ind = unit2.un_id
WHERE ingredient.ind_id = ?;  -- Fixed the alias here
    `;

    connection.query(query, [ind_id], (err, results) => {
        if (!err) {
            if (results.length > 0) {
                return res.status(200).json(results[0]);
            } else {
                return res.status(404).json({ message: "ingredient not found" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});



router.get('/unit', (req, res, next) => {
    var query = 'select *from unit'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

router.patch('/update/:id', (req, res, next) => {
    const ingredientId = req.params.id;
    const ingredientData = req.body;
    // const ind_stock = ingredientData.ind_stock || 0; // ถ้าไม่ได้รับค่า ind_stock ให้เป็น 0

    // ตรวจสอบและกำหนดค่า status หากต้องการ
    // let status = ingredientData.status || "0"; // ถ้าไม่ได้รับค่า status ให้เป็น "0"

    const query = `
        UPDATE ingredient 
        SET ind_name = ?, un_purchased = ?, qtyminimum = ?, un_ind = ?, qty_per_unit = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ind_id = ?;
    `;
    const params = [
        ingredientData.ind_name,
        ingredientData.un_purchased,
        ingredientData.qtyminimum,
        ingredientData.un_ind,
        ingredientData.qty_per_unit,
        ingredientId
    ];

    connection.query(query, params, (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

// router.patch('/update/:own_id', (req, res, next) => {
//     const own_id = req.params.own_id;
//     const owner = req.body;
//     var query = "UPDATE owner SET own_username=?, own_password=?, own_name=? WHERE own_id=?";
//     connection.query(query, [owner.own_username, owner.own_password, owner.own_name, own_id], (err, results) => {
//         if (!err) {
//             if (results.affectedRows === 0) {
//                 console.error(err);
//                 return res.status(404).json({ message: "id does not found" });
//             }
//             return res.status(200).json({ message: "update success" });
//         } else {
//             return res.status(500).json(err);
//         }
//     });
// });


//lot ingrediant
//ถ้ารวมสมประกอบไม่ได้ใช้
router.post('/addLotIngrediant', (req, res, next) => {
    let ingredient_lot = req.body;
    query = "INSERT INTO ingredient_lot (indl_id) VALUES (?)";
    connection.query(query, [ingredient_lot.indl_id,], (err, results) => {
        if (!err) {
            // ส่ง response กลับเมื่อไม่มี error และ query สำเร็จ
            return res.status(200).json({ message: "success", indl_id: results.insertId });
        } else {
            // แสดง error และส่ง response กลับเมื่อเกิด error
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

//ลองรวมใหม่
router.post('/addLotIngrediantnew', (req, res, next) => {
    const ingredient_lot = req.body;
    const ingredient_lot_detail = req.body;

    const query = "INSERT INTO ingredient_lot (indl_id) VALUES (?)";
    connection.query(query, [ingredient_lot.indl_id], (err, results) => {
        if (!err) {
            const indl_id = results.insertId;

            const values = ingredient_lot_detail.map(detail => [
                detail.ind_id,
                indl_id,
                detail.qtypurchased,
                detail.date_exp,
                detail.price
            ]);

            const detailQuery = `
                INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
                VALUES ?
            `;

            connection.query(detailQuery, [values], (err, results) => {
                if (err) {
                    console.error("MySQL Error:", err);
                    return res.status(500).json({ message: "error", error: err });
                } else {
                    return res.status(200).json({ message: "success", indl_id });
                }
            });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});



// router.post('/addLotIngrediantdetail', (req, res, next) => {
//     const ingredient_lot_detail = req.body; // Extract data from the request body

//     // SQL query to insert data into the table
//     const query = `
//         INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     // Execute the SQL query
//     connection.query(query, [
//         ingredient_lot_detail.ind_id, 
//         ingredient_lot_detail.indl_id, 
//         ingredient_lot_detail.qtypurchased, 
//         ingredient_lot_detail.date_exp, 
//         ingredient_lot_detail.price
//     ], (err, results) => {
//         if (err) {
//             console.error("MySQL Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         } else {
//             return res.status(200).json({ message: "success" });
//         }
//     });
// });

//ถ้ารวมสมประกอบไม่ได้ใช้
//เพิ่มได้ตัวเดียว
router.post('/addLotIngrediantdetail', (req, res, next) => {
    const ingredient_lot_detail = req.body;

    const query = `
        INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        ingredient_lot_detail.ind_id, 
        ingredient_lot_detail.indl_id, 
        ingredient_lot_detail.qtypurchased, 
        ingredient_lot_detail.date_exp, 
        ingredient_lot_detail.price
    ], (err, results) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        } else {
            return res.status(200).json({ message: "success", data: ingredient_lot_detail });  // Sending back the added data
        }
    });
});
//ถ้ารวมสมประกอบไม่ได้ใช้
//เพิ่มได้หลายตัว
router.post('/addLotIngrediantdetails', (req, res, next) => {
    const ingredient_lot_details = req.body;

    const values = ingredient_lot_details.map(detail => [
        detail.ind_id,
        detail.indl_id,
        detail.qtypurchased,
        detail.date_exp,
        detail.price
    ]);

    const query = `
        INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
        VALUES ?
    `;

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        } else {
            return res.status(200).json({ message: "success", data: ingredient_lot_details });
        }
    });
});


router.get('/ingredientLotDetails/:indl_id', (req, res, next) => {
    const indl_id = req.params.indl_id;

    const query = `
        SELECT ingredient_lot_detail.* ,
        ingredientname.ind_name AS ind_name ,
        DATE_FORMAT(date_exp, '%Y-%m-%d') AS date_exp 
        FROM ingredient_lot_detail
        LEFT JOIN ingredient AS ingredientname ON ingredient_lot_detail.ind_id  = ingredientname.ind_id
        WHERE indl_id = ?
    `;

    connection.query(query, [indl_id], (err, results) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        } else {
            return res.status(200).json({ message: "success", data: results });
        }
    });
});



// router.get('/readLotIngrediantdetail', (req, res, next) => {
//     const indlde_id = req.params.id;
//     var query = `
//     SELECT ingredient_lot_detail.*, 
//     ingredient.ind_name AS ind_name,
// FROM Ingredient_lot_detail 
// LEFT JOIN ingredient AS ingredientname ON ingredient_lot_detail.ind_id = ingredientname.ind_id
// WHERE Ingredient_lot_detail.indlde_id  = ?;  
//     `;

//     connection.query(query, [indlde_id], (err, results) => {
//         if (!err) {
//             if (results.length > 0) {
//                 return res.status(200).json(results[0]);
//             } else {
//                 return res.status(404).json({ message: "ingredient not found" });
//             }
//         } else {
//             return res.status(500).json(err);
//         }
//     });
// });

//ถ้ารวมสมประกอบไม่ได้ใช้
// router.delete('/ingredientLotDetails/:indlde_id ', (req, res, next) => {
//     const indlde_id = req.params.indlde_id ;

//     const query = `
//         DELETE FROM Ingredient_lot_detail 
//         WHERE indlde_id  = ?
//     `;

//     connection.query(query, [indlde_id], (err, results) => {
//         if (err) {
//             console.error("MySQL Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         } else {
//             return res.status(200).json({ message: "success", data: results });
//         }
//     });
// });
router.delete('/ingredientLotDetails/:indlde_id', (req, res, next) => {
    const indlde_id = req.params.indlde_id;

    // Validation: Check if indlde_id is a number (assuming it's a numeric ID)
    if (isNaN(indlde_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const query = `
        DELETE FROM Ingredient_lot_detail 
        WHERE indlde_id = ?
    `;

    connection.query(query, [indlde_id], (err, results) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        } else if (results.affectedRows === 0) { // Check if any rows were affected
            return res.status(404).json({ message: "ID not found", data: results });
        } else {
            return res.status(200).json({ message: "success", data: results });
        }
    });
});
//ใช้ CONCAT ในคำสั่ง SQL เพื่อรวมค่า L กับค่า indl_id และใช้ LPAD เพื่อเติมเลข 0 ให้ครบ 4 ตัวอักษร
//DATE_FORMAT function ของ MySQL
router.get('/readlot', (req, res, next) => {
    var query = `
    SELECT 
        indl_id,
        CONCAT('L', LPAD(indl_id, 7, '0')) AS indl_id_name,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(update_at, '%Y-%m-%d') AS update_at
    FROM Ingredient_lot 
    ORDER BY created_at DESC
`;

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});
router.get('/readlot/:id', (req, res, next) => {
    const indl_id = req.params.id;
    var query = `
    SELECT 
        indl_id,
        CONCAT('L', LPAD(indl_id, 7, '0')) AS indl_id_name,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(update_at, '%Y-%m-%d') AS update_at
    FROM 
        ingredient_lot 
    WHERE 
        indl_id = ?
    `;

    connection.query(query, [indl_id], (err, results) => {
        if (!err) {
            if (results.length > 0) {
                return res.status(200).json(results[0]);
            } else {
                return res.status(404).json({ message: "ingredient not found" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});
// editยังไม่ลอง
router.put('/editLotIngrediant/:indl_id', (req, res, next) => {
    const indl_id = req.params.indl_id;
    const ingredient_lot = req.body;
    const ingredient_lot_detail = req.body;

    const updateQuery = "UPDATE ingredient_lot SET indl_id = ? WHERE indl_id = ?";
    connection.query(updateQuery, [ingredient_lot.indl_id, indl_id], (err, results) => {
        if (!err) {
            const detailValues = ingredient_lot_detail.map(detail => [
                detail.ind_id,
                indl_id,
                detail.qtypurchased,
                detail.date_exp,
                detail.price
            ]);

            const detailQuery = `
                INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
                VALUES ?
                ON DUPLICATE KEY UPDATE
                qtypurchased = VALUES(qtypurchased),
                date_exp = VALUES(date_exp),
                price = VALUES(price)
            `;

            connection.query(detailQuery, [detailValues], (err, results) => {
                if (err) {
                    console.error("MySQL Error:", err);
                    return res.status(500).json({ message: "error", error: err });
                } else {
                    return res.status(200).json({ message: "success", indl_id });
                }
            });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

// router.post('/updateLotIngrediant', (req, res, next) => {
//     const ingredient_lot = req.body;
//     const ingredient_lot_detail = req.body;

//     // รับค่า ID ที่ต้องการแก้ไข
//     const indl_id = ingredient_lot.indl_id;

//     // สำหรับ ingredient_lot, หากคุณต้องการแก้ไขค่าใด ๆ ให้เพิ่มเงื่อนไขและค่าที่ต้องการให้เปลี่ยนแปลง
//     const lotUpdateQuery = `
//         UPDATE ingredient_lot 
//         SET [column_name1] = ?, [column_name2] = ?, ... 
//         WHERE indl_id = ?
//     `;
//     connection.query(lotUpdateQuery, [/* values here */], (err, results) => {
//         if (err) {
//             console.error("MySQL Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         } else {
//             // สำหรับ ingredient_lot_detail, หากคุณต้องการแก้ไขค่าใด ๆ ให้เพิ่มเงื่อนไขและค่าที่ต้องการให้เปลี่ยนแปลง
//             const values = ingredient_lot_detail.map(detail => [
//                 detail.ind_id,
//                 indl_id,
//                 detail.qtypurchased,
//                 detail.date_exp,
//                 detail.price
//             ]);

//             const detailUpdateQuery = `
//                 UPDATE Ingredient_lot_detail 
//                 SET [column_name1] = ?, [column_name2] = ?, ... 
//                 WHERE indl_id = ?
//             `;

//             connection.query(detailUpdateQuery, [/* values here */], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 } else {
//                     return res.status(200).json({ message: "success", indl_id });
//                 }
//             });
//         }
//     });
// });


module.exports = router;