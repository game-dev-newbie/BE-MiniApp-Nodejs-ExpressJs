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
    await queryInterface.bulkInsert('favorite_restaurants', [
      {
        id: 1,
        user_id: 1,
        restaurant_id: 1,
        created_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('favorite_restaurants', { id: [1] });
  },
};
