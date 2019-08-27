const router = require('express').Router({ mergeParams: true })
const carController = require('../../../controllers/estoque/technician/car')

router.post('', carController.add)
router.get('', carController.getAll)

module.exports = router
