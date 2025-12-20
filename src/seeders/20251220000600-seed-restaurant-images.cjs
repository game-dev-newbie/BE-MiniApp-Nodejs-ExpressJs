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
    await queryInterface.bulkInsert('restaurant_images', [
      {
        id: 1,
        restaurant_id: 1,
        file_path: '/uploads/restaurants/1/cover/cover-1.jpg',
        type: 'COVER',
        caption: 'Ảnh cover chính',
        is_primary: true,
        created_at: now,
      },
      {
        id: 2,
        restaurant_id: 1,
        file_path: '/uploads/restaurants/1/gallery/gallery-1.jpg',
        type: 'GALLERY',
        caption: 'Không gian quán',
        is_primary: false,
        created_at: now,
      },
      {
        id: 3,
        restaurant_id: 2,
        file_path: '/uploads/restaurants/2/cover/cover-1.jpg',
        type: 'COVER',
        caption: 'Ảnh cover chính',
        is_primary: true,
        created_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurant_images', { id: [1,2,3] });
  },
};
