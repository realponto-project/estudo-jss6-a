module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      "statusExpedition",
      [
        {
          id: "283b00c9-10eb-4672-b703-fb7f2dae45de",
          status: "EMPRESTIMO",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "18b37c3a-1a1f-4b7f-8f8a-2f2f7dc6724a",
          status: "CONSERTO",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: queryInterface =>
    queryInterface.bulkDelete("statusExpedition", null, {})
};
