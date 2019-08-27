const router = require('express').Router({ mergeParams: true })
const technicianController = require('../../../controllers/estoque/technician')

router.post('', technicianController.add)
router.get('', technicianController.getAll)

module.exports = router
