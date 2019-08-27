const router = require('express').Router({ mergeParams: true })
const stockController = require('../../../controllers/estoque')

router.get('', stockController.getAll)

module.exports = router
