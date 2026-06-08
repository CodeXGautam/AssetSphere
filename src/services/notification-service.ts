import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/notification";
import { sendEmail } from "@/lib/sendgrid";

export const notificationService = {
  async notify({
    userId,
    subject,
    message,
    type = "SYSTEM",
    email,
  }: {
    userId: string;
    subject: string;
    message: string;
    type?: string;
    email?: string;
  }) {
    await connectToDatabase();
    const notification = await Notification.create({
      userId,
      subject,
      message,
      type,
    });

    if (email) {
      await sendEmail({ to: email, subject, html: `<p>${message}</p>` });
    }

    return notification;
  },

  async list(userId: string) {
    await connectToDatabase();
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  },
};
