const database = require("../../database");

const ProductBase = database.model("productBase");
const FreeMarket = database.model("freeMarket");
const FreeMarketParts = database.model("freeMarketParts");
const Equip = database.model("equip");

const deleteEComerce = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const resp = await FreeMarket.findOne({
      where: { trackingCode: "OI202442267BR" },
      include: [{ model: ProductBase }],
      transaction,
      paranoid: false
    });

    await Promise.all(
      resp.productBases.map(async item => {
        const equip = await Equip.findAll({
          where: { freeMarketPartId: item.freeMarketParts.id },
          paranoid: false,
          transaction
        });

        const productBase = await ProductBase.findByPk(item.id, {
          transaction
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

module.exports = {
  deleteEComerce
};
