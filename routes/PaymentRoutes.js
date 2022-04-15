const express = require("express");
const router = express.Router();

const controllers = require("../controllers/PaymentControllers");
const auth = require("../middlewares/auth");

router.post("/payment", auth, controllers.payment);
router.post("/buyNow", auth, controllers.BuyNow);
router.post("/affirmConfirmation", controllers.AffirmConfirmation);
router.post("/getTaxes", controllers.GetTaxes);
router.post("/AffirmConfirmationBuyNow", controllers.AffirmConfirmationBuyNow);
module.exports = router;
