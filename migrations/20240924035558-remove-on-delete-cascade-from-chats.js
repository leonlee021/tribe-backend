// migrations/XXXXXXXXXXXXXX-remove-on-delete-cascade-from-chats.js

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove existing foreign key constraint
        await queryInterface.removeConstraint('Chats', 'Chats_taskId_fkey');

        // Add new foreign key constraint without 'ON DELETE CASCADE'
        await queryInterface.addConstraint('Chats', {
            fields: ['taskId'],
            type: 'foreign key',
            name: 'Chats_taskId_fkey',
            references: {
                table: 'Tasks',
                field: 'id',
            },
            onDelete: 'RESTRICT', // Prevent deletion if related Chats exist
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Re-add the 'ON DELETE CASCADE' constraint in case of rollback
        await queryInterface.removeConstraint('Chats', 'Chats_taskId_fkey');

        await queryInterface.addConstraint('Chats', {
            fields: ['taskId'],
            type: 'foreign key',
            name: 'Chats_taskId_fkey',
            references: {
                table: 'Tasks',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
};
