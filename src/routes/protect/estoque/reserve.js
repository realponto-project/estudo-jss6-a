const router = require('express').Router({ mergeParams: true })
const reserveController = require('../../../controllers/estoque/reserve')

router.post('/OS', reserveController.addOs)
router.put('/OS', reserveController.updateOs)
router.delete('/OS', reserveController.deleteOs)
router.get('/OS', reserveController.getAllOs)
router.get('/getOsByOs', reserveController.getOsByOs)
router.put('/output', reserveController.output)
router.post('/kit', reserveController.addKit)
router.get('/kit', reserveController.getAllKit)
router.get('/kitDefaultValue', reserveController.getKitDefaultValue)
router.post('/kitOut', reserveController.addKitOut)
router.get('/kitOut', reserveController.getAllKitOut)
router.post('/freeMarket', reserveController.addFreeMarket)
router.get('/freeMarket', reserveController.getAllFreeMarket)

module.exports = router
