const router = require('express').Router({ mergeParams: true })
const productController = require('../../../controllers/estoque/product')

router.post('', productController.add)
router.put('', productController.update)
router.get('', productController.getAll)
router.get('/getEquipsByEntrance', productController.getEquipsByEntrance)
router.get('/getAllNames', productController.getAllNames)
router.get('/getProductByStockBase', productController.getProductByStockBase)

module.exports = router
