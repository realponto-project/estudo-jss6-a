const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const time = sequelize.define('time', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    status: {
      type: Sequelize.ENUM(['preAnalise', 'analise', 'fabricaIda', 'fabricaVolta', 'pendente',
        'revisao1', 'posAnalise', 'revisao2', 'posAnalise2', 'revisao3',
        'orcamento', 'manutencao', 'revisaoFinal', 'estoque', 'semConserto']),
      allowNull: false,
    },
    init: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    end: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  })

  return time
}
