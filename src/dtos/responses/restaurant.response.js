// src/dtos/responses/restaurant.response.js
import time from "../../utils/time.js";

class RestaurantResponse {
  static _toPlain(instance) {
    if (!instance) return null;
    return typeof instance.get === "function"
      ? instance.get({ plain: true })
      : instance;
  }

  /**
   * Tìm main_image_url final:
   * - Ưu tiên cột restaurants.main_image_url
   * - Nếu không có, fallback sang ảnh COVER trong association images
   */
  static _resolveMainImage(plain) {
    if (!plain) return null;

    // Nếu có cột main_image_url thì dùng luôn
    if (plain.main_image_url) {
      return plain.main_image_url;
    }

    // Ngược lại, tìm trong ảnh liên quan
    const images = Array.isArray(plain.RestaurantImages)
      ? plain.RestaurantImages
      : [];

    if (!images.length) return null;

    // ưu tiên ảnh type = 'COVER' và is_primary = true
    const coverImages = images.filter((img) => img.type === "COVER");
    if (!coverImages.length) return null;

    const primary = coverImages.find((img) => img.is_primary) || coverImages[0];

    return primary?.file_path || null;
  }

  /**
   * Dùng cho dashboard: đầy đủ thông tin
   */
  static toDashboard(restaurantInstance) {
    const plain = this._toPlain(restaurantInstance);
    if (!plain) return null;

    const mainImageUrl = this._resolveMainImage(plain);

    const {
      id,
      name,
      address,
      phone,
      description,
      tags,
      require_deposit,
      default_deposit_amount,
      is_active,
      average_rating,
      review_count,
      favorite_count,
      invite_code,
      open_time,
      close_time,
      created_at,
      updated_at,
    } = plain;

    return {
      id,
      name,
      address,
      phone,
      description,
      tags,
      require_deposit,
      default_deposit_amount,
      is_active,
      average_rating,
      review_count,
      favorite_count,
      invite_code,
      open_time,
      close_time,
      main_image_url: mainImageUrl,
      created_at: time.toVNDateTime(created_at),
      updated_at: time.toVNDateTime(updated_at),
    };
  }

  /**
   * Card miniapp home (top rating / top favorite / theo tag)
   */
  static toMiniappCard(restaurantInstance) {
    const plain = this._toPlain(restaurantInstance);
    if (!plain) return null;

    const mainImageUrl = this._resolveMainImage(plain);

    const {
      id,
      name,
      average_rating,
      review_count,
      favorite_count,
      tags,
      require_deposit,
      default_deposit_amount,
      is_active,
    } = plain;

    return {
      id,
      name,
      average_rating,
      review_count,
      favorite_count,
      tags,
      require_deposit,
      default_deposit_amount,
      is_active,
      main_image_url: mainImageUrl,
    };
  }

  /**
   * Detail miniapp:
   * - Thông tin chi tiết
   * - Kèm danh sách tất cả ảnh theo type
   */
  static toMiniappDetail(restaurantInstance) {
    const plain = this._toPlain(restaurantInstance);
    if (!plain) return null;

    const card = this.toMiniappCard(plain); // reuse logic main_image_url

    const images = Array.isArray(plain.images)
      ? plain.images.map((img) => ({
          id: img.id,
          file_path: img.file_path,
          type: img.type, // 'COVER' | 'GALLERY' | 'MENU' ... tuỳ bạn định nghĩa
          caption: img.caption,
          is_primary: img.is_primary,
        }))
      : [];

    return {
      ...card,
      address: plain.address,
      phone: plain.phone,
      description: plain.description,
      open_time: plain.open_time,
      close_time: plain.close_time,
      images,
    };
  }

  static listToMiniappCards(instances) {
    if (!Array.isArray(instances)) return [];
    return instances.map((r) => this.toMiniappCard(r));
  }
}

export default RestaurantResponse;
