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
    await queryInterface.bulkInsert('notifications', [
      {
        id: 1,
        user_id: 1,
        restaurant_id: 1,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking đã được xác nhận',
        message: 'Nhà hàng đã xác nhận booking của bạn.',
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: now,
        sent_at: now,
      },
      {
        id: 2,
        user_id: 2,
        restaurant_id: 2,
        type: 'BOOKING_CREATED',
        title: 'Đã tạo booking',
        message: 'Booking của bạn đang chờ xác nhận.',
        channel: 'IN_APP',
        is_read: true,
        read_at: now,
        created_at: now,
        sent_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notifications', { id: [1,2] });
  },
};
