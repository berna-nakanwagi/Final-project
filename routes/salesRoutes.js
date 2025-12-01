const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureSalesAgent } = require('../customMiddleware/auth');
const WoodStock = require('../models/wood');
const WoodSales = require('../models/wood_sale');

// Show wood sales form
router.get("/woodsales", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const woodStocks = await WoodStock.find();
    res.render("Makewood_sale", { woodsales: woodStocks });
  } catch (error) {
    console.error(error.message);
    res.redirect("/");
  }
});

// Record a wood sale
router.post("/woodsales", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const { productName, quantity, unitPrice, quality, paymentType, transport, measurements, color } = req.body;

    // Find stock
    const stocks = await WoodStock.find({ productName });
    if (!stocks || stocks.length === 0) return res.status(400).send("Stock not found");

    const totalAvailable = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    if (totalAvailable < Number(quantity)) return res.status(400).send("Insufficient stock");

    // Calculate total price
    let totalPrice = unitPrice * Number(quantity);
    if (transport) totalPrice *= 1.05;

    // Create sale
    const sale = new WoodSales({
      productName,
      quantity,
      unitPrice,
      quality,
      date: new Date(),
      paymentType,
      measurements,
      color,
      transport: !!transport,
      salesAgent: req.user._id,
      totalPrice
    });

    await sale.save();

    // Deduct stock
    let remaining = Number(quantity);
    for (const stock of stocks) {
      if (remaining <= 0) break;
      const deduct = Math.min(stock.quantity, remaining);
      stock.quantity -= deduct;
      remaining -= deduct;
      await stock.save();
    }

    req.flash("success_msg", "Wood sale recorded successfully!");
    res.redirect("/registeredWoodsale");
  } catch (error) {
    console.error(error.message);
    req.flash("error_msg", "Unable to record sale");
    res.redirect("/woodsales");
  }
});

// List all wood sales
router.get("/registeredWoodsale", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const woodsalesList = await WoodSales.find().populate("salesAgent", "username");
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting wood sales from DB", error);
    res.redirect("/");
  }
});
// get single wood sale to update
router.get("/wood_sale/:id", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const woodsalesList = await WoodSales.find();   // <-- REQUIRED
    const sale = await WoodSales.findById(req.params.id);

    if (!sale) return res.status(404).send("Sale not found");

    res.render("update_woodSale", { 
      woodsales: woodsalesList,   // <-- FIXED
      item: sale
    });

  } catch (error) {
    console.error(error);
    res.status(400).send("Unable to find wood sale");
  }
});


module.exports = router;
