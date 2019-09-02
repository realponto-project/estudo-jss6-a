const router = require('express').Router({ mergeParams: true })
const productController = require('../../../controllers/estoque/product')

router.post('', productController.add)
router.get('', productController.getAll)
router.get('/getAllNames', productController.getAllNames)
router.get('/getProductByStockBase', productController.getProductByStockBase)

module.exports = router
