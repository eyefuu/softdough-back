const express = require("express");
const connection = require("./connection");
const app = express();
const PORT = 8080;
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const ownerRoute = require('./routes/owner')
const staffRoute = require('./routes/staff')
const ingredientRoute = require('./routes/ingredient')
const productRoute = require('./routes/product')
const salesmenuRoute = require('./routes/salesmenu')


app.use('/owner',ownerRoute)
app.use('/staff',staffRoute)
app.use('/ingredient',ingredientRoute)
app.use('/product',productRoute)
app.use('/salesmenu',salesmenuRoute)



app.get("/home",(req,res)=>{
    res.json({message:"hello world!", pe:["taeyong","marklee","jaemin"]});
});
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})
