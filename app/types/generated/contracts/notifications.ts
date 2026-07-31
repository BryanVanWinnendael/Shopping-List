// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { NotificationType } from "../models/notification_type"
import { Notification } from "../models/notification"

export interface CreateNotificationRequest {
  user: string
  type: NotificationType
  token: string
}

export type CreateNotificationResponse = Notification

export type GetAllNotificationsResponse = Notification[]

export type GetUserNotificationsResponse = Notification[]

export interface PushUserNotificationByTypeRequest {
  env?: string | null
  text?: string | null
}

export interface PushUserNotificationByTypeResponse {
  message: string
  type?: NotificationType | null
  user?: string | null
}

export interface DeleteUserNotificationResponse {
  message: string
  type?: NotificationType | null
  user?: string | null
}

