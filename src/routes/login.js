const router = require("express").Router({ mergeParams: true });
const loginController = require("../controllers/login");
const utilController = require("../controllers/util");

router.get("/auth", loginController.checkSessionIsValid);
router.post("/login", loginController.loginController);
router.delete("/logout", loginController.logoutController);

router.get("/util/deleteEComerce", utilController.deleteEComerce);
router.get(
  "/util/associateTechnicianReverve",
  utilController.associateTechnicianReverve
);
router.get("/util/writeDefautsEntrances", utilController.writeDefautsEntrances);
router.get("/util/writeDefautsConserto", utilController.writeDefautsConserto);

module.exports = router;
