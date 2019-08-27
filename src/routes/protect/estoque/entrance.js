const router = require('express').Router({ mergeParams: true })
const entranceController = require('../../../controllers/estoque/entrance')

router.post('', entranceController.add)
router.get('', entranceController.getAll)

module.exports = router
