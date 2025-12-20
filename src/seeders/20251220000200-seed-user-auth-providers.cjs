'use strict';
/**
 * Seeder generated for restaurant_booking (demo data)
 * NOTE:
 * - table names use underscored + timestamps like your schema.sql
 * - adjust emails/paths as you like
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('user_auth_providers', [
      {
        user_id: 1,
        provider: 'ZALO',
        provider_user_id: 'zalo_100000001',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 2,
        provider: 'ZALO',
        provider_user_id: 'zalo_100000002',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_auth_providers', { id: [1,2] });
  },
};
