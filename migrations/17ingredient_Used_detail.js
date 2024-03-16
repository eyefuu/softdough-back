'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ingredient_Used_detail', {
            indUd_id : {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            indU_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ingredient_Used',
                    key: 'indU_id'
                }
            },
            indlde_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ingredient_lot_detail',
                    key: 'ind_id'
                }
            },
            qty_used_sum: {
                type: Sequelize.INTEGER
            },
            scrap: {
                type: Sequelize.INTEGER
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }            
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ingredient_Used_detail');
    }
};
