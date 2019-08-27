const router = require('express').Router({ mergeParams: true })
const equipModelController = require('../../../controllers/estoque/product/equip/equipModel')

router.post('/addType', equipModelController.addType)
router.get('/getAllType', equipModelController.getAllType)
router.post('/addModel', equipModelController.addModel)

module.exports = router
