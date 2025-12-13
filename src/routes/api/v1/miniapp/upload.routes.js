// src/routes/api/v1/common/upload.routes.js
import { Router } from "express";
import uploadController from "../../../../controllers/upload.controller.js";
import { uploadSingleImageMiddleware } from "../../../../middlewares/uploadImage.middleware.js";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";

const router = Router();

// Upload ảnh avater của customer
router.post(
  "/images/users/avatar",
  ...requireCustomer(),
  (req, res, next) => {
    req.query.scope = "user_avatar";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

export default router;
