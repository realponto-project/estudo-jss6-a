const router = require('express').Router({ mergeParams: true })
const userController = require('../../controllers/user')


router.post('', userController.add)
router.put('', userController.update)
router.put('/updatePassword', userController.updatePassword)
router.get('/getResourceByUsername', userController.getResourceByUsername)
router.get('/getAll', userController.getAll)

module.exports = router
