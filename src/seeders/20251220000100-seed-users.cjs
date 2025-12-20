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
    await queryInterface.bulkInsert('users', [
      {
        display_name: 'Nguyễn Văn Z',
        email: 'bdat6832@gmail.com',
        password_hash: null, // demo - you can put bcrypt hash
        phone: '0900000001',
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        display_name: 'Trần Thị B',
        email: 'b.user@example.com',
        password_hash: null,
        phone: '0900000002',
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { id: [1,2] });
  },
};
