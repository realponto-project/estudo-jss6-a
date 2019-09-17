/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
const axios = require('axios')

const Cnpj = require('@fnando/cnpj/dist/node')
const Cpf = require('@fnando/cpf/dist/node')

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

const Company = database.model('company')
const User = database.model('user')

module.exports = class CompanyDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const company = R.omit(['id'], bodyData)

    const companyNotHasProp = prop => R.not(R.has(prop, company))

    const field = {
      razaoSocial: false,
      cnpj: false,
      street: false,
      number: false,
      city: false,
      state: false,
      neighborhood: false,
      referencePoint: false,
      zipCode: false,
      telphone: false,
      email: false,
      nameContact: false,
      responsibleUser: false,
      relation: false,
    }
    const message = {
      razaoSocial: '',
      cnpj: '',
      street: '',
      number: '',
      city: '',
      state: '',
      neighborhood: '',
      referencePoint: '',
      zipCode: '',
      telphone: '',
      email: '',
      nameContact: '',
      responsibleUser: '',
      relation: '',
    }

    let errors = false

    if (companyNotHasProp('razaoSocial') || !company.razaoSocial) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Por favor informar a razão social.'
    } else {
      const companyReturnedRS = await Company.findOne({
        where: { razaoSocial: company.razaoSocial },
        transaction,
      })

      if (companyReturnedRS) {
        errors = true
        field.razaoSocial = true
        message.razaoSocial = 'Essa razão social já existe em nosso sistema.'
      }
    }

    if (companyNotHasProp('cnpj') || !company.cnpj) {
      errors = true
      field.cnpj = true
      message.cnpj = 'Por favor informar o cnpj ou cpf.'
    } else {
      const cnpjOrCpf = company.cnpj.replace(/\D/g, '')

      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj ou o cpf informado não é válido.'
      }

      const companyHasExist = await Company.findOne({
        where: {
          cnpj: cnpjOrCpf,
        },
        transaction,
      })

      if (companyHasExist) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj ou cpf infomardo já existem em nosso sistema.'
      }
    }

    if (companyNotHasProp('street') || !company.street) {
      errors = true
      field.street = true
      message.street = 'Por favor informar o nome da rua.'
    }

    if (companyNotHasProp('relation') || !company.relation) {
      errors = true
      field.relation = true
      message.relation = 'Por favor informar a relação.'
    } else if (company.relation !== 'cliente' && company.relation !== 'fornecedor') {
      errors = true
      field.relation = true
      message.relation = 'Relação inválida.'
    }

    if (companyNotHasProp('email') || !company.email) {
      errors = true
      field.email = true
      message.email = 'por favor informar o e-mail'
    } else {
      const { email } = bodyData

      // eslint-disable-next-line no-useless-escape
      if (!/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(email)) {
        errors = true
        field.email = true
        message.email = 'O e-mail informado está inválido.'
      }
    }


    if (companyNotHasProp('number') || !company.number) {
      errors = true
      field.number = true
      message.number = 'Informe o número.'
    } else {
      const { number } = bodyData

      if (!/^[0-9]+$/.test(number)) {
        errors = true
        field.number = true
        message.number = 'O número informado é inválido.'
      }
    }


    if (companyNotHasProp('city') || !company.city) {
      errors = true
      field.city = true
      message.city = 'Informe a cidade.'
    }

    if (companyNotHasProp('state') || !company.state) {
      errors = true
      field.state = true
      message.state = 'Informe o estado.'
    }

    if (companyNotHasProp('neighborhood') || !company.neighborhood) {
      errors = true
      field.neighborhood = true
      message.neighborhood = 'Por favor informar o bairro.'
    }

    if (companyNotHasProp('zipCode') || !company.zipCode) {
      errors = true
      field.zipCode = true
      message.zipCode = 'Por favor informar o CEP.'
    } else {
      const { zipCode } = company
      company.zipCode = zipCode.replace(/\D/, '')

      // const url = getZipCode => `https://viacep.com.br/ws/${getZipCode}/json/`

      // const address = await axios.get(url(company.zipCode))

      if (!/^\d{8}$/.test(company.zipCode)
      // || R.has('erro', address.data)
      ) {
        errors = true
        field.zipCode = true
        message.zipCode = 'Cep inválido.'
      }
    }

    if (companyNotHasProp('telphone') || !company.telphone) {
      errors = true
      field.telphone = true
      message.telphone = 'Por favor informar o número de telefone para contato.'
    } else {
      const { telphone } = company
      company.telphone = telphone.replace(/\D/g, '')

      if (!/^\d+$/.test(company.telphone)) {
        errors = true
        field.telphone = true
        message.telphone = 'O telefone informado está inválido.'
      }

      if (!company.telphone.length === 10 && !company.telphone.length === 11) {
        errors = true
        field.telphone = true
        message.telphone = 'O telefone informado está inválido.'
      }
    }


    if (companyNotHasProp('nameContact') || !company.nameContact) {
      errors = true
      field.nameContact = true
      message.nameContact = 'Por favor informar o nome para contato.'
    }

    if (companyNotHasProp('responsibleUser')) {
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


    const companyCreated = Company.create(company, { transaction })

    return companyCreated
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const company = R.omit(['id'], bodyData)

    const companyNotHasProp = prop => R.not(R.has(prop, company))

    const oldCompany = await Company.findByPk(bodyData.id, { transaction })

    const field = {
      razaoSocial: false,
      cnpj: false,
      street: false,
      number: false,
      city: false,
      state: false,
      neighborhood: false,
      referencePoint: false,
      zipCode: false,
      telphone: false,
      email: false,
      nameContact: false,
    }
    const message = {
      razaoSocial: '',
      cnpj: '',
      street: '',
      number: '',
      city: '',
      state: '',
      neighborhood: '',
      referencePoint: '',
      zipCode: '',
      telphone: '',
      email: '',
      nameContact: '',
    }

    let errors = false

    if (companyNotHasProp('razaoSocial') || !company.razaoSocial) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Por favor informar a razão social.'
    } else {
      const companyReturnedRS = await Company.findOne({
        where: { razaoSocial: company.razaoSocial },
        transaction,
      })

      if (companyReturnedRS && company.razaoSocial !== oldCompany.razaoSocial) {
        errors = true
        field.razaoSocial = true
        message.razaoSocial = 'Essa razão social já existe em nosso sistema.'
      }
    }

    if (companyNotHasProp('cnpj') || !company.cnpj) {
      errors = true
      field.cnpj = true
      message.cnpj = 'Por favor informar o cnpj ou cpf.'
    } else {
      const cnpjOrCpf = company.cnpj.replace(/\D/gi, '')
      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj ou o cpf informado não é válido.'
      }

      const companyHasExist = await Company.findOne({
        where: {
          cnpj: cnpjOrCpf,
        },
        transaction,
      })

      if (companyHasExist && cnpjOrCpf !== oldCompany.cnpj) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj ou cpf infomardo já existem em nosso sistema.'
      }
    }

    if (companyNotHasProp('street') || !company.street) {
      errors = true
      field.street = true
      message.street = 'Informe a rua.'
    }

    if (companyNotHasProp('email') || !company.email) {
      errors = true
      field.email = true
      message.email = 'por favor informar o e-mail'
    } else {
      const { email } = bodyData

      // eslint-disable-next-line no-useless-escape
      if (!/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(email)) {
        errors = true
        field.email = true
        message.email = 'O e-mail informado está inválido.'
      }
    }


    if (companyNotHasProp('number') || !company.number) {
      errors = true
      field.number = true
      message.number = 'Por favor informar o número.'
    } else {
      const { number } = bodyData

      if (!/^[0-9]+$/.test(number)) {
        errors = true
        field.number = true
        message.number = 'O número informado é inválido.'
      }
    }


    if (companyNotHasProp('city') || !company.city) {
      errors = true
      field.city = true
      message.city = 'Por favor informar a cidade.'
    }

    if (companyNotHasProp('state') || !company.state) {
      errors = true
      field.state = true
      message.state = 'Informe o estado.'
    }

    if (companyNotHasProp('neighborhood') || !company.neighborhood) {
      errors = true
      field.neighborhood = true
      message.neighborhood = 'Por favor informar o bairro.'
    }

    if (companyNotHasProp('zipCode') || !company.zipCode) {
      errors = true
      field.zipCode = true
      message.zipCode = 'Por favor informar o CEP.'
    } else {
      const { zipCode } = company
      company.zipCode = zipCode.replace(/\D/, '')

      const url = getZipCode => `https://viacep.com.br/ws/${getZipCode}/json/`

      const address = await axios.get(url(company.zipCode))

      if (!/^\d{8}$/.test(company.zipCode)
      || R.has('erro', address.data)
      ) {
        errors = true
        field.zipCode = true
        message.zipCode = 'Cep inválido.'
      }
    }

    if (companyNotHasProp('telphone') || !company.telphone) {
      errors = true
      field.telphone = true
      message.telphone = 'Por favor informar o número de telefone para contato.'
    } else {
      const { telphone } = company
      company.telphone = telphone.replace(/\D/g, '')

      if (!/^\d+$/.test(company.telphone)) {
        errors = true
        field.telphone = true
        message.telphone = 'O telefone informado está inválido.'
      }

      if (!company.telphone.length === 10 && !company.telphone.length === 11) {
        errors = true
        field.telphone = true
        message.telphone = 'O telefone informado está inválido.'
      }
    }


    if (companyNotHasProp('nameContact') || !company.nameContact) {
      errors = true
      field.nameContact = true
      message.nameContact = 'Por favor informar o nome para contato.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const newCompany = {
      ...oldCompany,
      ...company,
    }
    await oldCompany.update(newCompany, { transaction })

    const response = await Company.findByPk(oldCompany.id, { transaction })

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

    const companies = await Company.findAndCountAll({
      where: getWhere('company'),
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = companies

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: companies.count,
        rows: [],
      }
    }

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date).format('L')
      const formatHours = moment(date).format('LT')
      const dateformated = `${formatDate} ${formatHours}`
      return dateformated
    }

    const formatData = R.map((comp) => {
      const resp = {
        id: comp.id,
        cnpj: comp.cnpj,
        razaoSocial: comp.razaoSocial,
        createdAt: formatDateFunct(comp.createdAt),
        updatedAt: formatDateFunct(comp.updatedAt),
        nameContact: comp.nameContact,
        telphone: comp.telphone,
        street: comp.street,
        number: comp.number,
        city: comp.city,
        state: comp.state,
        neighborhood: comp.neighborhood,
        referencePoint: comp.referencePoint,
        zipCode: comp.zipCode,
        email: comp.email,
        complement: comp.complement,
        relation: comp.relation,
      }
      return resp
    })

    const companiesList = formatData(rows)

    let show = limit
    if (companies.count < show) {
      show = companies.count
    }


    const response = {
      page: pageResponse,
      show,
      count: companies.count,
      rows: companiesList,
    }
    return response
  }

  async getAllFornecedor(options = {}) {
    const { transaction = null } = options

    const fornecedores = await Company.findAll({
      where: { relation: 'fornecedor' },
      attributes: ['id', 'razaoSocial'],
      order: [
        ['razaoSocial', 'ASC'],
      ],
      transaction,
    })

    if (fornecedores.length === 0) return []

    return fornecedores
  }

  async getOneByCnpj(cnpj, options = {}) {
    const { transaction = null } = options
    const response = await Company.findOne({
      where: {
        cnpj,
      },
      transaction,
    })

    return response
  }
}
