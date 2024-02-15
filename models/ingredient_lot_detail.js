'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class IngredientLotDetail extends Model {
        static associate(models) {
            // No need to define association here
        }
        
    }
    IngredientLot.init({
        qtypurchased: DataTypes.INTEGER,
        date_exp: DataTypes.INTEGER,
        price: DataTypes.FLOAT,
        ind_id: DataTypes.INTEGER,
        indl_id: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'IngredientLotDetail',
    });
    return IngredientLotDetail;
};
