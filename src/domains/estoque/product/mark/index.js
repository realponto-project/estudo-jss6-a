const R = require("ramda");

const database = require("../../../../database");

const formatQuery = require("../../../../helpers/lazyLoad");
const { FieldValidationError } = require("../../../../helpers/errors");

const Mark = database.model("mark");
// const User = database.model('user')

module.exports = class MarkDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const mark = R.omit(["id"], bodyData);

    const markNotHasProp = prop => R.not(R.has(prop, mark));
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData));

    const field = {
      mark: false,
      responsibleUser: false
    };
    const message = {
      mark: "",
      responsibleUser: ""
    };

    let errors = false;

    if (markNotHasProp("mark") || !mark.mark) {
      errors = true;
      field.newMarca = true;
      message.newMarca = "Por favor informar a marca do markamento.";
    }

    // if (markNotHasProp('responsibleUser')) {
    //   errors = true
    //   field.responsibleUser = true
    //   message.responsibleUser = 'username não está sendo passado.'
    // } else if (bodyData.responsibleUser) {
    //   const { responsibleUser } = bodyData

    //   const user = await User.findOne({
    //     where: { username: responsibleUser },
    //     transaction,
    //   })

    //   if (!user) {
    //     errors = true
    //     field.responsibleUser = true
    //     message.responsibleUser = 'username inválido.'
    //   }
    // } else {
    //   errors = true
    //   field.responsibleUser = true
    //   message.responsibleUser = 'username não pode ser nulo.'
    // }

    const markHasExist = await Mark.findOne({
      where: {
        mark: mark.mark
      },
      transaction
    });

    if (markHasExist) {
      errors = true;
      field.newMarca = true;
      message.newMarca = "Marca já está cadastrada.";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const markCreated = await Mark.create(mark, { transaction });

    const response = await Mark.findByPk(markCreated.id, {
      transaction
    });

    return response;
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere } = formatQuery(newQuery);

    const marks = await Mark.findAll({
      where: getWhere("mark"),
      limit: 30,
      attributes: ["mark"],
      order: [["mark", "ASC"]],
      transaction
    });

    if (marks.length === 0) return [];

    const response = marks.map(item => ({
      mark: item.mark
    }));

    return response;
  }
};
