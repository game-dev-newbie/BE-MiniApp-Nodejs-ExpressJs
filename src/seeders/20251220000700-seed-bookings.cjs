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
    const book1 = new Date('2025-12-21 12:00:00');
    const book2 = new Date('2025-12-21 19:00:00');
    await queryInterface.bulkInsert('bookings', [
      {
        id: 1,
        restaurant_id: 1,
        table_id: 1,
        user_id: 1,
        phone: '0900000001',
        customer_name: 'Nguyễn Văn A',
        people_count: 2,
        booking_time: book1,
        status: 'CONFIRMED',
        deposit_amount: 50000,
        payment_status: 'PAID',
        payment_provider: 'DEMO',
        payment_reference: 'PAY-DEMO-0001',
        paid_at: now,
        refunded_at: null,
        note: 'Ăn ít cay',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        restaurant_id: 2,
        table_id: 3,
        user_id: 2,
        phone: '0900000002',
        customer_name: 'Trần Thị B',
        people_count: 4,
        booking_time: book2,
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        payment_provider: null,
        payment_reference: null,
        paid_at: null,
        refunded_at: null,
        note: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bookings', { id: [1,2] });
  },
};
