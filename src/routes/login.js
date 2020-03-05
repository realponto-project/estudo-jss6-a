const router = require("express").Router({ mergeParams: true });
const loginController = require("../controllers/login");
const utilController = require("../controllers/util");

router.get("/auth", loginController.checkSessionIsValid);
router.post("/login", loginController.loginController);
router.delete("/logout", loginController.logoutController);

router.get("/util/deleteEComerce", utilController.deleteEComerce);

module.exports = router;
