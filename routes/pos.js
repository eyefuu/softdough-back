const express = require("express");
const connection = require("../connection");
const router = express.Router();
const puppeteer = require('puppeteer'); // นำเข้า Puppeteer
const fs = require('fs');
const path = require('path');


// เปลี่ยนราคา
router.get('/small/:delitype?', async (req, res, next) => {
    const delitype = Number(req.params.delitype);
    if (!delitype)
        return res.status(200).json({});
    try {
        var query = `SELECT sm.sm_id,sm.sm_name,sm.smt_id,sm.status,sm.fix,sm.picture,typede.odtd_price AS sm_price
            FROM salesmenu sm 
            JOIN orderstypedetail typede ON typede.sm_id = sm.sm_id
            WHERE typede.odt_id=${delitype};`;

        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error retrieving sm:', err);
                return res.status(500).json({ message: 'Error retrieving sm', error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'sm not found' });
            }

            // Loop through the results to modify each result as needed
            results.forEach(result => {
                // If the product contains picture data
                if (result.picture) {
                    // Include the base64-encoded picture data in the response
                    result.picture = `${result.picture}`;
                }
            });

            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error retrieving sm:', error);
        return res.status(500).json({ message: 'Error retrieving sm', error });
    }
});

router.get('/sm', async (req, res, next) => {
    try {
        query = `
        SELECT sm.*, smt.*, smd.*, p.pd_name
        FROM salesmenutype smt 
        JOIN salesmenu sm ON sm.smt_id = smt.smt_id 
        JOIN salesmenudetail smd ON sm.sm_id = smd.sm_id 
        LEFT JOIN products p ON smd.pd_id = p.pd_id 
        WHERE smd.deleted_at IS NULL`;

        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error retrieving sm:', err);
                return res.status(500).json({ message: 'Error retrieving sm', error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'sm not found' });
            }

            // Loop through the results to modify each result as needed
            results.forEach(result => {
                // If the product contains picture data
                if (result.picture) {
                    // Include the base64-encoded picture data in the response
                    result.picture = `${result.picture}`;
                }
            });

            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error retrieving sm:', error);
        return res.status(500).json({ message: 'Error retrieving sm', error });
    }
});

