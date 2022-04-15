const express = require("express");
const router = express.Router();

const controllers = require("../controllers/cartControllers");
const auth = require("../middlewares/auth");

router.post("/addToCart", auth, controllers.addToCart);
router.post("/getCartItem", auth, controllers.getCartItem);
router.post("/updateQuantity", auth, controllers.updateQuantity);
module.exports = router;
