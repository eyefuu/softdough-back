// const express = require("express");
// const connection = require("../connection");
// // const { route } = require("./ingredient");
// const router = express.Router();
// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).single('image');

// module.exports = upload;

// const express = require("express");
// const connection = require("../connection");
// // const { route } = require("./ingredient");
// const router = express.Router();
// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).single('image');

//เพิ่มapi สำหรับหน่วย มีประเภทหน่วย
const express = require("express");
const connection = require("../connection");
const multer = require('multer');

const router = express.Router();
const upload = multer();


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
    connection.query(query, [sm.smt_name, sm.unit, sm.qty_per_unit], (err, results) => {
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
    connection.query(query, [sm.smt_id, sm.sm_name, sm.sm_price, sm.status, sm.fix, sm.picture], (err, results) => {
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
    connection.query(query, [sm.pdc_name, sm.unit, sm.qty_per_unit, pdc_id], (err, results) => {
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
//rc-id ใน pd ยังมี
// router.post('/addProductWithRecipe', (req, res) => {
//     const { product, recipe, recipedetail } = req.body;

//     // Start a transaction
//     connection.beginTransaction((err) => {
//         if (err) {
//             res.status(500).json({ message: 'Transaction start error', error: err });
//             return;
//         }

//         // Insert product
//         connection.query('INSERT INTO products SET ?', product, (err, productResult) => {
//             if (err) {
//                 connection.rollback(() => {
//                     res.status(500).json({ message: 'Error inserting product', error: err });
//                 });
//                 return;
//             }

//             const productId = productResult.insertId;

//             // Set pd_id for the recipe
//             recipe.pd_id = productId;

//             // Insert recipe
//             connection.query('INSERT INTO recipe SET ?', recipe, (err, recipeResult) => {
//                 if (err) {
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Error inserting recipe', error: err });
//                     });
//                     return;
//                 }

//                 let recipeId = recipeResult.insertId;

//                 // Associate recipe with product
//                 connection.query(
//                     // 'UPDATE products SET rc_id = ? WHERE pd_id = ?',
//                     [recipeId, productId],
//                     (err, updateResult) => {
//                         if (err) {
//                             connection.rollback(() => {
//                                 res.status(500).json({ message: 'Error associating recipe with product', error: err });
//                             });
//                             return;
//                         }

//                         // Check if the update was successful
//                         if (updateResult.affectedRows !== 1) {
//                             connection.rollback(() => {
//                                 res.status(500).json({ message: 'Error associating recipe with product', error: 'No rows updated' });
//                             });
//                             return;
//                         }

//                         // Insert recipe details
//                         const details = recipedetail.map((detail) => ({
//                             ...detail,
//                             rc_id: recipeId,
//                         }));

//                         console.log(recipedetail)
//                         //เพิ่มได้ตัวเดียว
//                         connection.query('INSERT INTO recipedetail SET ?', details, (err) => {
//                             if (err) {
//                                 connection.rollback(() => {
//                                     res.status(500).json({ message: 'Error inserting recipe details', error: err });
//                                 });
//                                 return;
//                             }

//                             // Commit the transaction
//                             connection.commit((err) => {
//                                 if (err) {
//                                     connection.rollback(() => {
//                                         res.status(500).json({ message: 'Transaction commit error', error: err });
//                                     });
//                                     return;
//                                 }

//                                 res.json({
//                                     productId,
//                                     recipeId,
//                                     message: 'Product and recipe added successfully!',
//                                 });
//                             });
//                         });
//                         // Assuming `recipedetail` is an array of objects
//                         console.log(recipedetail);

//                         // Start the transaction
//                         connection.beginTransaction((err) => {
//                             if (err) {
//                                 res.status(500).json({ message: 'Transaction start error', error: err });
//                                 return;
//                             }

//                             // Loop through each item in the array
//                             recipedetail.forEach((detail) => {
//                                 connection.query('INSERT INTO recipedetail SET ?', details, (err, results) => {
//                                     if (err) {
//                                         connection.rollback(() => {
//                                             res.status(500).json({ message: 'Error inserting recipe details', error: err });
//                                         });
//                                         return;
//                                     }

//                                     // Check if this is the last item in the array
//                                     if (recipedetail.indexOf(detail) === recipedetail.length - 1) {
//                                         // If it's the last item, commit the transaction
//                                         connection.commit((err) => {
//                                             if (err) {
//                                                 connection.rollback(() => {
//                                                     res.status(500).json({ message: 'Transaction commit error', error: err });
//                                                 });
//                                                 return;
//                                             }

//                                             res.json({
//                                                 productId,
//                                                 recipeId,
//                                                 message: 'Product and recipe added successfully!',
//                                             });
//                                         });
//                                     }
//                                 });
//                             });
//                         });

//                     }
//                 );

//             });
//         });
//     });
// });

//ได้หลายตัวแล้ว ยังไม่มีเงื่อนไขแค่ pd
// router.post('/addProductWithRecipe', (req, res) => {
//     const { product, recipe, recipedetail } = req.body;

//     // Start a transaction
//     connection.beginTransaction((err) => {
//         if (err) {
//             res.status(500).json({ message: 'Transaction start error', error: err });
//             return;
//         }

//         // Insert product
//         connection.query('INSERT INTO products SET ?', product, (err, productResult) => {
//             if (err) {
//                 connection.rollback(() => {
//                     res.status(500).json({ message: 'Error inserting product', error: err });
//                 });
//                 return;
//             }

//             const productId = productResult.insertId;

//             // Set pd_id for the recipe
//             recipe.pd_id = productId;

//             // Insert recipe
//             connection.query('INSERT INTO recipe SET ?', recipe, (err, recipeResult) => {
//                 if (err) {
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Error inserting recipe', error: err });
//                     });
//                     return;
//                 }

//                 let recipeId = recipeResult.insertId;

//                 // Set rc_id for all recipedetails
//                 // Set rc_id for all recipedetails
//                 recipedetail.forEach((detail) => {
//                     detail.rc_id = recipeId;
//                 });

//                 // Insert recipe details
//                 const recipeDetailQuery = `INSERT INTO recipedetail (rc_id, ind_id, ingredients_qty, un_id) VALUES (?, ?, ?, ?)`;
//                 recipedetail.forEach(detail => {
//                     const recipeDetailValues = [recipeId, detail.ind_id, detail.ingredients_qty, detail.un_id];
//                     connection.query(recipeDetailQuery, recipeDetailValues, (err, detailResults) => {
//                         if (err) {
//                             connection.rollback(() => {
//                                 res.status(500).json({ message: 'Error inserting recipe details', error: err });
//                             });
//                             return;
//                         }
//                     });
//                 });

//                 // Commit the transaction
//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                         return;
//                     }

//                     res.json({
//                         productId,
//                         recipeId,
//                         message: 'Product and recipe added successfully!',
//                     });
//                 });
//             });

//         });
//     });
// });



// ลองเพิ่มรูป+เงื่อนไขแค่ pd 
// router.post('/addProductWithRecipe', upload.single('picture'), (req, res) => {
//     const { product, recipe, recipedetail } = req.body;
//     const imageBase64 = req.file.buffer.toString('base64'); // Extract image data from multer
// บvกว่าใหญ่ไป กับ pdc doesn't have a default value แต่jsonได้ติดรูป
// router.post('/addProductWithRecipe', upload.single('picture'), (req, res) => {
//     const { product, recipe, recipedetail } = req.body;

//     // ตรวจสอบว่า req.file มีหรือไม่และมีคุณสมบัติ buffer หรือไม่
//     const imageBase64 = req.file && req.file.buffer ? req.file.buffer.toString('base64') : null;

//     // สร้างอ็อบเจ็กต์ผลิตภัณฑ์พร้อมคุณสมบัติรูปภาพ
//     const productWithPicture = { ...product, picture: imageBase64 };

//     connection.beginTransaction((err) => {
//         if (err) {
//             return res.status(500).json({ message: 'Transaction start error', error: err });
//         }

//         // connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
//         //     if (err) {
//         //         connection.rollback(() => {
//         //             return res.status(500).json({ message: 'Error inserting product', error: err });
//         //         });
//         //     }

//         //     const productId = productResult.insertId;
//         connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
//             if (err) {
//                 console.error('Error inserting product:', err);
//                 connection.rollback(() => {
//                     res.status(500).json({ message: 'Error inserting product', error: err });
//                 });
//                 return;
//             }
        
//             if (!productResult || !productResult.insertId) {
//                 console.error('Product insertion result is invalid:', productResult);
//                 connection.rollback(() => {
//                     res.status(500).json({ message: 'Invalid product insertion result' });
//                 });
//                 return;
//             }
        
//             const productId = productResult.insertId;
        

//             if (recipe) {
//                 recipe.pd_id = productId;

//                 connection.query('INSERT INTO recipe SET ?', recipe, (err, recipeResult) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Error inserting recipe', error: err });
//                         });
//                     }

//                     const recipeId = recipeResult.insertId;

//                     if (recipedetail) {
//                         const values = recipedetail.map(detail => [recipeId, detail.ind_id, detail.ingredients_qty, detail.un_id]);
//                         const recipeDetailQuery = `INSERT INTO recipedetail (rc_id, ind_id, ingredients_qty, un_id) VALUES ?`;

//                         connection.query(recipeDetailQuery, [values], (err, detailResults) => {
//                             if (err) {
//                                 connection.rollback(() => {
//                                     return res.status(500).json({ message: 'Error inserting recipe details', error: err });
//                                 });
//                             }

//                             connection.commit((err) => {
//                                 if (err) {
//                                     connection.rollback(() => {
//                                         return res.status(500).json({ message: 'Transaction commit error', error: err });
//                                     });
//                                 }

//                                 return res.json({
//                                     productId,
//                                     recipeId,
//                                     message: 'Product and recipe added successfully!',
//                                 });
//                             });
//                         });
//                     } else { 
//                         connection.commit((err) => {
//                             if (err) {
//                                 connection.rollback(() => {
//                                     return res.status(500).json({ message: 'Transaction commit error', error: err });
//                                 });
//                             }

//                             return res.json({
//                                 productId,
//                                 recipeId,
//                                 message: 'Product added successfully!',
//                             });
//                         });
//                     }
//                 });
//             } else {
//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                     }

//                     return res.json({
//                         productId,
//                         message: 'Product added successfully!',
//                     });
//                 });
//             }
//         });
//     });
// });
 

// module.exports = router;

// });

//ลอง resize
const sharp = require('sharp');

// router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
//     const { product, recipe, recipedetail } = req.body;

//     // ตรวจสอบว่า req.file มีหรือไม่และมีคุณสมบัติ buffer หรือไม่
//     const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

//     if (!imageBuffer) {
//         return res.status(400).json({ message: 'No image file provided' });
//     }

//     try {
//         // Resize the image using sharp library
//         const resizedImageBuffer = await sharp(imageBuffer)
//             .resize({ width: 300, height: 300 }) // Set the desired width and height for the resized image
//             .toBuffer(); // Convert the resized image to buffer

//         const imageBase64 = resizedImageBuffer.toString('base64');

//         // สร้างอ็อบเจ็กต์ผลิตภัณฑ์พร้อมคุณสมบัติรูปภาพ
//         const productWithPicture = { ...product, picture: imageBase64 };

//         // ทำการเชื่อมต่อกับฐานข้อมูลและทำการแทรกข้อมูล
//         connection.beginTransaction((err) => {
//             // ตรวจสอบข้อผิดพลาดที่เกิดขึ้นในการเริ่ม Transaction
//             if (err) {
//                 return res.status(500).json({ message: 'Transaction start error', error: err });
//             }

//             connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
//                 if (err) {
//                     console.error('Error inserting product:', err);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Error inserting product', error: err });
//                     });
//                     return;
//                 }

//                 if (!productResult || !productResult.insertId) {
//                     console.error('Product insertion result is invalid:', productResult);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Invalid product insertion result' });
//                     });
//                     return;
//                 }

//                 const productId = productResult.insertId;

//                 // ทำการ commit Transaction หากไม่มีข้อผิดพลาด
//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                     }

//                     return res.json({
//                         productId,
//                         message: 'Product added successfully!',
//                     });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error resizing image:', error);
//         return res.status(500).json({ message: 'Error resizing image', error });
//     }
// });

// ปห pdc_id อะไรไม่รู้ เหมือนจะได้ละแต่ยังไม่มี recipe
// router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
//     const { pd_name, pd_qtyminimum, status, pdc_id } = req.body;
//     const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

//     if (!imageBuffer) {
//         return res.status(400).json({ message: 'No image file provided' });
//     }

//     try {
//         const resizedImageBuffer = await sharp(imageBuffer)
//             .resize({ width: 300, height: 300 })
//             .toBuffer();

//         const imageBase64 = resizedImageBuffer.toString('base64');

//         const productWithPicture = { pd_name, pd_qtyminimum, status, pdc_id, picture: imageBase64 };

//         connection.beginTransaction((err) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Transaction start error', error: err });
//             }

//             connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
//                 if (err) {
//                     console.error('Error inserting product:', err);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Error inserting product', error: err });
//                     });
//                     return;
//                 }

//                 if (!productResult || !productResult.insertId) {
//                     console.error('Product insertion result is invalid:', productResult);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Invalid product insertion result' });
//                     });
//                     return;
//                 }

//                 const productId = productResult.insertId;

//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                     }

//                     return res.json({
//                         productId,
//                         message: 'Product added successfully!',
//                     });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error resizing image:', error);
//         return res.status(500).json({ message: 'Error resizing image', error });
//     }
// });
// ลองทีละขั้น +กรณีค่าว่าง
// router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
//     const { pd_name, pd_qtyminimum, status, pdc_id } = req.body;
//     const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

//     try {
//         let imageBase64 = null;

//         // ตรวจสอบว่ามีรูปภาพที่อัปโหลดเข้ามาหรือไม่
//         if (imageBuffer) {
//             // ปรับขนาดรูปภาพ
//             const resizedImageBuffer = await sharp(imageBuffer)
//                 .resize({ width: 300, height: 300 })
//                 .toBuffer();

//             // เปลี่ยนข้อมูลรูปภาพเป็น base64
//             imageBase64 = resizedImageBuffer.toString('base64');
//         }

//         const productWithPicture = { pd_name, pd_qtyminimum, status, pdc_id, picture: imageBase64 };

//         connection.beginTransaction((err) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Transaction start error', error: err });
//             }

//             connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
//                 if (err) {
//                     console.error('Error inserting product:', err);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Error inserting product', error: err });
//                     });
//                     return;
//                 }

//                 if (!productResult || !productResult.insertId) {
//                     console.error('Product insertion result is invalid:', productResult);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Invalid product insertion result' });
//                     });
//                     return;
//                 }

//                 const productId = productResult.insertId;

//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                     }

//                     return res.json({
//                         productId,
//                         message: 'Product added successfully!',
//                     });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error resizing image:', error);
//         return res.status(500).json({ message: 'Error resizing image', error });
//     }
// });


//+recipe 
router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
    const { pd_name, pd_qtyminimum, status, pdc_id, recipe, recipedetail } = req.body;
    const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

    try {
        let imageBase64 = null;

        // ตรวจสอบว่ามีรูปภาพที่อัปโหลดเข้ามาหรือไม่
        if (imageBuffer) {
            // ปรับขนาดรูปภาพ
            const resizedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 300, height: 300 })
                .toBuffer();

            // เปลี่ยนข้อมูลรูปภาพเป็น base64
            imageBase64 = resizedImageBuffer.toString('base64');
        }

        const productWithPicture = { pd_name, pd_qtyminimum, status, pdc_id, picture: imageBase64 };

        connection.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ message: 'Transaction start error', error: err });
            }

            connection.query('INSERT INTO products SET ?', productWithPicture, (err, productResult) => {
                if (err) {
                    console.error('Error inserting product:', err);
                    connection.rollback(() => {
                        res.status(500).json({ message: 'Error inserting product', error: err });
                    });
                    return;
                }

                if (!productResult || !productResult.insertId) {
                    console.error('Product insertion result is invalid:', productResult);
                    connection.rollback(() => {
                        res.status(500).json({ message: 'Invalid product insertion result' });
                    });
                    return;
                }

                const productId = productResult.insertId;

                // ถ้ามีข้อมูลของ "recipe" และ "recipedetail" ให้เพิ่มเข้าไปด้วย
                if (recipe && recipedetail) {
                    // เพิ่มข้อมูลของ "recipe"
                    connection.query('INSERT INTO recipe SET ?', { ...recipe, pd_id: productId }, (err, recipeResult) => {
                        if (err) {
                            connection.rollback(() => {
                                return res.status(500).json({ message: 'Error inserting recipe', error: err });
                            });
                        }

                        const recipeId = recipeResult.insertId;

                        // เพิ่มข้อมูลของ "recipedetail"
                        const values = recipedetail.map(detail => [recipeId, detail.ind_id, detail.ingredients_qty, detail.un_id]);
                        const recipeDetailQuery = `INSERT INTO recipedetail (rc_id, ind_id, ingredients_qty, un_id) VALUES ?`;

                        connection.query(recipeDetailQuery, [values], (err, detailResults) => {
                            if (err) {
                                connection.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting recipe details', error: err });
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    connection.rollback(() => {
                                        return res.status(500).json({ message: 'Transaction commit error', error: err });
                                    });
                                }

                                return res.json({
                                    productId,
                                    recipeId,
                                    message: 'Product and recipe added successfully!',
                                });
                            });
                        });
                    });
                } else {
                    // ไม่มีข้อมูลของ "recipe" และ "recipedetail" ให้เพิ่มเฉพาะผลิตภัณฑ์เท่านั้น
                    connection.commit((err) => {
                        if (err) {
                            connection.rollback(() => {
                                return res.status(500).json({ message: 'Transaction commit error', error: err });
                            });
                        }

                        return res.json({
                            productId,
                            message: 'Product added successfully!',
                        });
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error resizing image:', error);
        return res.status(500).json({ message: 'Error resizing image', error });
    }
});


/////////////
// router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
//     const { pd_name, pd_qtyminimum, status, pdc_id, recipe, recipedetail } = req.body;
//     const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

//     try {
//         let imageBase64 = null;
//         if (imageBuffer) {
//             const resizedImageBuffer = await sharp(imageBuffer)
//                 .resize({ width: 300, height: 300 })
//                 .toBuffer();

//             imageBase64 = resizedImageBuffer.toString('base64');
//         }

//         const productWithPicture = { pd_name, pd_qtyminimum, status, pdc_id, picture: imageBase64 };

//         connection.beginTransaction(async (err) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Transaction start error', error: err });
//             }

//             try {
//                 const productResult = await insertProduct(connection, productWithPicture);

//                 if (!productResult || !productResult.insertId) {
//                     console.error('Product insertion result is invalid:', productResult);
//                     connection.rollback(() => {
//                         res.status(500).json({ message: 'Invalid product insertion result' });
//                     });
//                     return;
//                 }

//                 const productId = productResult.insertId;

//                 if (recipe) {
//                     recipe.pd_id = productId;

//                     const recipeResult = await insertRecipe(connection, recipe);

//                     if (!recipeResult || !recipeResult.insertId) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Error inserting recipe' });
//                         });
//                         return;
//                     }

//                     const recipeId = recipeResult.insertId;

//                     if (recipedetail) {
//                         const detailResults = await insertRecipeDetails(connection, recipedetail, recipeId);

//                         if (!detailResults) {
//                             connection.rollback(() => {
//                                 return res.status(500).json({ message: 'Error inserting recipe details' });
//                             });
//                             return;
//                         }
//                     }
//                 }

//                 connection.commit((err) => {
//                     if (err) {
//                         connection.rollback(() => {
//                             return res.status(500).json({ message: 'Transaction commit error', error: err });
//                         });
//                     }

//                     return res.json({
//                         productId,
//                         message: 'Product and recipe added successfully!',
//                     });
//                 });
//             } catch (error) {
//                 console.error('Error inserting product or recipe:', error);
//                 connection.rollback(() => {
//                     return res.status(500).json({ message: 'Error inserting product or recipe', error });
//                 });
//             }
//         });
//     } catch (error) {
//         console.error('Error resizing image:', error);
//         return res.status(500).json({ message: 'Error resizing image', error });
//     }
// });

// async function insertProduct(connection, product) {
//     return new Promise((resolve, reject) => {
//         connection.query('INSERT INTO products SET ?', product, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

// async function insertRecipe(connection, recipe) {
//     return new Promise((resolve, reject) => {
//         connection.query('INSERT INTO recipe SET ?', recipe, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

// async function insertRecipeDetails(connection, recipedetail, recipeId) {
//     return new Promise((resolve, reject) => {
//         const values = recipedetail.map(detail => [recipeId, detail.ind_id, detail.ingredients_qty, detail.un_id]);
//         const recipeDetailQuery = `INSERT INTO recipedetail (rc_id, ind_id, ingredients_qty, un_id) VALUES ?`;

//         connection.query(recipeDetailQuery, [values], (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

//read
router.get('/products/:pd_id', async (req, res) => {
    const productId = req.params.pd_id;

    try {
        // Perform a database query to retrieve the product data
        connection.query('SELECT * FROM products WHERE pd_id = ?', productId, (err, results) => {
            if (err) {
                console.error('Error retrieving product:', err);
                return res.status(500).json({ message: 'Error retrieving product', error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Extract product data from the database results
            const product = results[0];
            
            // If the product contains picture data
            if (product.picture) {
                // Include the base64-encoded picture data in the response
                product.picture = `data:image/jpeg;base64,${product.picture}`;
            }

            // Return the product data in the response
            res.json({ product });
        });
    } catch (error) {
        console.error('Error retrieving product:', error);
        return res.status(500).json({ message: 'Error retrieving product', error });
    }
});

//test new no recipe
// Import the fs module for file system operations
// const fs = require('fs');

// router.post('/addProductWithRecipe', upload.single('picture'), async (req, res) => {
//     const { pd_name, pd_qtyminimum, status, pdc_id } = req.body;
//     const imageBuffer = req.file && req.file.buffer ? req.file.buffer : null;

//     if (!imageBuffer) {
//         return res.status(400).json({ message: 'No image file provided' });
//     }

//     try {
//         const resizedImageBuffer = await sharp(imageBuffer)
//             .resize({ width: 300, height: 300 })
//             .toBuffer();

//         // Check if the picture field exists and has a valid value
//         if (!req.body.product.picture) {
//             console.error('Error: Filename is missing');
//             return res.status(400).json({ message: 'Filename is missing' });
//         }

//         // Generate a unique filename for the image
//         const filename = req.body.product.picture;

//         // Write the resized image buffer to the file system
//         fs.writeFileSync(`path/to/your/uploads/${filename}`, resizedImageBuffer);

//         // Store the filename (or full path) in the database
//         const product = { pd_name, pd_qtyminimum, status, pdc_id, picture: filename }; // Adjust 'picture' to store the filename

//         // Continue with your database insertion logic...
//     } catch (error) {
//         console.error('Error resizing image:', error);
//         return res.status(500).json({ message: 'Error resizing image', error });
//     }
// });














// module.exports = { upload, router };
module.exports = router;