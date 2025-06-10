export type NotificationType =
  | 'ConnectionRequest'
  | 'HabitCheckRequest'
  | 'ProgressUpdate'
  | 'CheerReceived'
  | 'CheerSent';

export interface NotificationData {
  ConnectionId?: string;
  HabitCheckRequestId?: string;
  HabitId?: string;
  HabitName?: string;
  CheerFrom?: string;
  CheerFromUsername?: string;
  CheerMessage?: string;
  CheerTo?: string;
  CheerToUsername?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data: NotificationData;
}

export class NotificationFactory {
  static createFromResponse(response: any): Notification {
    return {
      id: response.id,
      type: response.type,
      title: response.title,
      message: response.message,
      timestamp: new Date(response.createdAt),
      read: response.isRead,
      data: this.deserializeData(response.data),
    };
  }

  private static deserializeData(data: string): NotificationData {
    if (!data) return {};

    try {
      const parsedData = JSON.parse(data);
      return {
        ConnectionId: parsedData.ConnectionId,
        HabitCheckRequestId: parsedData.HabitCheckRequestId,
        HabitId: parsedData.HabitId,
        HabitName: parsedData.HabitName,
        CheerFrom: parsedData.CheerFrom,
        CheerFromUsername: parsedData.CheerFromUsername,
        CheerMessage: parsedData.CheerMessage,
        CheerTo: parsedData.CheerTo,
        CheerToUsername: parsedData.CheerToUsername,
      };
    } catch (error) {
      console.error('Error parsing notification data:', error);
      return {};
    }
  }
}
