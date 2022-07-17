// const Seguelize = require("sequelize");
// const sequelizeconnection = new Seguelize( 
// "postgres",
// "postgres",
// "postgres",
//   {
//     dialect: "postgres",
//     host: process.env.DB_HOST,
//   }
// );

// module.exports = sequelizeconnection;





const Seguelize = require("sequelize");
const sequelizeconnection = new Seguelize( 
process.env.DB_DATABASE, process.env.DB_USERNAME,process.env.DB_PASSWORD,{
    dialect: "postgres",
    host: process.env.DB_HOST,
  });

module.exports = sequelizeconnection;