const R = require("ramda");
const Cnpj = require("@fnando/cnpj/dist/node");

const database = require("../../../database");
const { FieldValidationError } = require("../../../helpers/errors");

const Emprestimo = database.model("emprestimo");
const Product = database.model("product");
const Equip = database.model("equip");
const Technician = database.model("technician");

module.exports = class EmprestimoDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const emprestimo = R.omit(["id"], bodyData);
    const hasProps = (prop, obj) => R.has(prop, obj);
    const notHasProps = (prop, obj) => R.not(R.has(prop, obj));

    let errors = false;

    const field = {
      cnpj: false,
      razaoSocial: false,
      dateExpedition: false,
      productId: false,
      equipId: false
    };

    const message = {
      razaoSocial: "",
      cnpj: "",
      dateExpedition: "",
      productId: "",
      equipId: ""
    };

    if (notHasProps("cnpj", emprestimo) || !emprestimo.cnpj) {
      errors = true;
      field.cnpj = true;
      message.cnpj = "cnpj cannot null";
    } else if (!Cnpj.isValid(emprestimo.cnpj.replace(/\D/g, ""))) {
      errors = true;
      field.cnpj = true;
      message.cnpj = "cnpj inválid";
    }

    if (notHasProps("razaoSocial", emprestimo) || !emprestimo.razaoSocial) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "razaoSocial cannot null";
    }

    if (
      notHasProps("dateExpedition", emprestimo) ||
      !emprestimo.dateExpedition
    ) {
      errors = true;
      field.dateExpedition = true;
      message.dateExpedition = "dateExpedition cannot null";
    }

    if (notHasProps("equipId", emprestimo) || !emprestimo.equipId) {
      errors = true;
      field.equipId = true;
      message.equipId = "equipId cannot null";
    } else {
      const equip = await Equip.findByPk(emprestimo.equipId, {
        transaction
      });

      if (!equip) {
        errors = true;
        field.equipId = true;
        message.equipId = "equipId inválid";
      }
    }

    if (notHasProps("technicianId", emprestimo) || !emprestimo.technicianId) {
      errors = true;
      field.technicianId = true;
      message.technicianId = "technicianId cannot null";
    } else {
      const technician = await Technician.findByPk(emprestimo.technicianId, {
        transaction
      });

      if (!technician) {
        errors = true;
        field.technicianId = true;
        message.technicianId = "technicianId inválid";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const emprestimoCreted = await Emprestimo.create(emprestimo, {
      transaction
    });

    return emprestimoCreted;
  }
};
