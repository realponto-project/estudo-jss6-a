const router = require('express').Router({ mergeParams: true })
const manufacturerController = require('../../../controllers/estoque/product/mark/manufacturer')

router.post('', manufacturerController.add)
router.get('', manufacturerController.getManufacturerByMark)

module.exports = router
