const router = require('express').Router({ mergeParams: true })
const technicianController = require('../../../controllers/estoque/technician')

router.post('', technicianController.add)
router.get('', technicianController.getAll)
router.get('/getAllTechnician', technicianController.getAllTechnician)


module.exports = router
