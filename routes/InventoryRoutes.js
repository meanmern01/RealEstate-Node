const express = require("express");
const router = express.Router();

const controllers = require("../controllers/InventoryControllers");
const auth = require("../middlewares/auth");

router.post("/getProducts", auth, controllers.getProducts);

module.exports = router;
