const router = require("express").Router({ mergeParams: true });
const emprestimoController = require("../../../controllers/estoque/emprestimo");

router.post("", emprestimoController.add);

module.exports = router;
