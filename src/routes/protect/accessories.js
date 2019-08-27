const router = require('express').Router({ mergeParams: true })
const accessoriesController = require('../../controllers/entryEquipment/accessories')

router.post('', accessoriesController.add)
router.get('', accessoriesController.getAll)


module.exports = router
