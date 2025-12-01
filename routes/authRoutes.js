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
});

router.post("/register", async (req, res) => {
    try {
        const { username, email, role, password } = req.body;

        // Validate fields
        if (!username || !email || !role || !password) {
            req.flash("error_msg", "All fields are required");
            return res.redirect("/register");
        }

        // Check if user already exists
        let user = await Registration.findOne({ email });
        if (user) {
            req.flash("error_msg", "User already exists");
            return res.redirect("/register");
        }

        // Create new user
        const newUser = new Registration({ username, email, role });
        await Registration.register(newUser, password);

        req.flash("success_msg", "User successfully registered");
        res.redirect("/login"); // redirect to login or home
    } catch (error) {
        console.error(error.message);
        req.flash("error_msg", "Something went wrong!");
        res.redirect("/register");
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
        const woodRevenue = woodSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const furnitureRevenue = furnitureSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalRevenue = woodRevenue + furnitureRevenue;

        //calculate expenses(from purchase of woodstock)
        const woodExpenses = woodStocks.reduce((sum, stock) => sum + (stock.unitPrice * stock.quantity), 0);

        //profits
        const grossProfit = totalRevenue - woodExpenses;

        //low stock alerts
        const lowWoodStocks = woodStocks.filter(stock => stock.quantity < 10);
        const lowFurnitureStocks = furnitureStocks.filter(stock => stock.quantity < 10);

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


router.get("/salesAgentdashboard", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const agentId = req.user._id;
    const agentName = req.user.username;

    // Start of today (for today's sales)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Aggregate wood sales for this agent today
    let todaysWoodSales = await WoodSales.aggregate([
      { $match: { salesAgent: agentId, date: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          count: { $sum: "$quantity" },
          commission: { $sum: "$commission" } // if you store commission
        }
      }
    ]);

    // Aggregate furniture sales for this agent today
    let todaysFurnitureSales = await FurnitureSales.aggregate([
      { $match: { salesAgent: agentId, date: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          count: { $sum: "$quantity" },
          commission: { $sum: "$commission" }
        }
      }
    ]);

    // Combine totals safely
    const salesData = {
      total: (todaysWoodSales[0]?.total || 0) + (todaysFurnitureSales[0]?.total || 0),
      count: (todaysWoodSales[0]?.count || 0) + (todaysFurnitureSales[0]?.count || 0),
      commission: (todaysWoodSales[0]?.commission || 0) + (todaysFurnitureSales[0]?.commission || 0)
    };

    // Optional: fetch products in stock for dropdown in sales form
    const woodStocks = await woodStock.find();
    const furnitureStocks = await FurnitureStock.find();

    // Optional: recent sales for this agent
    const last5WoodSales = await WoodSales.find({ salesAgent: agentId }).sort({ date: -1 }).limit(5);
    const last5FurnitureSales = await FurnitureSales.find({ salesAgent: agentId }).sort({ date: -1 }).limit(5);

    // Render sales agent dashboard
    res.render("salesAgent_dashboard", {
      agentName,
      todaysSales: salesData.total,
      productsSold: salesData.count,
      commission: salesData.commission,
      woodStocks,
      furnitureStocks,
      recentWoodSales: last5WoodSales,
      recentFurnitureSales: last5FurnitureSales,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });

  } catch (error) {
    console.error("Error loading sales agent dashboard:", error);
    req.flash("error_msg", "Unable to load dashboard. Try again later.");
    res.redirect("/");
  }
});

module.exports = router;//last line