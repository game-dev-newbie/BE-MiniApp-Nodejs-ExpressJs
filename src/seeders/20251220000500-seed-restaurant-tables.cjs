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
    await queryInterface.bulkInsert('restaurant_tables', [
      {
        id: 1,
        restaurant_id: 1,
        name: 'Bàn 01',
        capacity: 4,
        location: 'Tầng trệt',
        status: 'ACTIVE',
        view_image_url: '/uploads/tables/1/view/table-1.jpg',
        view_note: 'Gần cửa sổ',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        restaurant_id: 1,
        name: 'Bàn 02',
        capacity: 6,
        location: 'Tầng 1',
        status: 'ACTIVE',
        view_image_url: null,
        view_note: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        restaurant_id: 2,
        name: 'Bàn 01',
        capacity: 8,
        location: 'Sân thượng',
        status: 'ACTIVE',
        view_image_url: null,
        view_note: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurant_tables', { id: [1,2,3] });
  },
};
