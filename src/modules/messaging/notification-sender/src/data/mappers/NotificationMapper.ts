/**
 * Notification Mapper
 *
 * Converts between Notification Models (DTOs) and Entities (Domain).
 *
 * @module notification-sender/data
 */
import {
  NotificationTarget,
  type NotificationTargetData,
} from "../../domain/entities/Notification";
import type { NotificationTargetJson } from "../models/NotificationModel";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class NotificationMapper {
  /**
   * Convert NotificationTargetJson → NotificationTarget Entity
   */
  static toTargetEntity(json: NotificationTargetJson): NotificationTarget {
    const data: NotificationTargetData = {
      id: json.id,
      name: json.name,
      type: json.type,
    };
    return new NotificationTarget(data);
  }
}
