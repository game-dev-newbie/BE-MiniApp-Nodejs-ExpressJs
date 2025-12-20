'use strict';
/**
 * Seeder generated for restaurant_booking (demo data)
 * NOTE:
 * - table names use underscored + timestamps like your schema.sql
 * - adjust emails/paths as you like
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date('2025-12-20 10:00:00');
    await queryInterface.bulkInsert('payments', [
      {
        id: 1,
        booking_id: 1,
        amount: 50000,
        provider: 'DEMO',
        status: 'SUCCESS',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', { id: [1] });
  },
};
