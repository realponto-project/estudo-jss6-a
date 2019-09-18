const router = require('express').Router({ mergeParams: true })
const entranceController = require('../../../controllers/estoque/entrance')

router.post('', entranceController.add)
router.put('', entranceController.update)
router.get('', entranceController.getAll)
router.delete('', entranceController.delet)

module.exports = router
