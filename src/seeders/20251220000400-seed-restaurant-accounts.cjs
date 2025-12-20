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
    await queryInterface.bulkInsert('restaurant_accounts', [
      {
        restaurant_id: 1,
        full_name: 'Owner Res1',
        email: 'owner1@demo.com',
        password_hash: 'demo_password_hash',
        role: 'OWNER',
        status: 'ACTIVE',
        is_locked: false,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        restaurant_id: 1,
        full_name: 'Staff Res1',
        email: 'staff1@demo.com',
        password_hash: 'demo_password_hash',
        role: 'STAFF',
        status: 'ACTIVE',
        is_locked: false,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        restaurant_id: 2,
        full_name: 'Owner Res2',
        email: 'owner2@demo.com',
        password_hash: 'demo_password_hash',
        role: 'OWNER',
        status: 'ACTIVE',
        is_locked: false,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurant_accounts', { id: [1,2,3] });
  },
};
