const Sequelize = require("sequelize");
const moment = require("moment");

const database = require("../../database");

const FreeMarket = database.model("freeMarket");
const FreeMarketParts = database.model("freeMarketParts");
const Equip = database.model("equip");
const TechnicianReserve = database.model("technicianReserve");
const TechnicianReserveParts = database.model("technicianReserveParts");
const Entrance = database.model("entrance");
const Conserto = database.model("conserto");

const { Op } = Sequelize;

const deleteEComerce = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const resp = await FreeMarket.findOne({
      where: { trackingCode: "OI202442267BR" },
      include: [{ model: ProductBase }],
      transaction,
      paranoid: false,
    });

    await Promise.all(
      resp.productBases.map(async (item) => {
        const equip = await Equip.findAll({
          where: { freeMarketPartId: item.freeMarketParts.id },
          paranoid: false,
          transaction,
        });

        const productBase = await ProductBase.findByPk(item.id, {
          transaction,
        });

        // await productBase.update(
        //   {
        //     amount:
        //       parseInt(item.amount, 10) +
        //       parseInt(item.freeMarketParts.amount, 10),
        //     available:
        //       parseInt(item.available, 10) +
        //       parseInt(item.freeMarketParts.amount, 10)
        //   },
        //   { transaction }
        // );

        // await Promise.all(
        //   equip.map(async equipItem => {
        //     await equipItem.restore({ transaction });
        //     await equipItem.update({ freeMarketPartId: null }, { transaction });
        //   })
        // );

        const freeMarketPart = await FreeMarketParts.findByPk(
          item.freeMarketParts.id,
          { transaction }
        );

        // await freeMarketPart.destroy({ force: true, transaction });
      })
    );

    console.log(JSON.parse(JSON.stringify(resp)));

    // await resp.dest\roy({ force: true, transaction });

    await transaction.commit();
    res.json(resp);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const associateTechnicianReverve = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const technicianReserves = await TechnicianReserve.findAll({
      transaction,
    });

    await Promise.all(
      technicianReserves.map(async (technicianReserve) => {
        const technicianReserveParts = await TechnicianReserveParts.findAll({
          where: {
            createdAt: {
              [Op.gte]: moment(technicianReserve.createdAt).subtract(
                4,
                "seconds"
              ),
              [Op.lte]: moment(technicianReserve.createdAt).add(4, "seconds"),
            },
          },
          transaction,
        });

        await Promise.all(
          technicianReserveParts.map(async (technicianReservePart) => {
            await technicianReservePart.update(
              { technicianReserveId: technicianReserve.id },
              { transaction }
            );
          })
        );
      })
    );

    console.log(JSON.parse(JSON.stringify(technicianReserves)));
    await transaction.commit();
    res.json(technicianReserves);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const writeDefautsEntrances = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const entrances = await Entrance.findAll({ transaction });

    await Promise.all(
      entrances.map(
        async (entrance) =>
          await entrance.update({ analysis: false }, { transaction })
      )
    );

    const producBtases = await ProductBase.findAll({ transaction });

    await Promise.all(
      producBtases.map(
        async (producBtase) =>
          await producBtase.update({ analysis: "0" }, { transaction })
      )
    );

    await transaction.commit();
    res.json("sucess");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const writeDefautsConserto = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const consertos = await Conserto.findAll({
      paranoid: false,
      transaction,
    });

    await Promise.all(
      consertos.map(async (conserto) => {
        const serialNumbers = [conserto.serialNumber];
        await conserto.update({ serialNumbers }, { transaction });
      })
    );
    await transaction.commit();
    res.json("sucess");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  deleteEComerce,
  associateTechnicianReverve,
  writeDefautsEntrances,
  writeDefautsConserto,
};
