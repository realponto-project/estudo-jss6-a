
// // const database = require('../../database')
// const ProcessDomain = require('.')
// const EntryEquipmentDomain = require('../entryEquipment')
// const CompanyDomain = require('../../company')
// // const EquipTypeDomain = require('../../equip/equipType')
// const EquipDomain = require('../../estoque/equip')

// const processDomain = new ProcessDomain()
// const entryEquipmentDomain = new EntryEquipmentDomain()
// const companyDomain = new CompanyDomain()
// // const equipTypeDomain = new EquipTypeDomain()
// const equipDomain = new EquipDomain()

// const Process = database.model('process')

describe('ProcessDomain', () => {
  test('true', () => {
    expect(true).toBe(true)
  })


  // let entry = null
  // let updateProcessMock = null
  // let entryEquipmentMock = null
  // let companyMock = null
  // // let equipMarkMock = null
  // let equipMock = null

  // beforeAll(async () => {
  //   entryEquipmentMock = {
  //     humidity: false,
  //     fall: false,
  //     misuse: false,
  //     brokenSeal: false,
  //     serialNumber: '2564',
  //     externalDamage: true,
  //     details: 'tá zuado',
  //     defect: 'fonte',
  //     delivery: 'externo',
  //     technicianName: 'Carlos',
  //     properlyPacked: true,
  //     conditionType: 'avulso',
  //     garantia: 'externo',
  //     responsibleUser: 'modrp',
  //   }
  //   companyMock = {
  //     razaoSocial: 'Real teste 123/ .LTDA',
  //     cnpj: '72985831000170',
  //     street: 'jadaisom rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)8565-4658',
  //     nameContact: 'jose',
  //     email: 'jose@gmail.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   // equipMarkMock = {
  //   //   type: 'catraca',
  //   //   mark: 'LG',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   // const equipTypeMock = {
  //   //   equipMarkId: markMock.id,
  //   //   model: 'LG 7.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }


  //   // const equipModelCreated = await equipTypeDomain.addModel(equipTypeMock)

  //   equipMock = {
  //     // equipModelId: equipModelCreated.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '2564',
  //     proximidade: true,
  //     bio: true,
  //     barras: true,
  //     cartografico: true,
  //     tipoCracha: 'Hid',
  //     corLeitor: 'Verde',
  //     details: '',
  //     responsibleUser: 'modrp',
  //   }

  //   await equipDomain.add(equipMock)

  //   entry = await entryEquipmentDomain.add(entryEquipmentMock)

  //   updateProcessMock = {
  //     status: 'analise',
  //   }
  // })

  // test('update', async () => {
  //   const updateProcess = await processDomain.update(entry.processId, updateProcessMock)

  //   expect(updateProcess).toBeTruthy()

  //   expect(await processDomain.update(entry.processId, { status: 'fabricaIda' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'fabricaVolta' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'preAnalise' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'analise' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'pendente' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'revisao1' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'posAnalise' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'revisao2' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'posAnalise2' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'revisao3' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'orcamento' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'manutencao' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'revisaoFinal' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'estoque' })).toBeTruthy()
  //   expect(await processDomain.update(entry.processId, { status: 'semConserto' })).toBeTruthy()
  // })

//   test('getAll', async () => {
//     const entrace = await processDomain.getAll()
//     expect(entrace.rows.length > 0).toBeTruthy()
//   })

//   test('getProcessToControl', async () => {
//     const entrace = await processDomain.getProcessToControl()
//     expect(entrace.rows.length >= 0).toBeTruthy()
//   })
})
