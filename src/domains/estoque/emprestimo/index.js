const R = require("ramda");
const moment = require("moment");
const Cnpj = require("@fnando/cnpj/dist/node");

const database = require("../../../database");
const { FieldValidationError } = require("../../../helpers/errors");
const formatQuery = require("../../../helpers/lazyLoad");

const Emprestimo = database.model("emprestimo");
const Product = database.model("product");
const Equip = database.model("equip");
const Technician = database.model("technician");
const ProductBase = database.model("productBase");

module.exports = class EmprestimoDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const emprestimo = R.omit(["id", "serialNumber"], bodyData);
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

    if (notHasProps("serialNumber", bodyData) || !bodyData.serialNumber) {
      errors = true;
      field.serialNumber = true;
      message.serialNumber = "serialNumber cannot null";
    } else {
      const { serialNumber } = bodyData;
      const equip = await Equip.findOne({
        where: { serialNumber },
        transaction
      });

      if (equip) {
        emprestimo.equipId = equip.id;
      } else {
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

    const equip = await Equip.findByPk(emprestimo.equipId, {
      transaction
    });

    await equip.update(
      {
        ...JSON.parse(JSON.stringify(equip)),
        inClient: true
      },
      {
        transaction
      }
    );

    return emprestimoCreted;
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options;

    const oldEmprestimo = await Emprestimo.findByPk(bodyData.id, {
      transaction
    });

    if (!oldEmprestimo) {
      throw new FieldValidationError([
        { field: { id: true }, message: { id: "inválid id" } }
      ]);
    }

    const emprestimo = R.omit(["id", "serialNumber"], bodyData);
    const notHasProps = (prop, obj) => R.not(R.has(prop, obj));

    let errors = false;

    const field = {
      cnpj: false,
      razaoSocial: false,
      dateExpedition: false,
      productId: false
    };

    const message = {
      razaoSocial: "",
      cnpj: "",
      dateExpedition: "",
      productId: ""
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

    const emperestimoUpdated = {
      ...JSON.parse(JSON.stringify(oldEmprestimo)),
      ...emprestimo
    };

    await oldEmprestimo.update(emperestimoUpdated, { transaction });

    const response = await Emprestimo.findByPk(bodyData.id, {
      transaction
    });

    return response;
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "DESC"
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    const paranoid = R.has("paranoid", newQuery) ? newQuery.paranoid : true;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const emprestimos = await Emprestimo.findAndCountAll({
      where: getWhere("emprestimo"),
      include: [
        {
          model: Equip,
          where: getWhere("equip"),
          include: [
            {
              model: ProductBase,
              include: [
                {
                  model: Product
                }
              ]
            }
          ]
        },
        {
          model: Technician,
          where: getWhere("technician")
        }
      ],
      paranoid,
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction
    });

    const { rows } = emprestimos;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: emprestimos.count,
        rows: []
      };
    }

    const formatDateFunct = date => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      // const formatHours = moment(date).format("LT");
      const dateformated = `${formatDate}`;
      // const dateformated = `${formatDate} ${formatHours}`;
      return dateformated;
    };

    const formatData = R.map(emprestimo => {
      const resp = {
        id: emprestimo.id,
        razaoSocial: emprestimo.razaoSocial,
        cnpj: emprestimo.cnpj,
        dateExpeditionNotFormatted: emprestimo.dateExpedition,
        dateExpedition: formatDateFunct(emprestimo.dateExpedition),
        serialNumber: emprestimo.equip.serialNumber,
        name: emprestimo.equip.productBase.product.name,
        technicianId: emprestimo.technician.id,
        technician: emprestimo.technician.name,
        createdAtNotFormatted: emprestimo.createdAt,
        createdAt: formatDateFunct(emprestimo.createdAt),
        deletedAt: emprestimo.deletedAt && formatDateFunct(emprestimo.deletedAt)
      };
      return resp;
    });

    const emprestimoList = formatData(rows);

    let show = limit;
    if (emprestimos.count < show) {
      show = emprestimos.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: emprestimos.count,
      rows: emprestimoList
    };

    return response;
  }

  async delete(bodyData, options = {}) {
    const { transaction = null } = options;

    const optionsQuery = R.omit(["id"], bodyData);

    const deletEmprestimo = await Emprestimo.findByPk(bodyData.id, {
      include: [
        {
          model: Equip
        }
      ],
      transaction
    });

    const field = {
      id: false
    };
    const message = {
      id: ""
    };

    if (!deletEmprestimo) {
      field.id = true;
      message.id = "entrada não econtrada";
      throw new FieldValidationError([{ field, message }]);
    }

    const { equip } = deletEmprestimo;

    await equip.update({
      ...JSON.parse(JSON.stringify(equip)),
      inClient: false
    });

    await deletEmprestimo.destroy({ ...optionsQuery, transaction });

    return "sucesso";
  }
};
