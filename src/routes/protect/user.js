const router = require('express').Router({ mergeParams: true })
const userController = require('../../controllers/user')


router.post('', userController.add)
router.get('/getResourceByUsername', userController.getResourceByUsername)
router.get('/getAll', userController.getAll)

module.exports = router
