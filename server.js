// const express = require("express");
// const connection = require("./connection");
// const app = express();
// const PORT = 8080;
// const cors = require("cors");

// const cookieSession = require('cookie-session');
// // const bcrypt = require('bcrypt');
// // const { body, validationResult, Result } = require('express-validator');

// // app.use(cors());
// // app.use(express.urlencoded({extended: true}));
// // app.use(express.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(cookieSession({
//     name: "session",
//     keys: ["key1", "key2"],
//     maxAge: 3600 * 1000 //hr
// }));

// //ลองอันใหม่
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     credentials: true, // Make sure to allow credentials
//     //เพิ่มเติมตอน socket มีัญหาส่งไม่ไป
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type']
  
// };
// app.use(cors(corsOptions));

// //การแจ้งเตือน
// const http = require('http');
// const socketIo = require('socket.io');
// const server = http.createServer(app); // สร้างเซิร์ฟเวอร์ HTTP
// const io = socketIo(server, {
//     cors: {
//         origin: 'http://localhost:3000', // URL ของไคลเอนต์
//         methods: ['GET', 'POST'],
//         allowedHeaders: ['Content-Type'],
//         credentials: true
//     }
// });
// const { checkMinimumIngredient } = require('./routes/notification');

// // ฟังก์ชันตรวจสอบสต็อกและส่งการแจ้งเตือน
// const monitorStockLevels = async () => {
//     try {
//         console.log('Checking ingredient stock levels...');
//         const lowStockIngredients = await checkMinimumIngredient();

//         if (lowStockIngredients.length > 0) {
//             io.emit('lowStockNotification', lowStockIngredients);
//             console.log("lowStockNotification", lowStockIngredients);
//         }
//     } catch (error) {
//         console.error('Error monitoring stock levels:', error);
//     }
// };

// // เรียกใช้ฟังก์ชันทันทีหลังจากเริ่มเซิร์ฟเวอร์
// monitorStockLevels();

// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });

//     socket.emit('testMessage', 'Socket.io is working!');
// });



// const ownerRoute = require('./routes/owner')
// const staffRoute = require('./routes/staff')
// // const {Updateqtystock,router:ingredientRoute} = require('./routes/ingredient')
// const ingredientRoute = require('./routes/ingredient')
// const productRoute = require('./routes/product')
// const salesmenuRoute = require('./routes/salesmenu')
// const productionRoute = require('./routes/production')
// const loginRoute = require('./routes/login')
// const expensesRoute = require('./routes/expenses')
// const promotionRoute = require('./routes/promotion')
// const settingRoute = require('./routes/setting')
// const notificationRoute = require('./routes/notification')

// // const { ifLoggedIn,ifNotLoggedIn, router: loginRoute } = require('./routes/login');

// app.use('/owner',ownerRoute)
// app.use('/staff',staffRoute)
// app.use('/ingredient',ingredientRoute)
// app.use('/product',productRoute)
// app.use('/salesmenu',salesmenuRoute)
// app.use('/production',productionRoute)
// app.use('/login',loginRoute)
// app.use('/expenses',expensesRoute)
// app.use('/promotion',promotionRoute)
// app.use('/setting',settingRoute)
// app.use('/notification',notificationRoute)



// // Updateqtystock();


// app.get("/",(req,res)=>{
//     res.json({message:"hello world!", pe:["taeyong","marklee","jaemin"]});
// });
// app.listen(PORT,()=>{
//     console.log(`Server started on port ${PORT}`);

// }) 


//ลองฝหม่ตอน socket
const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

// CORS settings
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// Cookie session settings
app.use(cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 3600 * 1000 // 1 hour
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

const { checkMinimumIngredient, queryAsync } = require('./routes/notification');

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId;

    const getUnreadNotifications = async (userId) => {
        const query = `
            SELECT * FROM notification
            WHERE user_id LIKE ? AND (read_id IS NULL OR read_id NOT LIKE ?)
        `;
        const results = await queryAsync(query, [`%${userId}%`, `%${userId}%`]);
        console.log(results,'results');
        return results;
    };

    // เมื่อเชื่อมต่อสำเร็จ ให้ส่งจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    socket.on('getNotificationCount', async () => {
        const unreadNotifications = await getUnreadNotifications(userId);
        socket.emit('notificationCount', unreadNotifications.length);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes
const ownerRoute = require('./routes/owner');
const staffRoute = require('./routes/staff');
const ingredientRoute = require('./routes/ingredient');
const productRoute = require('./routes/product');
const salesmenuRoute = require('./routes/salesmenu');
const productionRoute = require('./routes/production');
const loginRoute = require('./routes/login');
const expensesRoute = require('./routes/expenses');
const promotionRoute = require('./routes/promotion');
const settingRoute = require('./routes/setting');
const notificationRoute = require('./routes/notification');

app.use('/owner', ownerRoute);
app.use('/staff', staffRoute);
app.use('/ingredient', ingredientRoute);
app.use('/product', productRoute);
app.use('/salesmenu', salesmenuRoute);
app.use('/production', productionRoute);
app.use('/login', loginRoute);
app.use('/expenses', expensesRoute);
app.use('/promotion', promotionRoute);
app.use('/setting', settingRoute);
app.use('/notification', notificationRoute);

app.get("/", (req, res) => {
    res.json({ message: "hello world!", pe: ["taeyong", "marklee", "jaemin"] });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
