const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureManager, ensureSalesAgent} = require('../customMiddleware/auth');
const FurnitureStock = require('../models/furniture');//import the models
const woodStock = require('../models/wood');
const woodsales = require('../models/wood_sale');
const FurnitureSales = require('../models/furniture_sales');

// wood sales routes
 router.get("/woodsales", async(req, res) => {
   try {
      const woodsales = await woodStock.find();
      res.render("Makewood_sale",{woodsales})
   } catch (error) {
     console.error(error.message)
   }
  
 });
  router.post("/woodsales", async(req, res) => {
   try {
      const {productName,quantity,unitPrice,quality,date,paymentType,transport,measurements,color}= req.body;
      //find all  woodstock with wood name
      const stocks =await woodStock.find({productName:productName});
      if(!stocks|| stocks.length === 0)
       return res.status(400).send("stock not found");
      // calculate total available quantity across all stock entries
      const totalAvailable =stocks.reduce((sum,stock)=> sum + stock.quantity,0)
      if (totalAvailable < Number(quantity))
         return res.status(400).send("Insufficient stock")
      //calculate total price
      let total = unitPrice * Number(quantity)
      if(transport)
          total *= 1.05;
      const sale =new woodsales({
         productName,
         quantity,
         unitPrice,
         quality,
         date,   
         paymentType,
         measurements,
         color,
         transport:!!transport,
         salesAgent:req.user._id,
         totalPrice:total
      })
       await sale.save();
// deduct quantity from the stock
      let remainingToDeduct =  Number(quantity)
      for(const stock of stocks){
       if(remainingToDeduct <=0) break;
       const deductFromThis =Math.min(stock.quantity,remainingToDeduct)
       stock.quantity-=deductFromThis
       remainingToDeduct-=deductFromThis
       await stock.save();
      }
      res.redirect("/registeredFurniture")
   } catch (error) {
     console.error(error.message)
   }
 });

router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});
router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});
router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});
router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});
router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});

router.get("/registeredWoodsale", async (req, res) => {
  try {
    const woodsalesList = await woodsales.find();   
    res.render("list_woodsale", { woodsales: woodsalesList });
  } catch (error) {
    console.error("Error getting woodsale from the DB!", error);
    res.redirect("/");
  }
});


 //get woodsale to update
 router.get("/wood_sale/:id", async (req,res)=>{
     try {
         const woodsale = await woodsale.findOne({_id:req.params.id});
         res.render("list_woodsale",{item:woodsale})
     } catch (error) {
       res.status(400).send("Unable to find woodsale from the database")  
       console.log(error)
     }
 });
 

 // furniture sales routes
 router.get("/furnituresales",  (req, res) => {
    res.render("Makefurniture_sale")
 });

 module.exports = router;