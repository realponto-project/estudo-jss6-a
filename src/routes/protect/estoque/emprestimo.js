const router = require("express").Router({ mergeParams: true });
const emprestimoController = require("../../../controllers/estoque/emprestimo");

router.post("", emprestimoController.add);
router.put("", emprestimoController.update);
router.get("", emprestimoController.getAll);
router.delete("", emprestimoController.delet);

module.exports = router;
