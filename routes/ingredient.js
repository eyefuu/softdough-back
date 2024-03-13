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

// ให้มีtype of unit
router.get('/unit', (req, res, next) => {
    var query = 'select *from unit where type="1"'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

//เผื่อadd unit เพิ่มเติม
router.post('/unit', (req, res, next) => {
    let unit = req.body;
    query = "insert into unit (un_name,type) values(?,'1')";
    connection.query(query, [unit.un_name,unit.type], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
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
    // const ingredient_lot = req.body;
    // const ingredient_lot_detail = req.body;
    const ingredient_lot = req.body.ingredient_lot;
    const ingredient_lot_detail = req.body.ingredient_lot_detail;


    const query = "INSERT INTO ingredient_lot (indl_id) VALUES (?)";
    connection.query(query, [ingredient_lot.indl_id], (err, results) => {
        if (!err) {
            const indl_id = results.insertId;

            // const values = ingredient_lot_detail.map(detail => [
            //     detail.ind_id,
            //     indl_id,
            //     detail.qtypurchased,
            //     detail.date_exp,
            //     detail.price
            // ]);

            // const detailQuery = `
            //     INSERT INTO ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
            //     VALUES ?
            // `;
            const values = ingredient_lot_detail.map(detail => [
                detail.ind_id,
                indl_id,
                detail.qtypurchased,
                detail.date_exp,
                detail.price,
                null // กำหนดให้ deleted_at เป็น null
            ]);

            const detailQuery = `
                INSERT INTO ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price, deleted_at) 
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

//ไม่ใช้
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
        DATE_FORMAT(updated_at, '%Y-%m-%d') AS updated_at
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
// นับได้แต่มีปห key un key something
// ยังไม่ทำกรณีมากกว่า
//2แถว อัปเดตเป็นค่าเดียวกันทั้งสองแถว อาจจะเปลี่ยนเป็นเช็ค ind_id แล้วลบเอามั้ย
//มีปัญหา
// router.patch('/editLotIngrediant/:indl_id', (req, res, next) => {
//     const indl_id = req.params.indl_id;
//     const dataToEdit = req.body.dataToEdit;

//     if (!dataToEdit || dataToEdit.length === 0) {
//         return res.status(400).json({ message: "error", error: "No data to edit provided" });
//     }

//     // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการแก้ไขข้อมูล
//     const updateValues = dataToEdit.map(detail => [
//         detail.ind_id,
//         indl_id,
//         detail.qtypurchased,
//         detail.date_exp,
//         detail.price
//     ]);

//     // ตรวจสอบจำนวนแถวที่มีอยู่
//     const existingRowCountQuery = "SELECT COUNT(*) as rowCount FROM Ingredient_lot_detail WHERE indl_id = ?";
//     connection.query(existingRowCountQuery, [indl_id], (err, results) => {
//         if (err) {
//             console.error("MySQL Existing Row Count Query Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         }

//         const existingRowCount = results[0].rowCount;

//         // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//         let updateQuery = "";

//         if (dataToEdit.length == existingRowCount) {
//             // จำนวนแถวที่ต้องการแก้ไขมากกว่าหรือเท่ากับจำนวนแถวที่มีอยู่
//             // ดำเนินการอัปเดตข้อมูล
//             updateQuery = `
//                 UPDATE Ingredient_lot_detail
//                 SET
//                     ind_id = ?,
//                     qtypurchased = ?,
//                     date_exp = ?,
//                     price = ?
//                 WHERE
//                     indl_id = ?;
//             `;

//             console.log("dataToEdit.length:", dataToEdit.length);
//             console.log("existingRowCount:", existingRowCount);

//             // ใช้ loop ในการทำ update ทีละรายการ
//             dataToEdit.forEach(detail => {
//                 const updateDetailValues = [
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price,
//                     detail.ind_id,
//                     indl_id
//                 ];

//                 connection.query(updateQuery, updateDetailValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Update Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     // คำสั่งที่ต้องการทำหลังจาก update แต่ละรายการ
//                     console.log(`Updated record for ind_id ${detail.ind_id}`);
//                 });
//             });

//             // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//             const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//             connection.query(updateLotQuery, [indl_id], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Update Lot Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 console.log("Transaction Complete.");
//                 res.status(200).json({ message: "success", indl_id });
//             });
//         }
// //         console.log("dataToEdit.length:", dataToEdit.length);
// //         console.log("existingRowCount:", existingRowCount);
// //         if (dataToEdit.length == existingRowCount) {
// //             // จำนวนแถวที่ต้องการแก้ไขมีจำนวนเท่ากับจำนวนแถวที่มีอยู่
// //             // ดำเนินการอัปเดตข้อมูล
// //             const updateQuery = `
// //     UPDATE Ingredient_lot_detail
// //     SET
// //         qtypurchased = ?,
// //         date_exp = ?,
// //         price = ?,
// //         ind_id = ?
// //     WHERE
// //         indl_id = ?;
// // `;

// //             // ให้ใช้ forEach ในการทำ update ทีละรายการ
// //             dataToEdit.forEach(detail => {
// //                 const updateValues = [
// //                     detail.qtypurchased,
// //                     detail.date_exp,
// //                     detail.price,
// //                     detail.ind_id,
// //                     indl_id
// //                 ];

// //                 connection.query(updateQuery, updateValues, (err, results) => {
// //                     if (err) {
// //                         console.error("MySQL Update Query Error:", err);
// //                         return res.status(500).json({ message: "error", error: err });
// //                     }

// //                     // คำสั่งที่ต้องการทำหลังจาก update แต่ละรายการ
// //                 });
// //             });


// //             // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
// //             const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
// //             connection.query(updateLotQuery, [indl_id], (err, updateLotResults) => {
// //                 if (err) {
// //                     console.error("MySQL Update Lot Query Error:", err);
// //                     return res.status(500).json({ message: "error", error: err });
// //                 }

// //                 console.log("Transaction Complete.");
// //                 res.status(200).json({ message: "success", indl_id });
// //                 console.log(req.body);
// //             });
// //         }

//         else if (dataToEdit.length > existingRowCount) {
//             // จำนวนแถวที่ต้องการแก้ไขมากกว่าจำนวนแถวที่มีอยู่
//             // ดำเนินการเพิ่มข้อมูลใหม่หรือทำงานอื่น ๆ ที่ต้องการ
//             // เช่น INSERT ข้อมูลใหม่

//             // สร้าง SQL query สำหรับ insert หรือ update ข้อมูล
//             const upsertQuery = `
//                 INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
//                 VALUES (?, ?, ?, ?, ?)
//                 ON DUPLICATE KEY UPDATE
//                     qtypurchased = VALUES(qtypurchased),
//                     date_exp = VALUES(date_exp),
//                     price = VALUES(price);
//             `;

//             // ให้ใช้ forEach ในการทำ insert ทีละรายการ
//             dataToEdit.forEach(detail => {
//                 const upsertValues = [
//                     detail.ind_id,
//                     indl_id,
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price
//                 ];

//                 connection.query(upsertQuery, upsertValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Upsert Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     // คำสั่งที่ต้องการทำหลังจาก insert หรือ update แต่ละรายการ
//                 });
//             });

//             // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//             const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//             connection.query(updateLotQuery, [indl_id], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Update Lot Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 console.log("Transaction Complete.");
//                 res.status(200).json({ message: "success", indl_id });
//             });
//         }


//         else {
//             // จำนวนแถวที่ต้องการแก้ไขน้อยกว่าจำนวนแถวที่มีอยู่
//             // ดำเนินการลบข้อมูลที่เกิน
//             const deleteQuery = `
//                 DELETE FROM Ingredient_lot_detail
//                 WHERE (ind_id = ? AND indl_id = ?)
//                    OR (ind_id = ? AND indl_id = ?)
//                 LIMIT ?;
//             `;

//             const deleteValues = dataToEdit.map(detail => [
//                 detail.ind_id,
//                 indl_id,
//                 detail.ind_id,
//                 indl_id
//             ]);

//             // ทำการทำให้อาร์เรย์ของอาร์เรย์เป็นอาร์เรย์เดียว
//             const flattenedDeleteValues = deleteValues.reduce((acc, val) => acc.concat(val), []);

//             // เพิ่มค่า LIMIT ไปที่ท้ายของอาร์เรย์
//             flattenedDeleteValues.push(existingRowCount - dataToEdit.length);

//             connection.query(deleteQuery, flattenedDeleteValues, (err, results) => {
//                 if (err) {
//                     console.error("MySQL Delete Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//                 const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//                 connection.query(updateLotQuery, [indl_id], (err, results) => {
//                     if (err) {
//                         console.error("MySQL Update Lot Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log("Transaction Complete.");
//                     res.status(200).json({ message: "success", indl_id });
//                 });
//             });
//         }
//     });
// });

//ไม่ได้
// router.patch('/editLotIngrediant/:indl_id', async (req, res, next) => {
//     const indl_id = req.params.indl_id;
//     const dataToEdit = req.body.dataToEdit;

//     if (!dataToEdit || dataToEdit.length === 0) {
//         return res.status(400).json({ message: "error", error: "No data to edit provided" });
//     }

//     // สร้าง SQL query สำหรับ insert หรือ update ข้อมูล
//     const upsertQuery = `
//         INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
//         VALUES (?, ?, ?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//             qtypurchased = VALUES(qtypurchased),
//             date_exp = VALUES(date_exp),
//             price = VALUES(price);
//     `;

//     // ให้ใช้ forEach ในการทำ insert ทีละรายการ
//     for (const detail of dataToEdit) {
//         const upsertValues = [
//             detail.ind_id,
//             indl_id,
//             detail.qtypurchased,
//             detail.date_exp,
//             detail.price
//         ];

//         try {
//             const existingData = await connection.query(`SELECT * FROM Ingredient_lot_detail WHERE ind_id = ? AND indl_id = ?`, [detail.ind_id, indl_id]);

//             if (existingData.length > 0) {
//                 // ข้อมูลมีอยู่แล้ว ให้ทำการอัปเดต
//                 const updateValues = [
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price
//                 ];

//                 await connection.query(upsertQuery, upsertValues);
//             } else {
//                 // ข้อมูลไม่มีอยู่แล้ว ให้ทำการ INSERT
//                 await connection.query(upsertQuery, upsertValues);
//             }
//         } catch (err) {
//             console.error("MySQL Upsert Query Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         }
//     }

//     // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//     const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";

//     try {
//         await connection.query(updateLotQuery, [indl_id]);
//         console.log("Transaction Complete.");
//         res.status(200).json({ message: "success", indl_id });
//     } catch (err) {
//         console.error("MySQL Update Lot Query Error:", err);
//         res.status(500).json({ message: "error", error: err });
//     }
// });

//ใหม่สุด
//ทำหลายอันบ่าได้ 
//น้อยกว่าก็แปลกๆ
// router.patch('/editLotIngrediant/:indl_id', (req, res, next) => {
//     const indl_id = req.params.indl_id;
//     const dataToEdit = req.body.dataToEdit;

//     if (!dataToEdit || dataToEdit.length === 0) {
//         return res.status(400).json({ message: "error", error: "No data to edit provided" });
//     }

//     // ตรวจสอบจำนวนแถวที่มีอยู่
//     const existingRowCountQuery = "SELECT COUNT(*) as rowCount FROM Ingredient_lot_detail WHERE indl_id = ?";
//     connection.query(existingRowCountQuery, [indl_id], (err, results) => {
//         if (err) {
//             console.error("MySQL Existing Row Count Query Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         }

//         const existingRowCount = results[0].rowCount;

//         if (dataToEdit.length == existingRowCount) {
//             // จำนวนแถวที่ต้องการแก้ไขมีจำนวนเท่ากับจำนวนแถวที่มีอยู่
//             // ดำเนินการอัปเดตข้อมูล
//             const updateQuery = `
//                 UPDATE Ingredient_lot_detail
//                 SET
//                     ind_id = ?,
//                     qtypurchased = ?,
//                     date_exp = ?,
//                     price = ?
//                 WHERE
//                     indl_id = ?;
//             `;

//             // ให้ใช้ loop ในการทำ update ทีละรายการ
//             dataToEdit.forEach(detail => {
//                 const updateValues = [
//                     detail.ind_id,
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price,
//                     indl_id
//                 ];

//                 connection.query(updateQuery, updateValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Update Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log(`Updated record for ind_id ${detail.ind_id}`);
//                 });
//             });

//             // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//             const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//             connection.query(updateLotQuery, [indl_id], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Update Lot Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 console.log("Transaction Complete.");
//                 res.status(200).json({ message: "success", indl_id });
//             });
//         } else if (dataToEdit.length > existingRowCount) {
//             // จำนวนแถวที่ต้องการแก้ไขมากกว่าจำนวนแถวที่มีอยู่
//             // ดำเนินการเพิ่มข้อมูลใหม่หรือทำงานอื่น ๆ ที่ต้องการ
//             // เช่น INSERT ข้อมูลใหม่

//             // สร้าง SQL query สำหรับ insert หรือ update ข้อมูล
//             const upsertQuery = `
//                 INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
//                 VALUES (?, ?, ?, ?, ?)
//                 ON DUPLICATE KEY UPDATE
//                     qtypurchased = VALUES(qtypurchased),
//                     date_exp = VALUES(date_exp),
//                     price = VALUES(price);
//             `;

//             // ให้ใช้ forEach ในการทำ insert ทีละรายการ
//             dataToEdit.forEach(detail => {
//                 const upsertValues = [
//                     detail.ind_id,
//                     indl_id,
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price
//                 ];

//                 connection.query(upsertQuery, upsertValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Upsert Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     // คำสั่งที่ต้องการทำหลังจาก insert หรือ update แต่ละรายการ
//                 });
//             });

//             // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//             const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//             connection.query(updateLotQuery, [indl_id], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Update Lot Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 console.log("Transaction Complete.");
//                 res.status(200).json({ message: "success up", indl_id });
//             });
//         } else {
//             // จำนวนแถวที่ต้องการแก้ไขน้อยกว่าจำนวนแถวที่มีอยู่
//             // ดำเนินการลบข้อมูลที่เกิน
//             const deleteQuery = `
//                 DELETE FROM Ingredient_lot_detail
//                 WHERE (ind_id = ? AND indl_id = ?)
//                 LIMIT ?;
//             `;

//             const deleteValues = dataToEdit.map(detail => [
//                 detail.ind_id,
//                 indl_id,
//                 detail.ind_id,
//                 indl_id
//             ]);

//             // ทำการทำให้อาร์เรย์ของอาร์เรย์เป็นอาร์เรย์เดียว
//             const flattenedDeleteValues = deleteValues.reduce((acc, val) => acc.concat(val), []);

//             // เพิ่มค่า LIMIT ไปที่ท้ายของอาร์เรย์
//             flattenedDeleteValues.push(existingRowCount - dataToEdit.length);

//             connection.query(deleteQuery, flattenedDeleteValues, (err, results) => {
//                 if (err) {
//                     console.error("MySQL Delete Query Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 }

//                 // ตัวแปรสำหรับเก็บคำสั่ง SQL ที่จะใช้ในการอัปเดตข้อมูลที่ต้องการ
//                 const updateLotQuery = "UPDATE ingredient_lot SET update_at = CURRENT_TIMESTAMP WHERE indl_id = ?";
//                 connection.query(updateLotQuery, [indl_id], (err, results) => {
//                     if (err) {
//                         console.error("MySQL Update Lot Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log("Transaction Complete.");
//                     res.status(200).json({ message: "success de", indl_id });
//                 });
//             });
//         }
//     });
// });


//ลองตัวใหม่ วิธีใหม่ มั้ง
//ลองเปลี่ยนเป็นวิธีที่ใช้ เพื่อให้คุณสามารถใช้ค่าที่ได้จาก SELECT query ในโปรแกรม Node.js ได้, คุณสามารถทำการประมวลผลผลลัพธ์ที่ได้จาก query นั้นด้วยการใช้ callback function หรือ Promise (ในกรณีที่มีการใช้ library ที่รองรับ Promise) ขึ้นอยู่กับว่าคุณต้องการให้โค้ดของคุณมีโครงสร้างแบบไหน.

// นี่คือตัวอย่างการใช้ callback function: 
// หรือถ้าคุณต้องการใช้ Promise, คุณต้องใช้ library ที่รองรับ Promise เช่น mysql2
//เช็็คได้ละว่ามีกี่ตัว แต่ยังหาวิธีเอาไปใช้ไม่ได้

//ตรวจสอบค่าเก็บไว้ใน updateData = [] insertData = [];  deleteData = []; ได้ละ delete เป็น [] ลองเชื่อมกับ db ดู
//gเหลือinsertData
//ได้แล้ว
// router.patch('/editData/:indl_id', (req, res, next) => {
//     const indl_id = req.params.indl_id;
//     // const dataToEdit = req.body.dataToEdit;
//     const dataToEdit = req.body.dataaToEdit;

//     if (!dataToEdit || dataToEdit.length === 0) {
//         return res.status(400).json({ message: "error", error: "No data to edit provided" });
//     }

//     // แยกข้อมูลที่ต้องการอัปเดต แยกเป็นข้อมูลที่ต้องการเพิ่ม และข้อมูลที่ต้องการลบ
//     const updateData = [];
//     const insertData = [];
//     const deleteData = [];
//     const query = `SELECT ingredient_lot_detail.ind_id FROM ingredient_lot_detail WHERE indl_id = ?`;
//     console.log(dataToEdit)

//     let indIdsQ = dataToEdit.map(detail => detail.ind_id).filter(id => id !== undefined);
//     console.log(indIdsQ);
//     let indIds;

//     connection.query(query, [indl_id], (err, results) => {
//         if (err) {
//             console.error("MySQL Query Error:", err);
//             // handle error
//         }

//         // ถ้าไม่มี error, results จะเป็น array ของ object ที่มี key เป็น 'ind_id'
//         indIds = results.map(result => result.ind_id);
//         // console.log("indIds:", indIds);

//         indIds.forEach(detail => {
//             //ยังอยู่ตรงนี้
//             // console.log(detail)
//             const selectedData = dataToEdit.filter(item => item.ind_id === detail);
//             // const indIdsNotInIndIdsQdata = dataToEdit.filter(item => item.ind_id === indIdsNotInIndIdsQ);
//             // console.log("for insert indIdsNotInIndIdsQdata",indIdsNotInIndIdsQdata)

//             console.log("for up selectedData", selectedData)

//             // console.log("for insert indIdsNotInIndIdsQ", indIdsNotInIndIdsQ)

//             if (detail) {
//                 // ตรวจสอบว่า ind_id มีอยู่ในฐานข้อมูลหรือไม่
//                 // const query = `SELECT ingredient_lot_detail.ind_id FROM ingredient_lot_detail WHERE indl_id = ?`;

//                 if (indIdsQ.includes(detail)) {
//                     // ind_id มีอยู่ในฐานข้อมูล ให้ทำการอัปเดต
//                     console.log("Update data:", selectedData);
//                     updateData.push(selectedData);
//                 } else {
//                     if (indIds) {
//                         // ind_id ไม่มีอยู่ในฐานข้อมูล ให้ทำการลบ
//                         console.log("delete data:", detail);
//                         deleteData.push(detail);
//                     } else {
//                         // ind_id ไม่ได้ระบุ ให้ทำการเพิ่ม
//                         //ไม่ทำงาน
//                         //ค่อยคิด
//                         console.log("nonono insert data:", selectedData);
//                         insertData.push(selectedData);
//                     }
//                 }

//             } else {
//                 // ind_id ไม่ได้ระบุ ให้ทำการเพิ่ม
//                 //ค่อยคิด
//                 console.log(detail)
//                 insertData.push(detail);
//             }
//         });

//         const indIdsNotInIndIdsQ = indIdsQ.filter(id => !indIds.includes(id));
//         console.log(indIdsNotInIndIdsQ)

//         if (indIdsNotInIndIdsQ != []) {
//             indIdsNotInIndIdsQ.forEach(detail => {
//                 console.log(detail)
//                 const indIdsNotInIndIdsQdata = dataToEdit.filter(item => item.ind_id === detail);
//                 console.log("Insert data:", indIdsNotInIndIdsQdata);
//                 insertData.push(indIdsNotInIndIdsQdata);
//             });

//         }
//         console.log(deleteData, insertData, updateData)
//         // indIdsQ.forEach(detail => {

//         //     console.log(detail)
//         //     const selectedData = dataToEdit.filter(item => item.ind_id === detail);

//         // });
//         console.log("de length", deleteData.length)
//         console.log("in length", insertData.length)
//         console.log("ed length", updateData.length)
//         if (deleteData.length > 0) {
//             const deleteQuery = "DELETE FROM Ingredient_lot_detail WHERE ind_id = ? AND indl_id = ?";

//             deleteData.forEach(detail => {
//                 const deleteValues = [detail, indl_id];
//                 console.log(deleteValues)

//                 connection.query(deleteQuery, deleteValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Delete Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log("Deleted data:", results);
//                 });
//             });
//         }

//         // ตรวจสอบว่ามีข้อมูลที่ต้องการเพิ่มหรือไม่
//         //ยังไม่ได้
//         if (insertData.length > 0) {
//             console.log("database inn", insertData)
//             console.log("indl id", indl_id)
//             // INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
//             //                 VALUES (?, ?, ?, ?, ?)
//             const insertQuery = "INSERT INTO Ingredient_lot_detail (ind_id, qtypurchased, date_exp, price, indl_id) VALUES (?,?,?,?,?)";

//             const flattenedineData = insertData.flat();

//             flattenedineData.forEach(detail => {
//                 const insertValues = [
//                     detail.ind_id,
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price,
//                     indl_id
//                 ];
//                 connection.query(insertQuery, insertValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Insert Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log("Inserted data:", results);
//                 });
//             });


//         }

//         // ตรวจสอบว่ามีข้อมูลที่ต้องการอัปเดตหรือไม่

//         if (updateData.length > 0) {
//             console.log("database uppp", updateData)
//             const updateQuery = "UPDATE Ingredient_lot_detail SET qtypurchased = ?, date_exp = ?, price = ? WHERE ind_id = ? AND indl_id = ?";
//             //การใช้ flat() จะช่วยให้คุณได้ array ที่ flatten แล้วที่มี object ภายใน ซึ่งจะทำให้ง่ายต่อการทำงานกับข้อมูลในลำดับถัดไป.
//             const flattenedUpdateData = updateData.flat();

//             flattenedUpdateData.forEach(detail => {
//                 const updateValues = [
//                     detail.qtypurchased,
//                     detail.date_exp,
//                     detail.price,
//                     detail.ind_id,
//                     indl_id
//                 ];

//                 connection.query(updateQuery, updateValues, (err, results) => {
//                     if (err) {
//                         console.error("MySQL Update Query Error:", err);
//                         return res.status(500).json({ message: "error", error: err });
//                     }

//                     console.log("Updated data:", results);
//                 });
//             });

//         }

//         res.status(200).json({ message: "test เงื่อนไข" });

//     });
// });

//ลองแก้อันบนเป็น soft delete
//ได้ละเหลือแก้ตรงแสดงให้ไม่เลือกอันที่มี delete_at

router.patch('/editData/:indl_id', (req, res, next) => {
    const indl_id = req.params.indl_id;
    // const dataToEdit = req.body.dataToEdit;
    const dataToEdit = req.body.dataaToEdit;

    if (!dataToEdit || dataToEdit.length === 0) {
        return res.status(400).json({ message: "error", error: "No data to edit provided" });
    }

    // แยกข้อมูลที่ต้องการอัปเดต แยกเป็นข้อมูลที่ต้องการเพิ่ม และข้อมูลที่ต้องการลบ
    const updateData = [];
    const insertData = [];
    const deleteData = [];
    const query = `SELECT ingredient_lot_detail.ind_id FROM ingredient_lot_detail WHERE indl_id = ?`;
    console.log(dataToEdit)

    let indIdsQ = dataToEdit.map(detail => detail.ind_id).filter(id => id !== undefined);
    console.log(indIdsQ);
    let indIds;

    connection.query(query, [indl_id], (err, results) => {
        if (err) {
            console.error("MySQL Query Error:", err);
            // handle error
        }

        // ถ้าไม่มี error, results จะเป็น array ของ object ที่มี key เป็น 'ind_id'
        indIds = results.map(result => result.ind_id);
        // console.log("indIds:", indIds);

        indIds.forEach(detail => {
            //ยังอยู่ตรงนี้
            // console.log(detail)
            const selectedData = dataToEdit.filter(item => item.ind_id === detail);
            // const indIdsNotInIndIdsQdata = dataToEdit.filter(item => item.ind_id === indIdsNotInIndIdsQ);
            // console.log("for insert indIdsNotInIndIdsQdata",indIdsNotInIndIdsQdata)

            console.log("for up selectedData", selectedData)

            // console.log("for insert indIdsNotInIndIdsQ", indIdsNotInIndIdsQ)

            if (detail) {
                // ตรวจสอบว่า ind_id มีอยู่ในฐานข้อมูลหรือไม่
                // const query = `SELECT ingredient_lot_detail.ind_id FROM ingredient_lot_detail WHERE indl_id = ?`;

                if (indIdsQ.includes(detail)) {
                    // ind_id มีอยู่ในฐานข้อมูล ให้ทำการอัปเดต
                    console.log("Update data:", selectedData);
                    updateData.push(selectedData);
                } else {
                    if (indIds) {
                        // ind_id ไม่มีอยู่ในฐานข้อมูล ให้ทำการลบ
                        console.log("delete data:", detail);
                        deleteData.push(detail);
                    } else {
                        // ind_id ไม่ได้ระบุ ให้ทำการเพิ่ม
                        //ไม่ทำงาน
                        //ค่อยคิด
                        console.log("nonono insert data:", selectedData);
                        insertData.push(selectedData);
                    }
                }

            } else {
                // ind_id ไม่ได้ระบุ ให้ทำการเพิ่ม
                //ค่อยคิด
                console.log(detail)
                insertData.push(detail);
            }
        });

        const indIdsNotInIndIdsQ = indIdsQ.filter(id => !indIds.includes(id));
        console.log(indIdsNotInIndIdsQ)

        if (indIdsNotInIndIdsQ != []) {
            indIdsNotInIndIdsQ.forEach(detail => {
                console.log(detail)
                const indIdsNotInIndIdsQdata = dataToEdit.filter(item => item.ind_id === detail);
                console.log("Insert data:", indIdsNotInIndIdsQdata);
                insertData.push(indIdsNotInIndIdsQdata);
            });

        }
        console.log(deleteData, insertData, updateData)
        // indIdsQ.forEach(detail => {

        //     console.log(detail)
        //     const selectedData = dataToEdit.filter(item => item.ind_id === detail);

        // });
        console.log("de length", deleteData.length)
        console.log("in length", insertData.length)
        console.log("ed length", updateData.length)
        if (deleteData.length > 0) {
            // const deleteQuery = "DELETE FROM Ingredient_lot_detail WHERE ind_id = ? AND indl_id = ?";
            const deleteQuery = "UPDATE ingredient_lot_detail SET deleted_at = CURRENT_TIMESTAMP WHERE ind_id = ? AND indl_id = ?";
            deleteData.forEach(detail => {
                const deleteValues = [detail, indl_id];
                console.log(deleteValues)

                connection.query(deleteQuery, deleteValues, (err, results) => {
                    if (err) {
                        console.error("MySQL Delete Query Error:", err);
                        return res.status(500).json({ message: "error", error: err });
                    }

                    console.log("Deleted data:", results);
                });
            });
        }

        // ตรวจสอบว่ามีข้อมูลที่ต้องการเพิ่มหรือไม่
        //ยังไม่ได้
        if (insertData.length > 0) {
            console.log("database inn", insertData)
            console.log("indl id", indl_id)
            // INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
            //                 VALUES (?, ?, ?, ?, ?)

            // const insertQuery = "INSERT INTO ingredient_lot_detail (ind_id, qtypurchased, date_exp, price, indl_id) VALUES (?,?,?,?,?)";

            // const flattenedineData = insertData.flat();

            // flattenedineData.forEach(detail => {
            //     const insertValues = [
            //         detail.ind_id,
            //         detail.qtypurchased,
            //         detail.date_exp,
            //         detail.price,
            //         indl_id
            //     ];
            const insertQuery = "INSERT INTO ingredient_lot_detail (ind_id, qtypurchased, date_exp, price, indl_id, deleted_at) VALUES (?,?,?,?,?,?)";

            const flattenedineData = insertData.flat();

            flattenedineData.forEach(detail => {
                const insertValues = [
                    detail.ind_id,
                    detail.qtypurchased,
                    detail.date_exp,
                    detail.price,
                    indl_id,
                    null // กำหนดให้ deleted_at เป็น null
                ];

                connection.query(insertQuery, insertValues, (err, results) => {
                    if (err) {
                        console.error("MySQL Insert Query Error:", err);
                        return res.status(500).json({ message: "error", error: err });
                    }

                    console.log("Inserted data:", results);
                });
            });


        }

        // ตรวจสอบว่ามีข้อมูลที่ต้องการอัปเดตหรือไม่
        // console.log("updateData",updateData)
        if (updateData.length > 0) {
            console.log("database uppp", updateData)
            // const updateQuery = "UPDATE Ingredient_lot_detail SET qtypurchased = ?, date_exp = ?, price = ? WHERE ind_id = ? AND indl_id = ?";
            const updateQuery = "UPDATE ingredient_lot_detail SET qtypurchased = ?, date_exp = ?, price = ?, deleted_at = NULL WHERE ind_id = ? AND indl_id = ?";
            //การใช้ flat() จะช่วยให้คุณได้ array ที่ flatten แล้วที่มี object ภายใน ซึ่งจะทำให้ง่ายต่อการทำงานกับข้อมูลในลำดับถัดไป.
            const flattenedUpdateData = updateData.flat();
            console.log("flattenedUpdateData",flattenedUpdateData)
            flattenedUpdateData.forEach(detail => {
                const updateValues = [
                    detail.qtypurchased,
                    detail.date_exp,
                    detail.price,
                    detail.ind_id,
                    indl_id
                ];

                connection.query(updateQuery, updateValues, (err, results) => {
                    if (err) {
                        console.error("MySQL Update Query Error:", err);
                        return res.status(500).json({ message: "error", error: err });
                    }

                    console.log("Updated data:", results);
                });
            });

        }

        res.status(200).json({ message: "test เงื่อนไข" });

    });
});
















module.exports = router;