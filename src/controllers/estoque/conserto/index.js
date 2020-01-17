const R = require("ramda");

const ConsertoDomain = require("../../../domains/estoque/conserto");
const database = require("../../../database");

const consertoDomain = new ConsertoDomain();

const add = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const conserto = await consertoDomain.add(req.body, { transaction });

    await transaction.commit();
    res.json(conserto);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// const update = async (req, res, next) => {
//   const transaction = await database.transaction()
//   try {
//     const entrance = await entranceDomain.update(req.body, { transaction })

//     await transaction.commit()
//     res.json(entrance)
//   } catch (error) {
//     await transaction.rollback()
//     next(error)
//   }
// }

// const getAll = async (req, res, next) => {
//   const transaction = await database.transaction();
//   try {
//     let query;
//     if (R.has("query", req)) {
//       if (R.has("query", req.query)) {
//         query = JSON.parse(req.query.query);
//       }
//     }

//     const emprestimo = await emprestimoDomain.getAll({ query, transaction });

//     await transaction.commit();
//     res.json(emprestimo);
//   } catch (error) {
//     await transaction.rollback();
//     next();
//   }
// };

// const delet = async (req, res, next) => {
//   const transaction = await database.transaction();
//   try {
//     const deleteEmprestimo = await emprestimoDomain.delete(req.query.id, {
//       transaction
//     });

//     await transaction.commit();
//     res.json(deleteEmprestimo);
//   } catch (error) {
//     await transaction.rollback();
//     next();
//   }
// };

module.exports = {
  add
  // update,
  // getAll,
  // delet
};
