const router = require('express').Router({ mergeParams: true })
const reserveController = require('../../../controllers/estoque/reserve')

router.post('', reserveController.addStatusExpedition)
router.put('', reserveController.updateStatusExpedition)
router.delete('', reserveController.deleteStatusExpedition)
router.get('', reserveController.getAllStatusExpedition)

module.exports = router
