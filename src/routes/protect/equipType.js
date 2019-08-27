const router = require('express').Router({ mergeParams: true })
const equipTypeController = require('../../controllers/equip/equipType')


router.get('', equipTypeController.getAll)
router.post('/addModel', equipTypeController.addModel)
router.post('/addMark', equipTypeController.addMark)
router.get('/getAllMarkByType', equipTypeController.getAllMarkByType)
router.get('/getAllModelByMark', equipTypeController.getAllModelByMark)


module.exports = router
