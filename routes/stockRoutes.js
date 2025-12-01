const express = require('express');
const router = express.Router();
// const connectEnsureLogin = require('connect-ensure-login');
const multer = require('multer');
const {ensureAuthenticated, ensureManager, ensureSalesAgent} = require('../customMiddleware/auth');

const FurnitureStock = require('../models/furniture');//import the models
const woodStock = require('../models/wood');
const WoodSales = require('../models/wood_sale');
const FurnitureSales = require('../models/furniture_sales');


// image upload  configs
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })


router.get("/registerFurniture",  (req, res) => {
    res.render("furniture", { title: "register furniture stock" });
});

router.post("/registerFurniture", ensureAuthenticated, ensureManager,  upload.single('furnitureImage'), async (req, res) => {
    try {
        const furniture = new FurnitureStock(req.body)
        furniture.furnitureImage = req.file.path//file path to go to the database
        console.log(furniture)//print it in the terminal
        await furniture.save()
        res.redirect("/registerWood")
    } catch (error) {
        console.error(error)
        res.redirect("/registerFurniture")
    }

});

router.get("/registerWood",  (req, res) => {
    res.render("wood", { title: "register wood stock" });
});

router.post("/registerWood", async (req, res) => {
    try {
        const wood = new woodStock(req.body)
        console.log(wood)
        await wood.save()
        res.redirect("/registerFurniture")//you only redirect to a route path
    } catch (error) {
        console.error()
        res.redirect("/registerWood")
    }
});

router.get("/registeredFurniture", async (req, res) => {
    try {
        const furnitureStock = await FurnitureStock.find();
        res.render("list_furniture", { furnitureStock })
    } catch (error) {
        console.error("Error getting furniture from the DB!")
        res.redirect("/")
    }
});
//get furniture stock to update
router.get("/furniture/:id",ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        const furniture = await FurnitureStock.findOne({_id:req.params.id});
        res.render("update_furniture",{item:furniture})
    } catch (error) {
      res.status(400).send("Unable to find furniture from the database")  
      console.log(error)
    }
});

router.post("/furniture",ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        await FurnitureStock.findByIdAndUpdate({_id:req.query.id},req.body);
        res.redirect("/registeredFurniture")
    } catch (error) {
      res.status(400).send("Unable to update furniture in the database")  
      console.log(error)
    }
});

//delete furniture
router.post("/deletefurniture",ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        await FurnitureStock.deleteOne({_id:req.body.id});
        res.redirect("/registeredFurniture")
    } catch (error) {
      res.status(400).send("Unable to delete furniture in the database")  
      console.log(error)
    }
});


router.get("/registeredWood", async (req, res) => {
    try {
        const wood = await woodStock.find();
        res.render("list_wood", { wood })
    } catch (error) {
        console.error("Error getting furniture from the DB!")
        res.redirect("/")
    }

});

//get wood stock to update
router.get("/wood/:id", ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        const wood = await woodStock.findOne({_id:req.params.id});
        res.render("update_wood",{item:wood})
    } catch (error) {
      res.status(400).send("Unable to find wood from the database")  
      console.log(error)
    }
});

router.post("/wood",ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        await woodStock.findByIdAndUpdate({_id:req.query.id},req.body);
        res.redirect("/registeredWood")
    } catch (error) {
      res.status(400).send("Unable to update wood in the database")  
      console.log(error)
    }
});

//delete wood
router.post("/deletewood", ensureAuthenticated, ensureManager, async (req,res)=>{
    try {
        await woodStock.deleteOne({_id:req.body.id});
        res.redirect("/registeredWood")
    } catch (error) {
      res.status(400).send("Unable to delete wood in the database")  
      console.log(error)
    }
});
module.exports = router;