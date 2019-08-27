const router = require('express').Router({ mergeParams: true })
const partController = require('../../../controllers/estoque/product/part')

router.post('', partController.add)

module.exports = router