// คละทั้งหมด กรณีจะแยกตรงหนเา pos
router.get('/smmix', (req, res, next) => {
    const sm_id = Number(req.params.sm_id);

    var query = `
    SELECT sm.*, smt.*, smd.*, p.pd_name
FROM salesmenutype smt 
JOIN salesmenu sm ON sm.smt_id = smt.smt_id 
JOIN salesmenudetail smd ON sm.sm_id = smd.sm_id 
LEFT JOIN products p ON smd.pd_id = p.pd_id  
WHERE sm.fix = '2'  
  AND smd.deleted_at IS NULL;
`;

    connection.query(query, [sm_id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});


router.get('/sm/:sm_id', (req, res, next) => {
    const sm_id = Number(req.params.sm_id);

    var query = `
    SELECT sm.*, smt.*, smd.*, p.pd_name,
           CASE 
               WHEN sm.fix = '2' THEN p.pd_name 
               ELSE NULL 
           END AS pd_name 
    FROM salesmenutype smt 
    JOIN salesmenu sm ON sm.smt_id = smt.smt_id 
    JOIN salesmenudetail smd ON sm.sm_id = smd.sm_id 
    LEFT JOIN products p ON smd.pd_id = p.pd_id  
    WHERE sm.sm_id = ? 
      AND smd.deleted_at IS NULL`;

    connection.query(query, [sm_id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});





// puppeteer ยังบ่แล้ว เทส
router.post('/generate-pdf', async (req, res, next) => {
    // const { orderData } = req.body; // รับข้อมูลจาก body ของคำขอ

    try {
        // const browser = await puppeteer.launch({ headless: true });
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
        });
        const page = await browser.newPage();
        const orderData = req.body;

        // สร้างเนื้อหา HTML ตาม orderData
        const pdfContent = `
        <html>
            <head>
                <title>Order Summary</title>
            </head>
            <body>
                <h1>Order Summary</h1>
                <p>Date: ${orderData.od_date}</p>
                <p>Total: ${orderData.od_sumdetail}</p>
                <p>Payment Type: ${orderData.od_paytype}</p>
                <p>Change: ${orderData.od_change}</p>
            </body>
        </html>
    `;
        await page.setContent(pdfContent);
        // const pdf = await page.pdf({
        //     path: 'document.pdf',

        //     format: 'A4',
        //     printBackground: true,
        //     margin: { top: '20px', bottom: '20px', left: '10px', right: '10px' } // ลองเพิ่มขอบ
        // });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '10px', right: '10px' }
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

        res.send(pdf);
        console.log("ตรวจสอบ", pdf); // ตรวจสอบข้อมูล PDF ที่สร้างขึ้น

    } catch (error) {
        console.error('Detailed error:', error);
        return res.status(500).json({
            message: 'Error generating PDF',
            error: error.message,
            stack: error.stack
        });
    }
});


// Save order
router.post('/order', async (req, res, next) => {
    const userId = req.session.st_id; // ดึง user_id จาก session
    console.log(req.session)
    const { od_date,
        od_qtytotal,
        od_sumdetail,
        od_discounttotal,
        od_paytype,
        od_net,
        od_pay,
        od_change,
        od_status,
        note,
        sh_id,
        odt_id,
        dc_id,
        user_id,
        selectedItems } = req.body;
    const values = [
        od_date,
        od_qtytotal,
        od_sumdetail,
        od_discounttotal,
        od_paytype,
        od_net,
        od_pay,
        od_change,
        od_status,
        note,
        sh_id,
        odt_id,
        dc_id,
        userId // Assuming you also want to store user ID
    ];
    const query = `INSERT INTO \`order\`(od_date, od_qtytotal, od_sumdetail, od_discounttotal, od_paytype, od_net, od_pay, od_change, od_status, note, sh_id, odt_id, dc_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    connection.query(query, values, (err, results) => {
        if (!err) {
            const detailQuery = `
            INSERT INTO orderdetail (
                od_id, sm_id, odde_qty, odde_sum) VALUES ?;
        `;
            const detailValues = selectedItems.map(detail => [
                results.insertId,
                detail.sm_id,
                detail.quantity,
                detail.quantity * detail.sm_price,
            ]);
            connection.query(detailQuery, [detailValues], (err, resultsAll) => {
                if (!err) {
                    return res.status(200).json({ message: "success" });
                } else {
                    console.error("MySQL Error detail:", err);
                    return res.status(500).json({ message: "error detail", error: err });
                }
            });

        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });

})

router.get('/order', (req, res, next) => {
    const od_id = Number(req.params.od_id);

    var query = `
        SELECT o.*, s.st_name, ot.odt_name FROM \`order\` o 
        LEFT JOIN staff s ON o.user_id = s.st_id 
        LEFT JOIN orderstype ot ON o.odt_id = ot.odt_id`;

    connection.query(query, [od_id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

router.get('/order/:od_id', (req, res, next) => {
    const od_id = Number(req.params.od_id);

    var query = `SELECT * FROM \`order\`  WHERE od_id= ?;`;

    connection.query(query, [od_id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});

router.get('/latest', (req, res, next) => {
    const query = `SELECT * FROM \`order\` ORDER BY od_id DESC LIMIT 1;`; // ดึงคำสั่งซื้อที่ล่าสุด
    // console.log("SELECT * FROM \`order\` ORDER BY od_id DESC LIMIT 1;")
    // return res.status(200).json({mes:"Test"}); // ส่งกลับเฉพาะคำสั่งซื้อล่าสุด
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results[0]); // ส่งกลับเฉพาะคำสั่งซื้อล่าสุด
        } else {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "error", error: err });
        }
    });
});


//dash

//ขายดีรวม
// async function getOrderDetails(req, res) {
//     try {
//         const { startDate, endDate } = req.query;

//         const sql = `
//         SELECT 
//             DATE_FORMAT(o.created_at, '%Y-%m-%d') AS ocreated_at,
//             od.*,
//             s.*
//         FROM orderdetail od
//         JOIN \`order\` o ON o.od_id = od.od_id  
//         JOIN salesmenu s ON s.sm_id = od.sm_id  
//         LEFT JOIN salesmenutype st ON s.smt_id = st.smt_id          
//         WHERE DATE(o.created_at) BETWEEN ? AND ?
//     `;
    
//         connection.query(sql, [startDate, endDate], (err, results) => {
//             if (err) {
//                 console.error('Error executing query:', err);
//                 res.status(500).json({ message: 'Database query failed' });
//             } else {
//                 // จัดกลุ่มผลลัพธ์ตาม pd_id และ pd_name พร้อมตรวจสอบค่าซ้ำ
//                 const groupedResults = results.reduce((acc, row) => {
//                     const { sm_id, sm_name, smt_name, odde_sum,odde_id, odde_qty, od_id,ocreated_at, pdod_id, pdocreated_at, induP_id, qty } = row;

//                     // ค้นหาว่ามี pd_id นี้อยู่ใน acc หรือไม่
//                     let sm = acc.find(item => item.sm_id === sm_id);

//                     if (!sm) {
//                         // ถ้ายังไม่มีใน acc ให้เพิ่มผลิตภัณฑ์ใหม่
//                         sm = {
//                             sm: sm_id,
//                             sm_name: sm_name,
//                             smt_name: smt_name,
//                             totalprice: 0, 
//                             totalqty:0,// เพิ่มฟิลด์ totalCost เพื่อใช้ในแดชบอร์ด
//                             orderdetail: []
//                         };
//                         acc.push(sm);
//                     }

//                     // ค้นหาว่า pdo_id และ pdod_id นี้มีอยู่ใน used หรือไม่
//                     let orderdetailEntry = sm.orderdetail.find(item => item.odde_id === odde_id && item.odde_sum === odde_sum);

//                     if (!orderdetailEntry) {
//                         // ถ้ายังไม่มีให้สร้าง entry ใหม่พร้อม sumcost
//                         orderdetailEntry = {
//                             odde_id: odde_id,
//                             odde_sum: odde_sum,
//                             odde_qty: odde_qty,
//                             od_id: od_id,
//                             ocreated_at:ocreated_at
//                             // un_name: un_name,
//                             // qtyUsed: qty,
//                             // sumCost: 0,
//                             // perPiece: 0,
//                             // detail: []
//                         };
//                         sm.orderdetail.push(orderdetailEntry);
//                         sm.totalprice = parseFloat((orderdetailEntry.totalprice + row.odde_sum).toFixed(2));
//                         sm.totalqty = parseInt((orderdetailEntry.totalqty + row.odde_qty));

//                     }

//                     // ตรวจสอบว่า detail มีข้อมูลนี้อยู่หรือไม่
//                     // const detailExists = usedEntry.detail.some(detailItem =>
//                     //     detailItem.induP_id === row.induP_id && detailItem.indlde_id === row.indlde_id
//                     // );

//                     // if (!detailExists) {
//                     //     // เพิ่มรายละเอียดของการใช้ส่วนประกอบลงใน detail
//                     //     usedEntry.detail.push({
//                     //         induP_id: row.induP_id,
//                     //         indlde_id: row.indlde_id,
//                     //         qtyUseSum: row.qtyusesum,
//                     //         price: row.price,
//                     //         status: row.status,
//                     //         scrap: row.scrap,
//                     //         qtyPurchased: row.qtypurchased,
//                     //         qtyPerUnit: row.qty_per_unit,
//                     //         createdAt: row.created_at,
//                     //         costIngredient: row.costingredient
//                     //     });

//                     //     // เพิ่ม costingredient ลงใน sumCost ของ usedEntry
//                     //     // อัปเดต sumCost และ perPiece ให้เป็นตัวเลขที่มีทศนิยม 2 ตำแหน่ง
//                     //     usedEntry.sumCost = parseFloat((usedEntry.sumCost + row.costingredient).toFixed(2));
//                     //     usedEntry.perPiece = parseFloat((usedEntry.sumCost / usedEntry.qtyUsed).toFixed(2));

//                     //     // อัปเดต totalCost ของ product ด้วยค่า sumCost ของ usedEntry และทศนิยม 2 ตำแหน่ง
//                     //     product.totalCost = parseFloat((product.totalCost + row.costingredient).toFixed(2));

//                     // }

//                     return acc;
//                 }, []);

//                 // ส่งข้อมูลที่จัดกลุ่มและกรองแล้วกลับไปยัง client
//                 res.status(200).json(groupedResults);
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching ingredient used details:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }
async function getOrderDetails(req, res) {
    try {
        const { startDate, endDate } = req.query;

        const sql = `
        SELECT 
            DATE_FORMAT(o.created_at, '%Y-%m-%d') AS ocreated_at,
            od.odde_sum,
            od.odde_qty,
            od.odde_id,
            od.od_id,
            s.sm_id,
            s.sm_name,
            st.smt_name,
            ot.odt_name
        FROM orderdetail od
        JOIN \`order\` o ON o.od_id = od.od_id  
        JOIN salesmenu s ON s.sm_id = od.sm_id  
        LEFT JOIN salesmenutype st ON s.smt_id = st.smt_id      
        LEFT JOIN orderstype ot ON ot.odt_id = o.odt_id          
    
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        `;
    
        connection.query(sql, [startDate, endDate], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'Database query failed' });
            } else {
                // Grouping results based on sm_id and other properties
                const groupedResults = results.reduce((acc, row) => {
                    const { sm_id, sm_name, smt_name, odde_sum, odde_id, odde_qty, od_id, ocreated_at,odt_name } = row;

                    // Find if sm_id already exists in acc
                    let sm = acc.find(item => item.sm_id === sm_id);

                    if (!sm) {
                        // If sm_id not found, create a new entry for the salesmenu
                        sm = {
                            sm_id: sm_id,
                            sm_name: sm_name,
                            smt_name: smt_name,
                            totalprice: 0,  // Initialize total price
                            totalqty: 0,    // Initialize total quantity
                            orderdetail: []
                        };
                        acc.push(sm);
                    }

                    // Find if this orderdetail already exists in the orderdetail array
                    let orderdetailEntry = sm.orderdetail.find(item => item.odde_id === odde_id);

                    if (!orderdetailEntry) {
                        // If not found, add a new orderdetail entry
                        orderdetailEntry = {
                            odt_name:odt_name,
                            odde_id: odde_id,
                            odde_sum: odde_sum,
                            odde_qty: odde_qty,
                            od_id: od_id,
                            ocreated_at: ocreated_at
                        };
                        sm.orderdetail.push(orderdetailEntry);
                    }

                    // Update the total price and quantity
                    sm.totalprice += parseFloat(odde_sum);
                    sm.totalqty += parseInt(odde_qty, 10);

                    return acc;
                }, []);

                // Send the grouped results back to the client
                res.status(200).json(groupedResults);
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

router.get('/getOrderDetails', getOrderDetails);


module.exports = router;