'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Owner extends Model {
    static associate(models) {
      // define association here
    }
  }
  Owner.init({
    own_username: DataTypes.STRING,
    own_password: DataTypes.STRING,
    own_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Owner',
  });
  return Owner;
};
