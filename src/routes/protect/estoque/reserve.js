const router = require('express').Router({ mergeParams: true })
const reserveController = require('../../../controllers/estoque/reserve')

router.post('/OS', reserveController.addOs)
router.delete('/OS', reserveController.deleteOs)
router.get('/OS', reserveController.getAllOs)
router.get('/getOsByOs', reserveController.getOsByOs)
router.put('/output', reserveController.output)
router.post('/kit', reserveController.addKit)
router.get('/kit', reserveController.getAllKit)
router.post('/kitOut', reserveController.addKitOut)
router.post('/freeMarket', reserveController.addFreeMarket)

module.exports = router
