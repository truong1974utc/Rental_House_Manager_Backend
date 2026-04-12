import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createNotificationSchema, updateNotificationSchema, getNotificationSchema } from "../schemas/notification.schema.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", NotificationController.getNotifications);

// Admin only can create notifications
router.post("/", authorizeRoles("manager", "ADMIN", "admin"), validate(createNotificationSchema), NotificationController.createNotification);

// Anyone can mark their own notifications as read
router.patch("/:id/read", validate(updateNotificationSchema), NotificationController.markAsRead);

router.post("/mark-all-read", NotificationController.markAllAsRead);

// Admin can delete notification
router.delete("/:id", authorizeRoles("manager", "ADMIN", "admin"), validate(getNotificationSchema), NotificationController.deleteNotification);

export default router;