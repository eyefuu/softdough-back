const express = require("express");
const connection = require("../connection");
const router = express.Router();

//ส่วน select ประเภทเมนู แล้วต้องไปแสดง pd ที่เป็นประเภทเมนูนี้ในอีก select
router.get('/selectpdt/:pdc_id', (req, res, next) => {
    const pdc_id = Number(req.params.pdc_id);

    var query = `SELECT pd.pd_name, pdc.*
    FROM productCategory pdc 
    JOIN products pd ON pdc.pdc_id = pd.pdc_id 
    WHERE pdc.pdc_id = ?`
    connection.query(query, pdc_id, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
})

//ยังไม่เพิ่มส่วน คำนวณต้นทุน
router.post('/addProductionOrder', (req, res, next) => {
    // const ingredient_lot = req.body;
    // const ingredient_lot_detail = req.body;
    const productionOrder = req.body.productionOrder;
    const productionOrderdetail = req.body.productionOrderdetail;


    const query = "INSERT INTO productionOrder (cost_pricesum	,pdo_status) VALUES (null,?)";
    connection.query(query, [productionOrder.pdo_status], (err, results) => {
        if (!err) {
            const pdo_id = results.insertId;

            const values = productionOrderdetail.map(detail => [
                detail.qty,
                1,
                pdo_id,
                detail.pd_id,
                null // กำหนดให้ deleted_at เป็น null
            ]);

            const detailQuery = `
                INSERT INTO productionOrderdetail (qty, status, pdo_id,	pd_id,	deleted_at) 
                VALUES ?
            `;

            connection.query(detailQuery, [values], (err, results) => {
                if (err) {
                    console.error("MySQL Error:", err);
                    return res.status(500).json({ message: "error", error: err });
                } else {
                    return res.status(200).json({ message: "success", pdo_id });
                }
            });
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

router.get('/readall', (req, res, next) => {
    // const indl_id = req.params.id;
    var query = `
    SELECT 
        CONCAT('PD', LPAD(pdo_id, 7, '0')) AS pdo_id_name,
        DATE_FORMAT(updated_at, '%Y-%m-%d') AS 	updated_at,
        pdo_status
    FROM 
        productionOrder 
    WHERE 
        pdo_status != 0
    ORDER BY updated_at DESC   
    `;

    connection.query(query, (err, results) => {
        if (!err) {
            if (results.length > 0) {
                return res.status(200).json(results);
            } else {
                return res.status(404).json({ message: " productionOrder not found" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

// router.get('/readone/:pdo_id', (req, res, next) => {
//     const pdo_id  = req.params.pdo_id ;
//     var query = `
//     SELECT 
//     CONCAT('PD', LPAD(pdo.pdo_id, 7, '0')) AS pdo_id_name,
//     DATE_FORMAT(pdo.updated_at, '%Y-%m-%d') AS updated_at,
//     pdod.*, pdc.pdc_name AS pdc_name 
// FROM 
//     productionOrder pdo 
//     JOIN productionOrderdetail pdod ON pdo.pdo_id = pdod.pdo_id 
//     JOIN products pd ON pdod.pd_id = pd.pd_id 
//     JOIN productCategory pdc ON pd.pdc_id = pdc.pdc_id 
// WHERE 
//     pdo.pdo_id = ?;

//     `;

//     connection.query(query, [pdo_id], (err, results) => {
//         if (!err) {
//             if (results.length > 0) {
//                 return res.status(200).json(results);

//             } else {
//                 return res.status(404).json({ message: "ingredient not found" });
//             }
//         } else {
//             return res.status(500).json(err);
//         }
//     });
// });

// แบบใช้ sql ไม่ได้ ต้อง อัปเดต something
// router.get('/readone/:pdo_id', (req, res, next) => {
//     const pdo_id = req.params.pdo_id;
//     var query = `
//     SELECT 
//         CONCAT('PD', LPAD(pdo.pdo_id, 7, '0')) AS pdo_id_name,
//         DATE_FORMAT(pdo.updated_at, '%Y-%m-%d') AS updated_at,
//         JSON_ARRAYAGG(JSON_OBJECT(
//             'pdod_id', pdod.pdod_id,
//             'qty', pdod.qty,
//             'status', pdod.status,
//             'pdo_id', pdod.pdo_id,
//             'pd_id', pdod.pd_id,
//             'created_at', pdod.created_at,
//             'deleted_at', pdod.deleted_at,
//             'pdc_name', pdc.pdc_name
//         )) AS pdodetail
//     FROM 
//         productionOrder pdo 
//         JOIN productionOrderdetail pdod ON pdo.pdo_id = pdod.pdo_id 
//         JOIN products pd ON pdod.pd_id = pd.pd_id 
//         JOIN productCategory pdc ON pd.pdc_id = pdc.pdc_id 
//     WHERE 
//         pdo.pdo_id = ? AND pdod.deleted_at IS NULL;`;

//     connection.query(query, [pdo_id], (err, results) => {
//         if (!err) {
//             if (results.length > 0) {
//                 // เพิ่มการแปลงข้อมูล JSON ก่อนส่งคืน
//                 results.forEach(result => {
//                     result.pdodetail = JSON.parse(result.pdodetail);
//                 });
//                 return res.status(200).json(results[0]);
//             } else {
//                 return res.status(404).json({ message: "ingredient not found" });
//             }
//         } else {
//             return res.status(500).json(err);
//         }
//     });
// });

//แบบไม่ใช้ sql
router.get('/readone/:pdo_id', (req, res, next) => {
    try {
        const pdo_id = req.params.pdo_id;

        const query = `
            SELECT 
                CONCAT('PD', LPAD(pdo.pdo_id, 7, '0')) AS pdo_id_name,
                DATE_FORMAT(pdo.updated_at, '%Y-%m-%d') AS updated_at_pdo,
                pdod.*, pdc.pdc_name AS pdc_name ,pd.pd_name as pd_name
            FROM 
                productionOrder pdo 
                JOIN productionOrderdetail pdod ON pdo.pdo_id = pdod.pdo_id 
                JOIN products pd ON pdod.pd_id = pd.pd_id 
                JOIN productCategory pdc ON pd.pdc_id = pdc.pdc_id 
            WHERE 
                pdo.pdo_id = ? AND pdod.deleted_at IS NULL`;

        // const [results] = await connection.query(query, [pdo_id]);
        connection.query(query, pdo_id, (err, results) => {
            if (results.length > 0) {
                const formattedResult = {
                    pdo_id_name: results[0].pdo_id_name,
                    updated_at: results[0].updated_at_pdo,
                    pdodetail: results.map(item => ({
                        pdod_id: item.pdod_id,
                        qty: item.qty,
                        status: item.status,
                        pdo_id: item.pdo_id,
                        pd_id: item.pd_id,
                        // created_at: item.created_at,
                        // deleted_at: item.deleted_at,
                        pdc_name: item.pdc_name,
                        pd_name:item.pd_name
                    }))
                };

                return res.status(200).json(formattedResult);
            } else {
                return res.status(404).json({ message: "ingredient not found" });
            }
        })
    } catch (error) {
        console.error('Error retrieving pdo:', error);
        return res.status(500).json({ message: 'Error retrieving pdo', error });
    }
});







module.exports = router;