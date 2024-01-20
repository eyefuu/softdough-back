const express = require("express");
const connection = require("../connection");
// const { route } = require("./ingredient");
const router = express.Router();

router.post('/addcat', (req, res, next) => {
    let cat = req.body;
    query = "insert into productCategory (pdc_name) values(?)";
    connection.query(query, [cat.pdc_name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
})

router.post('/addsmt', (req, res, next) => {
    let sm = req.body;
    query = "insert into salesmenuType (smt_name,unit,qty_per_unit) values(?,?,?)";
    connection.query(query, [sm.smt_name,sm.unit,sm.qty_per_unit], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
})
router.post('/addsm', (req, res, next) => {
    let sm = req.body;
    query = "insert into salesmenu (smt_id,	sm_name,sm_price,status,fix,picture	) values(?,?,?,?,?,?)";
    connection.query(query, [sm.smt_id	,sm.sm_name,sm.sm_price	,sm.status	,sm.fix	,sm.picture	 ], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "success" });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
})

router.get('/readcat', (req, res, next) => {
    var query = 'select *from productCategory'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})


router.get('/readsmt', (req, res, next) => {
    var query = 'select *from salesmenuType'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

router.get('/readsm', (req, res, next) => {
    var query = 'select *from salesmenu'
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})


router.patch('/updatecat/:pdc_id', (req, res, next) => {
    const pdc_id = req.params.pdc_id;
    const sm = req.body;
    var query = "UPDATE productCategory SET pdc_name=? ,unit=?,qty_per_unit=? WHERE pdc_id=?";
    connection.query(query, [sm.pdc_name,sm.unit,sm.qty_per_unit,  pdc_id], (err, results) => {
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

router.patch('/updatesmt/:smt_id', (req, res, next) => {
    const smt_id = req.params.smt_id;
    const sm = req.body;
    var query = "UPDATE salesmenuType SET pdc_name=? WHERE smt_id=?";
    connection.query(query, [cat.pdc_name, pdc_id], (err, results) => {
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
//pd new
//กดไปเรื่อยๆ id บวกไปเรื่อยๆแบบไม่เข้าไปก็บวกไป เริ่มต้นที่8ละล่าสุด
//pd_idไม่เข้าในrecipe
//detail แอดไม่หมด ได้ตัวเดียว มีปห.recipedetail มี rc_id เป็นPK
router.post('/addProductWithRecipe', (req, res) => {
    const { product, recipe, recipedetail } = req.body;

    // Start a transaction
    connection.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ message: 'Transaction start error', error: err });
            return;
        }

        // Insert product
        connection.query('INSERT INTO products SET ?', product, (err, productResult) => {
            if (err) {
                connection.rollback(() => {
                    res.status(500).json({ message: 'Error inserting product', error: err });
                });
                return;
            }

            const productId = productResult.insertId;

            // Set pd_id for the recipe
            recipe.pd_id = productId;

            // Insert recipe
            connection.query('INSERT INTO recipe SET ?', recipe, (err, recipeResult) => {
                if (err) {
                    connection.rollback(() => {
                        res.status(500).json({ message: 'Error inserting recipe', error: err });
                    });
                    return;
                }

                let recipeId = recipeResult.insertId;

                // Associate recipe with product
                connection.query(
                    'UPDATE products SET rc_id = ? WHERE pd_id = ?',
                    [recipeId, productId],
                    (err, updateResult) => {
                        if (err) {
                            connection.rollback(() => {
                                res.status(500).json({ message: 'Error associating recipe with product', error: err });
                            });
                            return;
                        }

                        // Check if the update was successful
                        if (updateResult.affectedRows !== 1) {
                            connection.rollback(() => {
                                res.status(500).json({ message: 'Error associating recipe with product', error: 'No rows updated' });
                            });
                            return;
                        }

                        // Insert recipe details
                        const details = recipedetail.map((detail) => ({
                            ...detail,
                            rc_id: recipeId,
                        }));

                        console.log(recipedetail)
                        //เพิ่มได้ตัวเดียว
                        // connection.query('INSERT INTO recipedetail SET ?', details, (err) => {
                        //     if (err) {
                        //         connection.rollback(() => {
                        //             res.status(500).json({ message: 'Error inserting recipe details', error: err });
                        //         });
                        //         return;
                        //     }

                        //     // Commit the transaction
                        //     connection.commit((err) => {
                        //         if (err) {
                        //             connection.rollback(() => {
                        //                 res.status(500).json({ message: 'Transaction commit error', error: err });
                        //             });
                        //             return;
                        //         }

                        //         res.json({
                        //             productId,
                        //             recipeId,
                        //             message: 'Product and recipe added successfully!',
                        //         });
                        //     });
                        // });
                        // Assuming `recipedetail` is an array of objects
                        console.log(recipedetail);

                        // Start the transaction
                        connection.beginTransaction((err) => {
                            if (err) {
                                res.status(500).json({ message: 'Transaction start error', error: err });
                                return;
                            }

                            // Loop through each item in the array
                            recipedetail.forEach((detail) => {
                                connection.query('INSERT INTO recipedetail SET ?', details, (err, results) => {
                                    if (err) {
                                        connection.rollback(() => {
                                            res.status(500).json({ message: 'Error inserting recipe details', error: err });
                                        });
                                        return;
                                    }

                                    // Check if this is the last item in the array
                                    if (recipedetail.indexOf(detail) === recipedetail.length - 1) {
                                        // If it's the last item, commit the transaction
                                        connection.commit((err) => {
                                            if (err) {
                                                connection.rollback(() => {
                                                    res.status(500).json({ message: 'Transaction commit error', error: err });
                                                });
                                                return;
                                            }

                                            res.json({
                                                productId,
                                                recipeId,
                                                message: 'Product and recipe added successfully!',
                                            });
                                        });
                                    }
                                });
                            });
                        });

                    }
                );

            });
        });
    });
});









// router.post('/addProRe', (req, res, next) => {
//     const product = req.body;
//     const recipe = req.body;

//     const query = "INSERT INTO product(pd_name,pd_qtyminimum) VALUES (?)";
//     connection.query(query, [ingredient_lot.indl_id], (err, results) => {
//         if (!err) {
//             const indl_id = results.insertId;

//             const values = ingredient_lot_detail.map(detail => [
//                 detail.ind_id,
//                 indl_id,
//                 detail.qtypurchased,
//                 detail.date_exp,
//                 detail.price
//             ]);

//             const detailQuery = `
//                 INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price) 
//                 VALUES ?
//             `;

//             connection.query(detailQuery, [values], (err, results) => {
//                 if (err) {
//                     console.error("MySQL Error:", err);
//                     return res.status(500).json({ message: "error", error: err });
//                 } else {
//                     return res.status(200).json({ message: "success", indl_id });
//                 }
//             });
//         } else {
//             console.error("MySQL Error:", err);
//             return res.status(500).json({ message: "error", error: err });
//         }
//     });
// });


//ยังไม่เปลี่ยน
// router.patch('/editData/:pd_id', (req, res, next) => {
//     const pd_id = req.params.pd_id;
//     const dataToEdit = req.body.dataToEdit;

//     if (!dataToEdit || dataToEdit.length === 0) {
//         return res.status(400).json({ message: "error", error: "No data to edit provided" });
//     }

//     // แยกข้อมูลที่ต้องการอัปเดต แยกเป็นข้อมูลที่ต้องการเพิ่ม และข้อมูลที่ต้องการลบ
//     const updateData = [];
//     const insertData = [];
//     const deleteData = [];
//     const query = `SELECT products.pd_id FROM products WHERE pd_id = ?`;
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
//             console.log("indl id",indl_id)
//             // INSERT INTO Ingredient_lot_detail (ind_id, indl_id, qtypurchased, date_exp, price)
// //                 VALUES (?, ?, ?, ?, ?)
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

//                     console.log("Inserted data:", results);});
//                 });


//         }

//         // ตรวจสอบว่ามีข้อมูลที่ต้องการอัปเดตหรือไม่

//         if (updateData.length > 0) {
//             console.log("database uppp", updateData)
//             const updateQuery = "UPDATE Ingredient_lot_detail SET qtypurchased = ?, date_exp = ?, price = ? WHERE ind_id = ? AND indl_id = ?";
// //การใช้ flat() จะช่วยให้คุณได้ array ที่ flatten แล้วที่มี object ภายใน ซึ่งจะทำให้ง่ายต่อการทำงานกับข้อมูลในลำดับถัดไป.
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

module.exports = router;