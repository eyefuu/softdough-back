const express = require("express");
const connection = require("../connection");
const { route } = require("./ingredient");
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
router.patch('/updatecat/:pdc_id', (req, res, next) => {
    const pdc_id = req.params.pdc_id;
    const cat = req.body;
    var query = "UPDATE productCategory SET pdc_name=? WHERE pdc_id=?";
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

                const recipeId = recipeResult.insertId;

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

                        connection.query('INSERT INTO recipedetail SET ?', details, (err) => {
                            if (err) {
                                connection.rollback(() => {
                                    res.status(500).json({ message: 'Error inserting recipe details', error: err });
                                });
                                return;
                            }

                            // Commit the transaction
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

module.exports = router;