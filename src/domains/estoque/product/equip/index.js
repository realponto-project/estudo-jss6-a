/* eslint-disable array-callback-return */
const R = require('ramda')
// const moment = require('moment')
// const Sequelize = require('sequelize')

// const { Op: operators } = Sequelize
// const { Op: operators } = Sequelize

const formatQuery = require('../../../../helpers/lazyLoad')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

// const EquipModel = database.model('equipModel')
// const EquipMark = database.model('equipMark')
// const EquipType = database.model('equipType')
// const EquipModel = database.model('equipModel')
const Product = database.model('product')
const ProductBase = database.model('productBase')
const Company = database.model('company')
const Equip = database.model('equip')
const User = database.model('user')
const OsParts = database.model('osParts')
const Os = database.model('os')
const FreeMarketParts = database.model('freeMarketParts')
const FreeMarket = database.model('freeMarket')


module.exports = class EquipDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const equip = R.omit(['id'], bodyData)

    const equipNotHasProp = prop => R.not(R.has(prop, equip))

    const field = {
      // equipModelId: false,
      companyId: false,
      serialNumber: false,
      corLeitor: false,
      tipoCracha: false,
      details: false,
      responsibleUser: false,
      proximidade: false,
      bio: false,
      barras: false,
      cartografico: false,
    }
    const message = {
      // equipModelId: '',
      companyId: '',
      serialNumber: '',
      corLeitor: '',
      tipoCracha: '',
      details: '',
      responsibleUser: '',
      proximidade: '',
      bio: '',
      barras: '',
      cartografico: '',
    }

    let errors = false

    // if (equipNotHasProp('equipModelId') || !equip.equipModelId) {
    //   errors = true
    //   field.equipModelId = true
    //   message.equipModelId = 'Por favor selecione o modelo de equipamento.'
    // } else {
    //   const equipModelReturned = await EquipModel.findOne({
    //     where: { id: equip.equipModelId },
    //     transaction,
    //   })

    //   if (!equipModelReturned) {
    //     errors = true
    //     field.equipModelId = true
    //     message.equipModelId = 'Esse tipo de quipamento não existe.'
    //   }
    // }

    if (equipNotHasProp('companyId') || !equip.companyId) {
      errors = true

      field.cnpj = true
      message.cnpj = 'Cnpj não cadastrado'

      field.companyId = true
      message.companyId = 'Por favor selecione uma empresa.'
    } else {
      const companyReturned = await Company.findOne({
        where: { id: equip.companyId },
        transaction,
      })

      if (!companyReturned) {
        errors = true
        field.companyId = true
        message.companyId = 'Essa empresa não existe.'
      }
    }

    if (equipNotHasProp('serialNumber') || !equip.serialNumber) {
      errors = true
      field.serialNumber = true
      message.serialNumber = 'Por favor informe o número de série.'
    } else {
      const serialNumberReturned = await Equip.findOne({
        where: { serialNumber: equip.serialNumber },
        transaction,
      })

      if (serialNumberReturned) {
        errors = true
        field.serialNumber = true
        message.serialNumber = 'Esse equipamento já está cadastrado.'
      }
    }

    if (equipNotHasProp('proximidade') || typeof equip.proximidade !== 'boolean') {
      errors = true
      field.proximidade = true
      message.proximidade = 'proximidade não é um booleano'
    }
    if (equipNotHasProp('bio') || typeof equip.bio !== 'boolean') {
      errors = true
      field.bio = true
      message.bio = 'bio não é um booleano'
    }
    if (equipNotHasProp('barras') || typeof equip.barras !== 'boolean') {
      errors = true
      field.barras = true
      message.barras = 'barras não é um booleano'
    }
    if (equipNotHasProp('cartografico') || typeof equip.cartografico !== 'boolean') {
      errors = true
      field.cartografico = true
      message.cartografico = 'cartografico não é um booleano'
    }

    if (equipNotHasProp('corLeitor')
    || (equip.corLeitor !== 'Branco'
    && equip.corLeitor !== 'Vermelho'
    && equip.corLeitor !== 'Azul'
    && equip.corLeitor !== 'Verde'
    && equip.corLeitor !== 'NaoSeAplica')) {
      errors = true
      field.corLeitor = true
      message.corLeitor = 'leitor inválido.'
    }

    if (equipNotHasProp('tipoCracha')
    || (equip.tipoCracha !== 'Hid'
    && equip.tipoCracha !== 'Mifare'
    && equip.tipoCracha !== 'Wiegand'
    && equip.tipoCracha !== 'Abatrack'
    && equip.tipoCracha !== 'Sarial'
    && equip.tipoCracha !== 'NaoSeAplica')) {
      errors = true
      field.tipoCracha = true
      message.tipoCracha = 'leitor inválido.'
    }

    if (equipNotHasProp('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      })

      if (!user) {
        errors = true
        field.responsibleUser = true
        message.responsibleUser = 'username inválido.'
      }
    } else {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não pode ser nulo.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const equipCreated = await Equip.create(equip, { transaction })

    const response = await Equip.findByPk(equipCreated.id, {
      include: [
        {
          model: Company,
        },
        // {
        //   model: EquipModel,
        //   include: [
        //     {
        //       model: EquipMark,
        //       include: [{
        //         model: EquipType,
        //       }],
        //     },
        //   ],
        // },
      ],
      transaction,
    })

    return response
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: 'createdAt',
      acendent: true,
      direction: 'DESC',
    }

    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const newOrder = (query && query.order) ? query.order : inicialOrder

    if (newOrder.acendent) {
      newOrder.direction = 'DESC'
    } else {
      newOrder.direction = 'ASC'
    }

    const {
      getWhere,
      limit,
      offset,
      pageResponse,
    } = formatQuery(newQuery)

    const equips = await Equip.findAndCountAll({
      where: getWhere('equip'),
      // attributes: ['id'],
      include: [
        // {
        //   model: Company,
        //   where: getWhere('company'),
        //   // attributes: [],
        // },
        // {
        //   model: EquipModel,
        //   // attributes: [],
        //   where: getWhere('equipModel'),
        //   include: [{
        //     model: EquipMark,
        //     where: getWhere('equipMark'),
        //     include: [{
        //       model: EquipType,
        //       where: getWhere('equipType'),
        //     }],
        //   }],
        // },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = equips

    const formatData = R.map((equip) => {
      const resp = {
        id: equip.id,
        // companyId: equip.companyId,
        // equipModelId: equip.equipModelId,
        // razaoSocial: equip.company.razaoSocial,
        // cnpj: equip.company.cnpj,
        // street: equip.company.street,
        // number: equip.company.number,
        // city: equip.company.city,
        // state: equip.company.state,
        // neighborhood: equip.company.neighborhood,
        // referencePoint: equip.company.referencePoint,
        // zipCode: equip.company.zipCode,
        // telphone: equip.company.telphone,
        // email: equip.company.email,
        // nameContact: equip.company.nameContact,
        // type: equip.equipModel.equipMark.equipType.type,
        // mark: equip.equipModel.equipMark.mark,
        // model: equip.equipModel.model,
        // description: equip.equipModel.description,
        // serialNumber: equip.serialNumber,
        // corLeitor: equip.corLeitor,
        // tipoCracha: equip.tipoCracha,
        // details: equip.details,
        // proximidade: equip.proximidade,
        // bio: equip.bio,
        // barras: equip.barras,
        // cartografico: equip.cartografico,
        // responsibleUser: equip.responsibleUser,
        // createdAt: formatDateFunct(equip.createdAt),
        // updatedAt: formatDateFunct(equip.updatedAt),
      }

      return resp
    })

    const equipsList = formatData(rows)


    const response = {
      page: pageResponse,
      show: limit,
      count: equipsList.length,
      rows: equipsList,
    }

    // console.log(response)

    return response
  }

  // async getAll(options = {}) {
  //   const inicialOrder = {
  //     field: 'createdAt',
  //     acendent: true,
  //     direction: 'DESC',
  //   }

  //   const { query = null, transaction = null } = options

  //   const newQuery = Object.assign({}, query)
  //   const newOrder = (query && query.order) ? query.order : inicialOrder

  //   if (newOrder.acendent) {
  //     newOrder.direction = 'DESC'
  //   } else {
  //     newOrder.direction = 'ASC'
  //   }

  //   const {
  //     getWhere,
  //     limit,
  //     offset,
  //     pageResponse,
  //   } = formatQuery(newQuery)

  //   const equips = await Equip.findAndCountAll({
  //     where: getWhere('equip'),
  //     // attributes: ['id'],
  //     include: [
  //       {
  //         model: Company,
  //         where: getWhere('company'),
  //         // attributes: [],
  //       },
  //       // {
  //       //   model: EquipModel,
  //       //   // attributes: [],
  //       //   where: getWhere('equipModel'),
  //       //   include: [{
  //       //     model: EquipMark,
  //       //     where: getWhere('equipMark'),
  //       //     include: [{
  //       //       model: EquipType,
  //       //       where: getWhere('equipType'),
  //       //     }],
  //       //   }],
  //       // },
  //     ],
  //     order: [
  //       [newOrder.field, newOrder.direction],
  //     ],
  //     limit,
  //     offset,
  //     transaction,
  //   })

  //   // const global = query.filters.global.replace(/\W/gi, '')


  //   // const searchEquip = await Equip.findAndCountAll({
  //   //   where: { serialNumber: { [operators.iRegexp]: global } },
  //   //   attributes: ['id'],
  //   //   limit,
  //   //   offset,
  //   //   transaction,
  //   // })

  //   // const searchCompany = await Equip.findAndCountAll({
  //   //   attributes: ['id'],
  //   //   include: [
  //   //     {
  //   //       model: Company,
  //   //       where: {
  //   //         [operators.or]: [
  //   //           {
  //   //             cnpj: { [operators.iRegexp]: global },

  //   //           },
  //   //           {
  //   //             razaoSocial: { [operators.iRegexp]: global },
  //   //           },
  //   //         ],
  //   //       },
  //   //       attributes: [],
  //   //     },
  //   //   ],
  //   //   order: [
  //   //     [newOrder.field, newOrder.direction],
  //   //   ],
  //   //   limit,
  //   //   offset,
  //   //   transaction,
  //   // })

  //   // const formatedJSON = json => JSON.parse(JSON.stringify(json))

  //   // const extractId = (search) => {
  //   //   const searchFormated = formatedJSON(search).rows

  //   //   const arraySearchId = []

  //   //   searchFormated.map((item) => {
  //   //     const id = R.prop('id', item)

  //   //     arraySearchId.push(id)
  //   //   })

  //   //   return arraySearchId
  //   // }

  //   // const searchCompanyIds = extractId(searchCompany)
  //   // const searchEquipIds = extractId(searchEquip)
  //   // // console.log(searchCompanyIds)
  //   // // console.log(searchEquipIds)

  //   // Array.prototype.push.apply(searchCompanyIds, searchEquipIds)
  //   // console.log(searchCompanyIds)

  //   // // searchCompanyIds.filter((este, i) => searchCompanyIds.indexOf(este) === i)


  //   // const novaArr = searchCompanyIds.filter((este, i) => searchCompanyIds.indexOf(este) === i)

  //   // console.log(novaArr)


  //   // // const findByPkSearchArray = R.map(async (item) => {
  //   // //   const equip = await Equip.findByPk(item, {
  //   // //     include: [
  //   // //       {
  //   // //         model: Company,
  //   // //       },
  //   // //       {
  //   // //         model: EquipModel,
  //   // //         include: [{
  //   // //           model: EquipMark,
  //   // //           include: [{
  //   // //             model: EquipType,
  //   // //           }],
  //   // //         }],
  //   // //       },
  //   // //     ],
  //   // //     transaction,
  //   // //   })

  //   // //   const resp = {
  //   // //     id: equip.id,
  //   // //     companyId: equip.companyId,
  //   // //     equipModelId: equip.equipModelId,
  //   // //     razaoSocial: equip.company.razaoSocial,
  //   // //     cnpj: equip.company.cnpj,
  //   // //     street: equip.company.street,
  //   // //     number: equip.company.number,
  //   // //     city: equip.company.city,
  //   // //     state: equip.company.state,
  //   // //     neighborhood: equip.company.neighborhood,
  //   // //     referencePoint: equip.company.referencePoint,
  //   // //     zipCode: equip.company.zipCode,
  //   // //     telphone: equip.company.telphone,
  //   // //     email: equip.company.email,
  //   // //     nameContact: equip.company.nameContact,
  //   // //     type: equip.equipModel.equipMark.equipType.type,
  //   // //     mark: equip.equipModel.equipMark.mark,
  //   // //     model: equip.equipModel.model,
  //   // //     description: equip.equipModel.description,
  //   // //     serialNumber: equip.serialNumber,
  //   // //     corLeitor: equip.corLeitor,
  //   // //     tipoCracha: equip.tipoCracha,
  //   // //     details: equip.details,
  //   // //     proximidade: equip.proximidade,
  //   // //     bio: equip.bio,
  //   // //     barras: equip.barras,
  //   // //     cartografico: equip.cartografico,
  //   // //     responsibleUser: equip.responsibleUser,
  //   // //     // createdAt: formatDateFunct(equip.createdAt),
  //   // //     // updatedAt: formatDateFunct(equip.updatedAt),
  //   // //   }
  //   // //   return resp
  //   // // })


  //   // const newRows = []

  //   // // console.log(searchCompanyIds)

  //   // await Promise.all(
  //   //   searchCompanyIds.map(async (item) => {
  //   //     const equip = await Equip.findByPk(item, {
  //   //       include: [
  //   //         {
  //   //           model: Company,
  //   //         },
  //   //         {
  //   //           model: EquipModel,
  //   //           include: [{
  //   //             model: EquipMark,
  //   //             include: [{
  //   //               model: EquipType,
  //   //             }],
  //   //           }],
  //   //         },
  //   //       ],
  //   //       transaction,
  //   //     })

  //   //     const equipFormated = formatedJSON(equip)


  //   //     newRows.push(equipFormated)
  //   //   }),
  //   // )

  //   // // console.log(newRows)

  //   // const formatData = R.map((equip) => {
  //   //   const resp = {
  //   //     id: equip.id,
  //   //     companyId: equip.companyId,
  //   //     equipModelId: equip.equipModelId,
  //   //     razaoSocial: equip.company.razaoSocial,
  //   //     cnpj: equip.company.cnpj,
  //   //     street: equip.company.street,
  //   //     number: equip.company.number,
  //   //     city: equip.company.city,
  //   //     state: equip.company.state,
  //   //     neighborhood: equip.company.neighborhood,
  //   //     referencePoint: equip.company.referencePoint,
  //   //     zipCode: equip.company.zipCode,
  //   //     telphone: equip.company.telphone,
  //   //     email: equip.company.email,
  //   //     nameContact: equip.company.nameContact,
  //   //     type: equip.equipModel.equipMark.equipType.type,
  //   //     mark: equip.equipModel.equipMark.mark,
  //   //     model: equip.equipModel.model,
  //   //     description: equip.equipModel.description,
  //   //     serialNumber: equip.serialNumber,
  //   //     corLeitor: equip.corLeitor,
  //   //     tipoCracha: equip.tipoCracha,
  //   //     details: equip.details,
  //   //     proximidade: equip.proximidade,
  //   //     bio: equip.bio,
  //   //     barras: equip.barras,
  //   //     cartografico: equip.cartografico,
  //   //     responsibleUser: equip.responsibleUser,
  //   //     // createdAt: formatDateFunct(equip.createdAt),
  //   //     // updatedAt: formatDateFunct(equip.updatedAt),
  //   //   }

  //   //   return resp
  //   // })

  //   // const equipsList = formatData(newRows)


  //   // const response = {
  //   //   // page: pageResponse,
  //   //   // show: limit,
  //   //   count: equipsList.length,
  //   //   rows: equipsList,
  //   // }

  //   // // console.log(response)

  //   // return response


  //   const { rows } = equips

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: equips.count,
  //       rows: [],
  //     }
  //   }

  //   const formatDateFunct = (date) => {
  //     moment.locale('pt-br')
  //     const formatDate = moment(date).format('L')
  //     const formatHours = moment(date).format('LT')
  //     const dateformated = `${formatDate} ${formatHours}`
  //     return dateformated
  //   }

  //   const equipsList = []

  //   let global = ''

  //  if (R.prop('filters', query) && R.prop('global', query.filters)) global = query.filters.global.replace(/\W/gi, '')

  //   const globalSearch = R.map((equip) => {
  //     const resp = {
  //       id: equip.id,
  //       companyId: equip.companyId,
  //       // equipModelId: equip.equipModelId,
  //       razaoSocial: equip.company.razaoSocial,
  //       cnpj: equip.company.cnpj,
  //       street: equip.company.street,
  //       number: equip.company.number,
  //       city: equip.company.city,
  //       state: equip.company.state,
  //       neighborhood: equip.company.neighborhood,
  //       referencePoint: equip.company.referencePoint,
  //       zipCode: equip.company.zipCode,
  //       telphone: equip.company.telphone,
  //       email: equip.company.email,
  //       nameContact: equip.company.nameContact,
  //       // type: equip.equipModel.equipMark.equipType.type,
  //       // mark: equip.equipModel.equipMark.mark,
  //       // model: equip.equipModel.model,
  //       // description: equip.equipModel.description,
  //       serialNumber: equip.serialNumber,
  //       corLeitor: equip.corLeitor,
  //       tipoCracha: equip.tipoCracha,
  //       details: equip.details,
  //       proximidade: equip.proximidade,
  //       bio: equip.bio,
  //       barras: equip.barras,
  //       cartografico: equip.cartografico,
  //       responsibleUser: equip.responsibleUser,
  //       createdAt: formatDateFunct(equip.createdAt),
  //       updatedAt: formatDateFunct(equip.updatedAt),
  //     }

  //     if (resp.razaoSocial.indexOf(global) !== -1
  //       || resp.cnpj.indexOf(global) !== -1
  //       // || resp.type.indexOf(global) !== -1
  //       // || resp.mark.indexOf(global) !== -1
  //       // || resp.model.indexOf(global) !== -1
  //       || resp.serialNumber.indexOf(global) !== -1) {
  //       equipsList.push(resp)
  //     }
  //   })

  //   await globalSearch(rows)

  //   const response = {
  //     page: pageResponse,
  //     show: limit,
  //     count: equipsList.length,
  //     rows: equipsList,
  //   }

  //   return response
  // }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const equip = R.omit(['id'], bodyData)

    const oldEquip = await Equip.findByPk(bodyData.id)

    const newEquip = JSON.parse(JSON.stringify(oldEquip))

    Object.assign(newEquip, R.omit(['mark', 'type', 'model'], equip))

    // const equipNotHasProp = prop => R.not(R.has(prop, equip))
    const newEquipNotHasProp = prop => R.not(R.has(prop, newEquip))

    const field = {
      // equipModelId: false,
      companyId: false,
      serialNumber: false,
      corLeitor: false,
      tipoCracha: false,
      details: false,
      responsibleUser: false,
      proximidade: false,
      bio: false,
      barras: false,
      cartografico: false,
    }
    const message = {
      // equipModelId: '',
      companyId: '',
      serialNumber: '',
      corLeitor: '',
      tipoCracha: '',
      details: '',
      responsibleUser: '',
      proximidade: '',
      bio: '',
      barras: '',
      cartografico: '',
    }

    let errors = false

    if (newEquipNotHasProp('serialNumber') || !newEquip.serialNumber) {
      errors = true
      field.serialNumber = true
      message.serialNumber = 'informe o número de série.'
    } else {
      const serialNumberReturned = await Equip.findOne({
        where: { serialNumber: newEquip.serialNumber },
        transaction,
      })

      if (serialNumberReturned && newEquip.serialNumber !== oldEquip.serialNumber) {
        errors = true
        field.serialNumber = true
        message.serialNumber = 'já está cadastrado.'
      }
    }

    if (newEquipNotHasProp('proximidade') || typeof newEquip.proximidade !== 'boolean') {
      errors = true
      field.proximidade = true
      message.proximidade = 'proximidade não é um booleano'
    }
    if (newEquipNotHasProp('bio') || typeof newEquip.bio !== 'boolean') {
      errors = true
      field.bio = true
      message.bio = 'bio não é um booleano'
    }
    if (newEquipNotHasProp('barras') || typeof newEquip.barras !== 'boolean') {
      errors = true
      field.barras = true
      message.barras = 'barras não é um booleano'
    }
    if (newEquipNotHasProp('cartografico') || typeof newEquip.cartografico !== 'boolean') {
      errors = true
      field.cartografico = true
      message.cartografico = 'cartografico não é um booleano'
    }

    if (newEquipNotHasProp('corLeitor')
    || (newEquip.corLeitor !== 'Branco'
    && newEquip.corLeitor !== 'Vermelho'
    && newEquip.corLeitor !== 'Azul'
    && newEquip.corLeitor !== 'Verde'
    && newEquip.corLeitor !== 'NaoSeAplica')) {
      errors = true
      field.corLeitor = true
      message.corLeitor = 'leitor inválido.'
    }

    if (newEquipNotHasProp('tipoCracha')
    || (newEquip.tipoCracha !== 'Hid'
    && newEquip.tipoCracha !== 'Mifare'
    && newEquip.tipoCracha !== 'Wiegand'
    && newEquip.tipoCracha !== 'Abatrack'
    && newEquip.tipoCracha !== 'Sarial'
    && newEquip.tipoCracha !== 'NaoSeAplica')) {
      errors = true
      field.tipoCracha = true
      message.tipoCracha = 'leitor inválido.'
    }

    // if (equipNotHasProp('type') || !equip.type) {
    //   errors = true
    //   field.type = true
    //   message.type = 'informe o tipo.'
    // }

    // if (equipNotHasProp('mark') || !equip.mark) {
    //   errors = true
    //   field.mark = true
    //   message.mark = 'informe a marca.'
    // }

    // if (equipNotHasProp('model') || !equip.model) {
    //   errors = true
    //   field.model = true
    //   message.model = 'informe o modelo.'
    // }

    // const equipModel = await EquipModel.findOne({
    //   where: { model: equip.model },
    //   include: [{
    //     model: EquipMark,
    //     where: { mark: equip.mark },
    //     include: [{
    //       model: EquipType,
    //       where: { type: equip.type },
    //     }],
    //   }],
    // })

    // if (!equipModel) {
    //   errors = true
    //   field.model = true
    //   message.model = 'Modelo não encontrado.'
    // }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await oldEquip.update(newEquip, { transaction })

    return response
  }


  async getOneBySerialNumber(serialNumber, options = {}) {
    const { transaction = null } = options
    const response = await Equip.findOne({
      where: {
        serialNumber,
      },
      attributes: ['reserved', 'deletedAt', 'osPartId', 'freeMarketPartId', 'productBaseId'],
      include: [
        {
          model: OsParts,
          paranoid: false,
          attributes: ['oId'],
          include: [{
            paranoid: false,
            attributes: ['os'],
            model: Os,
          }],
        },
        {
          model: ProductBase,
          attributes: ['productId'],
          include:
          [
            {
              model: Product,
              attributes: ['name'],
            },
          ],
        },
        {
          paranoid: false,
          model: FreeMarketParts,
          attributes: ['freeMarketId'],
          include: [{
            paranoid: false,
            attributes: ['trackingCode'],
            model: FreeMarket,
          }],
        },
      ],
      paranoid: false,
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(response)))
    return response
  }
}
