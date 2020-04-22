const R = require("ramda");
const database = require("../../../database");
const { FieldValidationError } = require("../../../helpers/errors");
const formatQuery = require("../../../helpers/lazyLoad");

const Conserto = database.model("conserto");
const Product = database.model("product");
const Equip = database.model("equip");
const Technician = database.model("technician");

module.exports = class ConsertoDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const conserto = R.omit(["id"], bodyData);
    const hasProps = (prop, obj) => R.has(prop, obj);
    const notHasProps = (prop, obj) => R.not(R.has(prop, obj));

    let errors = false;

    const field = {
      serialNumber: false,
      productId: false,
    };

    const message = {
      serialNumber: "",
      productId: "",
    };

    if (notHasProps("serialNumbers", conserto) || !conserto.serialNumbers) {
      errors = true;
      field.serialNumbers = true;
      message.serialNumbers = "serialNumbers cannot null";
    } else {
      conserto.serialNumbers = conserto.serialNumbers.map((serialNumber) =>
        serialNumber.replace(/\D/gi, "")
      );
    }

    if (notHasProps("productId", conserto) || !conserto.productId) {
      errors = true;
      field.productId = true;
      message.productId = "productId cannot null";
    } else {
      const product = await Product.findByPk(conserto.productId, {
        transaction,
      });

      if (!product) {
        errors = true;
        field.productId = true;
        message.productId = "productId inválid";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const consertoCreted = await Conserto.create(conserto, {
      transaction,
    });

    return consertoCreted;
  }

  // async getAll(options = {}) {
  //   const inicialOrder = {
  //     field: "createdAt",
  //     acendent: true,
  //     direction: "DESC"
  //   };

  //   const { query = null, transaction = null } = options;

  //   const newQuery = Object.assign({}, query);
  //   const newOrder = query && query.order ? query.order : inicialOrder;

  //   const paranoid = R.has("paranoid", newQuery) ? newQuery.paranoid : true;

  //   if (newOrder.acendent) {
  //     newOrder.direction = "DESC";
  //   } else {
  //     newOrder.direction = "ASC";
  //   }

  //   const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

  //   const emprestimos = await Emprestimo.findAndCountAll({
  //     where: getWhere("emprestimo"),
  //     include: [
  //       {
  //         model: Equip,
  //         include: [
  //           {
  //             model: ProductBase,
  //             include: [
  //               {
  //                 model: Product
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         model: Technician,
  //         where: getWhere("technician")
  //       }
  //     ],
  //     paranoid,
  //     order: [[newOrder.field, newOrder.direction]],
  //     limit,
  //     offset,
  //     transaction
  //   });

  //   const { rows } = emprestimos;

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: entrances.count,
  //       rows: []
  //     };
  //   }

  //   const formatDateFunct = date => {
  //     moment.locale("pt-br");
  //     const formatDate = moment(date).format("L");
  //     // const formatHours = moment(date).format("LT");
  //     const dateformated = `${formatDate}`;
  //     // const dateformated = `${formatDate} ${formatHours}`;
  //     return dateformated;
  //   };

  //   const formatData = R.map(emprestimo => {
  //     const resp = {
  //       id: emprestimo.id,
  //       razaoSocial: emprestimo.razaoSocial,
  //       cnpj: emprestimo.cnpj,
  //       dateExpeditionNotFormatted: emprestimo.dateExpedition,
  //       dateExpedition: formatDateFunct(emprestimo.dateExpedition),
  //       serialNumber: emprestimo.equip.serialNumber,
  //       name: emprestimo.equip.productBase.product.name,
  //       createdAtNotFormatted: emprestimo.createdAt,
  //       createdAt: formatDateFunct(emprestimo.createdAt),
  //       deletedAt: emprestimo.deletedAt && formatDateFunct(emprestimo.deletedAt)
  //     };
  //     return resp;
  //   });

  //   const emprestimoList = formatData(rows);

  //   let show = limit;
  //   if (emprestimos.count < show) {
  //     show = emprestimos.count;
  //   }

  //   const response = {
  //     page: pageResponse,
  //     show,
  //     count: emprestimos.count,
  //     rows: emprestimoList
  //   };

  //   return response;
  // }

  // async delete(id, options = {}) {
  //   const { transaction = null } = options;

  //   const deletEmprestimo = await Emprestimo.findByPk(id, {
  //     include: [
  //       {
  //         model: Equip
  //       }
  //     ],
  //     transaction
  //   });

  //   const field = {
  //     id: false
  //   };
  //   const message = {
  //     id: ""
  //   };

  //   if (!deletEmprestimo) {
  //     field.id = true;
  //     message.id = "entrada não econtrada";
  //     throw new FieldValidationError([{ field, message }]);
  //   }

  //   const { equip } = deletEmprestimo;

  //   await equip.update({
  //     ...JSON.parse(JSON.stringify(equip)),
  //     inClient: false
  //   });

  //   await deletEmprestimo.destroy({ transaction });

  //   return "sucesso";
  // }
};
