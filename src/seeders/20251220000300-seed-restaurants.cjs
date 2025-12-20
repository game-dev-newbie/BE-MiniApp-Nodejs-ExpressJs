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
    await queryInterface.bulkInsert('restaurants', [
      {
        name: 'Quán Cơm Nhà',
        address: '12 Nguyễn Huệ, Quận 1, TP.HCM',
        phone: '02812345678',
        description: 'Quán cơm gia đình, món Việt.',
        tags: 'viet,com-nha,gia-dinh',
        search_name: 'quan com nha',
        search_address: '12 nguyen hue quan 1 tphcm',
        search_tags: 'viet com nha gia dinh',
        require_deposit: true,
        default_deposit_amount: 50000,
        is_active: true,
        average_rating: 4.6,
        review_count: 2,
        favorite_count: 1,
        invite_code: 'INVITE-RES-1',
        main_image_url: null,
        open_time: '08:00:00',
        close_time: '22:00:00',
        created_at: now,
        updated_at: now,
      },
      {
        
        name: 'Lẩu Nướng 99',
        address: '99 Cách Mạng Tháng 8, Quận 3, TP.HCM',
        phone: '02898765432',
        description: 'Lẩu nướng, phù hợp nhóm bạn.',
        tags: 'lau,nuong,bbq,nhom-ban',
        search_name: 'lau nuong 99',
        search_address: '99 cach mang thang 8 quan 3 tphcm',
        search_tags: 'lau nuong bbq nhom ban',
        require_deposit: false,
        default_deposit_amount: 0,
        is_active: true,
        average_rating: 4.2,
        review_count: 1,
        favorite_count: 0,
        invite_code: 'INVITE-RES-2',
        main_image_url: null,
        open_time: '10:00:00',
        close_time: '23:00:00',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurants', { id: [1,2] });
  },
};
