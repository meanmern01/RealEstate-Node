const express = require("express");
const router = express.Router();

const controllers = require("../controllers/UserControllers");
const auth = require("../middlewares/auth");
router.post("/signup", controllers.signup);
router.post("/login", controllers.login);
router.post("/forgotPassword", controllers.forgotPassword);
router.post("/resetPassword", controllers.resetPassword);
router.get("/validToken", auth, controllers.validtestToken);
router.post("/ContactUs", controllers.ContactUs);
router.post("/storeAddress", auth, controllers.StoreAddress);
router.get("/getUser", auth, controllers.getUser);
module.exports = router;
