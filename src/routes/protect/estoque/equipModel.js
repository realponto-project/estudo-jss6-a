const router = require('express').Router({ mergeParams: true })
const equipModelController = require('../../../controllers/estoque/product/equip/equipModel')

router.post('/addType', equipModelController.addType)
router.get('/getAllType', equipModelController.getAllType)

module.exports = router
