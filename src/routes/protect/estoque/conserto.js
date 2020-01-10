const router = require("express").Router({ mergeParams: true });
const consertoController = require("../../../controllers/estoque/conserto");

router.post("", consertoController.add);

module.exports = router;
