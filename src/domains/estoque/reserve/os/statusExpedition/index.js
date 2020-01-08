const R = require("ramda");

const database = require("../../../../../database");
const { FieldValidationError } = require("../../../../../helpers/errors");

const StatusExpedition = database.model("statusExpedition");

module.exports = class StatusExpeditionDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const statusExpedition = R.omit(["id"], bodyData);

    const HasProp = (prop, obj) => R.has(prop, obj);

    let errors = false;

    const field = {
      status: false
    };

    const message = {
      status: ""
    };

    if (!HasProp("status", statusExpedition) || !statusExpedition.status) {
      errors = true;
      field.status = true;
      message.status = "status cannot null";
    } else {
      const { status } = statusExpedition;

      const statusExist = await StatusExpedition.findOne({
        where: { status },
        transaction
      });

      if (statusExist) {
        errors = true;
        field.status = true;
        message.status = "status has exist";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const response = await StatusExpedition.create(statusExpedition, {
      transaction
    });

    return response;
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options;

    const newStatusExpedition = R.omit(["id"], bodyData);

    const HasProp = (prop, obj) => R.has(prop, obj);

    let errors = false;

    const field = {
      status: false,
      id: false
    };

    const message = {
      status: "",
      id: ""
    };

    if (!HasProp("id", bodyData) || !bodyData.id) {
      errors = true;
      field.id = true;
      message.id = "id cannot null";
    }
    {
      const { id } = bodyData;

      const statusExist = await StatusExpedition.findByPk(id, {
        transaction
      });

      if (!statusExist) {
        errors = true;
        field.id = true;
        message.id = "id inválid";
      }
    }

    if (!HasProp("status", statusExpedition) || !statusExpedition.status) {
      errors = true;
      field.status = true;
      message.status = "status cannot null";
    } else {
      const { status } = statusExpedition;

      const statusExist = await StatusExpedition.findOne({
        where: { status },
        transaction
      });

      if (statusExist && statusExist.id !== bodyData.id) {
        errors = true;
        field.status = true;
        message.status = "status has exist";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const oldStatusExpedition = await StatusExpedition.findByPk(bodyData.id, {
      transaction
    });

    oldStatusExpedition.update(
      {
        ...oldStatusExpedition,
        ...newStatusExpedition
      },
      {
        transaction
      }
    );

    const response = await StatusExpedition.findByPk(bodyData.id, {
      transaction
    });

    return response;
  }

  async getAll(options = {}) {
    const { transaction = null } = options;

    const status = await StatusExpedition.findAll({
      order: [["status", "ASC"]],
      transaction
    });

    return status;
  }

  async delete(id, options = {}) {
    const { transaction = null } = options;

    const statusExpedition = await StatusExpedition.findByPk(id, {
      transaction
    });

    if (!statusExpedition) {
      throw new FieldValidationError([{ id: true }, { id: "inválid id" }]);
    }

    await statusExpedition.destroy();

    if (
      !(await StatusExpedition.findByPk(id, { transaction })) &&
      !!(await StatusExpedition.findByPk(id, { paranoid: true, transaction }))
    ) {
      return "sucesso";
    }

    return "error";
  }
};
