const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, ensureManager, ensureSalesAgent } = require('../customMiddleware/auth');
const flash = require('connect-flash');

const Registration = require('../models/Registration')
const FurnitureStock = require('../models/furniture');//import the models
const woodStock = require('../models/wood');
const WoodSales = require('../models/wood_sale');
const FurnitureSales = require('../models/furniture_sales');

router.get("/register", (req, res) => {
    res.render("user");
})
router.post("/register", async (req, res) => {
    try {
        const newUser = new Registration(req.body)
        console.log(newUser)
        let user = await Registration.findOne({
            email: req.body.email
        })
        if (user) {
            return res.status(400).send('Not registered, user already exists')
        } else {
            await Registration.register(newUser, req.body.password, (error) => {
                if (error) {
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
router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    req.session.user = req.user
    // console.log(req.user)
    if (req.user.role === "manager") {
        res.redirect("/managerDashboard")
    } else if (req.user.role === "sales-Agent") {
        res.redirect("/salesAgentdashboard")
    } else {
        res.render("nonuser")
    }
});

router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).send('Error logging out!')
            }
            res.redirect('/')
        })
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await Registration.find().sort({ $natural: -1 })
        res.render("list_name", { users })
    } catch (error) {
        console.error("error getting user from theDB!")
        res.status(400).send("unable to get users from DB!")
    }
});

router.get("/managerDashboard", ensureAuthenticated, ensureManager, async (req, res) => {
    try {
        // Aggregate wood expenses
        let totalHardwood = await woodStock.aggregate([
            { $match: { productName: 'hardwood' } },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: '$quantity' },
                    totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } }
                }
            }
        ])

        let totalsoftwood = await woodStock.aggregate([
            { $match: { productName: 'softwood' } },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: '$quantity' },
                    totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } }
                }
            }
        ])
        let totalTimber = await woodStock.aggregate([
            { $match: { productName: 'timber' } },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: '$quantity' },
                    totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } }
                }
            }
        ]);
        let totalPoles = await woodStock.aggregate([
            { $match: { productName: 'poles' } },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: '$quantity' },
                    totalCost: { $sum: { $multiply: ['$unitPrice', '$quantity'] } }
                }
            }
        ]);

        // Set defaults if empty(//stops crashing incase its not there)
        totalHardwood = totalHardwood[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalsoftwood = totalsoftwood[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalTimber = totalTimber[0] ?? { totalQuantity: 0, totalCost: 0 };
        totalPoles = totalPoles[0] ?? { totalQuantity: 0, totalCost: 0 };

        // get all sales
        const woodSales = await WoodSales.find().populate("salesAgent", "username");
        const furnitureSales = await FurnitureSales.find().populate("salesAgent", "username");
        const totalSales = woodSales.length + furnitureSales.length

        const woodStocks = await woodStock.find();
        const furnitureStocks = await FurnitureStock.find();

        //calculte revenue
        const woodRevenue = woodSales.reduce((sum,sale) => sum+sale.totalPrice,0);
        const furnitureRevenue = furnitureSales.reduce((sum,sale) => sum + sale.totalPrice,0);
        const totalRevenue = woodRevenue + furnitureRevenue;

        //calculate expenses(from purchase of woodstock)
        const woodExpenses = woodStocks.reduce((sum,stock) => sum + (stock.unitPrice*stock.quantity),0);

        //profits
        const grossProfit = totalRevenue-woodExpenses;

        //low stock alerts
        const lowWoodStocks = woodStocks.filter(stock => stock.quantity <10);
        const lowFurnitureStocks = furnitureStocks.filter(stock => stock.quantity <10);

        // Render only once(should be last)
        res.render("manager_dashboard", {
            totalHardwood,
            totalsoftwood,
            totalTimber,
            totalPoles,
            woodSales,
            furnitureSales,
            woodStocks,
            furnitureStocks,
            totalRevenue,
            woodExpenses,
            grossProfit,
            lowFurnitureStocks,
            lowWoodStocks,
            totalSales,
        });

    } catch (error) {
        console.error("Error loading manager dashboard:", error);
        res.status(500).send("Error loading manager dashboard");
    }
});


router.get("/salesAgentdashboard", ensureAuthenticated, ensureSalesAgent, (req, res) => {
    res.render("salesAgent_dashboard")
});



module.exports = router;//last line