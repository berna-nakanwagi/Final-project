const express = require('express');
const router =   express.Router();
const passport = require('passport');
const {ensureAuthenticated, ensureManager, ensureSalesAgent} = require('../customMiddleware/auth');
const flash = require('connect-flash');

const Registration = require('../models/Registration')
const FurnitureStock = require('../models/furniture');//import the models
const woodStock = require('../models/wood');
const WoodSales = require('../models/wood_sale');
const FurnitureSales = require('../models/furniture_sales');

router.get("/register", (req, res) => {
    res.render("user");
})
router.post("/register", async(req, res ) => {
    try {
         const newUser= new Registration(req.body)
    console.log(newUser)
    let user = await Registration.findOne({
        email: req.body.email
    })
    if(user){
        return res.status(400).send('Not registered, user already exists')
    }else{
         await Registration.register(newUser,req.body.password,(error)=>{
        if(error){
            throw error;
        }
    })
    req.flash("success_msg", "User successfully registered")
    res.redirect("/")  
    }
  } catch (error) {
       console.error(error.message)
       res.status(400).send('something went wrong!') 
    }
});

router.get("/login", (req, res) => {
    res.render("login")
})
router.post("/login", passport.authenticate("local",{failureRedirect: "/login"}), (req ,res) => {
req.session.user = req.user
// console.log(req.user)
if(req.user.role ==="manager"){
    res.redirect("/managerDashboard")
}else if(req.user.role==="sales-Agent"){
    res.redirect("/salesAgentdashboard")
}else{
    res.render("nonuser")
}
});

router.get("/logout", (req, res) => {
   if(req.session){
    req.session.destroy((error) =>{
        if(error){
            return res.status(500).send('Error logging out!')
        }
        res.redirect('/')
    })
   } 
});

router.get("/users", async(req, res) =>{
    try {
        const users = await Registration.find().sort({$natural:-1})
        res.render("list_name", {users})
    } catch (error) {
        console.error("error getting user from theDB!")
        res.status(400).send("unable to get users from DB!")
    }
});

router.get("/managerDashboard", ensureAuthenticated, ensureManager, async (req, res) => {
    try {
        // Aggregate wood expenses
        let totalHardWood = await woodStock.aggregate([
            { $match: { woodType: 'hardwood' } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } } } }
        ]);

        let totalSoftWood = await woodStock.aggregate([
            { $match: { woodType: 'softwood' } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } } } }
        ]);

        let totalTimber = await woodStock.aggregate([
            { $match: { woodType: 'timber' } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } } } }
        ]);

        let totalPoles = await woodStock.aggregate([
            { $match: { woodType: 'poles' } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } } } }
        ]);

        // Set defaults if empty
        totalHardWood = totalHardWood[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalSoftWood = totalSoftWood[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalTimber = totalTimber[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalPoles = totalPoles[0] ?? { totalQuantity: 0, totalCost: 0 };

        // Optional: get sales and stock
        const woodSales = await WoodSales.find().populate("salesAgent", "username");
        const furnitureSales = await FurnitureSales.find().populate("salesAgent", "username");

        const woodStocks = await woodStock.find();
        const furnitureStocks = await FurnitureStock.find();

        // Render only once
        res.render("manager_dashboard", {
            totalHardWood,
            totalSoftWood,
            totalTimber,
            totalPoles,
            woodSales,
            furnitureSales,
            woodStocks,
            furnitureStocks
        });

    } catch (error) {
        console.error("Error loading manager dashboard:", error);
        res.status(500).send("Error loading manager dashboard");
    }
});


 router.get("/salesAgentdashboard",ensureAuthenticated, ensureSalesAgent,(req, res) => {
    res.render("salesAgent_dashboard" )
 });



module.exports = router;//last line