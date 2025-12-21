// src/utils/reviewCalculation.util.js

import { sequelize } from "../models/index.js";
import models from "../models/index.js";
import { REVIEW_STATUS } from "../constants/index.js";

const { Review, Restaurant } = models;

/**
 * Tính toán lại average_rating và review_count cho 1 restaurant
 * - Chỉ tính reviews có status = VISIBLE
 * - Update vào bảng restaurants
 *
 * @param {number} restaurantId
 * @returns {Promise<{averageRating: number, reviewCount: number}>}
 */
export const recalculateRestaurantRating = async (restaurantId) => {
  if (!restaurantId) {
    console.warn("⚠️ recalculateRestaurantRating: restaurantId is missing");
    return { averageRating: 0, reviewCount: 0 };
  }

  // 1. Tính AVG và COUNT từ database
  const result = await Review.findOne({
    where: {
      restaurant_id: restaurantId,
      status: REVIEW_STATUS.VISIBLE, // Chỉ tính reviews đang hiển thị
    },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    raw: true,
  });

  // 2. Parse kết quả
  const averageRating = result?.avg_rating ? parseFloat(result.avg_rating) : 0;
  const reviewCount = result?.count ? parseInt(result.count) : 0;

  // 3. Round average_rating to 1 decimal (e.g., 4.5, 3.7)
  const roundedAverage = Math.round(averageRating * 10) / 10;

  // 4. Update vào bảng restaurants
  await Restaurant.update(
    {
      average_rating: roundedAverage,
      review_count: reviewCount,
    },
    {
      where: { id: restaurantId },
    }
  );

  console.log(`✅ Recalculated rating for restaurant ${restaurantId}:`);
  console.log(`   Average:  ${roundedAverage} (from ${averageRating})`);
  console.log(`   Count: ${reviewCount}`);

  return {
    averageRating: roundedAverage,
    reviewCount,
  };
};

/**
 * Tính toán lại ratings cho nhiều restaurants cùng lúc
 * Hữu ích khi cần sync lại toàn bộ database
 */
export const recalculateAllRestaurantRatings = async () => {
  const restaurants = await Restaurant.findAll({
    attributes: ["id"],
    raw: true,
  });

  console.log(
    `🔄 Recalculating ratings for ${restaurants.length} restaurants...`
  );

  let successCount = 0;
  let failCount = 0;

  for (const restaurant of restaurants) {
    try {
      await recalculateRestaurantRating(restaurant.id);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Failed to recalculate for restaurant ${restaurant.id}:`,
        error
      );
      failCount++;
    }
  }

  console.log(`✅ Recalculation completed:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);

  return { successCount, failCount };
};
