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
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
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
