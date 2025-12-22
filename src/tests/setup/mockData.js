// src/tests/setup/mockData.js

export const mockUser = {
  id: 1,
  display_name: "Test User",
  email: "test@example.com",
  password_hash: "$2b$10$mockHashedPassword",
  phone: "0901234567",
  avatar_url: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockRestaurant = {
  id: 1,
  name: "Test Restaurant",
  address: "123 Test St",
  phone: "0901234567",
  description: "Test description",
  tags: "vietnamese,lunch,dinner",
  require_deposit: true,
  default_deposit_amount: 50000,
  is_active: true,
  average_rating: 4.5,
  review_count: 10,
  favorite_count: 5,
  invite_code: "TEST123",
  main_image_url: "/uploads/test.jpg",
  open_time: "08:00:00",
  close_time: "22:00:00",
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockRestaurantAccount = {
  id: 1,
  restaurant_id: 1,
  full_name: "Test Owner",
  email: "owner@test.com",
  password_hash: "$2b$10$mockHashedPassword",
  role: "OWNER",
  status: "ACTIVE",
  is_locked: false,
  avatar_url: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockBooking = {
  id: 1,
  restaurant_id: 1,
  table_id: 1,
  user_id: 1,
  phone: "0901234567",
  customer_name: "Test Customer",
  people_count: 4,
  booking_time: new Date("2025-12-25 19:00:00"),
  status: "PENDING",
  deposit_amount: 50000,
  payment_status: "PENDING",
  payment_provider: null,
  payment_reference: null,
  paid_at: null,
  refunded_at: null,
  note: "Test booking",
  reminder_sent_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockReview = {
  id: 1,
  booking_id: 1,
  restaurant_id: 1,
  user_id: 1,
  rating: 5,
  comment: "Great food!",
  status: "VISIBLE",
  reply_comment: null,
  reply_account_id: null,
  reply_created_at: null,
  reply_updated_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockTable = {
  id: 1,
  restaurant_id: 1,
  name: "Table 1",
  capacity: 4,
  location: "Floor 1",
  status: "ACTIVE",
  view_image_url: "/uploads/table. jpg",
  view_note: "Window view",
  created_at: new Date(),
  updated_at: new Date(),
};
