import React from "react";

type Notification = {
  time: string;
  title: string;
  body: string;
  recipients: number;
};

type NotificationsTableProps = {
  notifications: Notification[];
};

const NotificationsTable: React.FunctionComponent<NotificationsTableProps> = ({ notifications }) => {
  return (
    <table className="w-full max-w-8xl mx-auto border-collapse">
      <thead>
        <tr>
          <th className="rounded-tl-lg border-b border-gray-600 shadow-sm px-4 py-2 text-left bg-[#33333c]">Time</th>
          <th className="border-b border-gray-600 shadow-sm px-4 py-2 text-left bg-[#33333c]">Title</th>
          <th className="border-b border-gray-600 shadow-sm px-4 py-2 text-left bg-[#33333c]">Body</th>
          <th className="rounded-tr-md border-b border-gray-600 shadow-sm px-4 py-2 text-left bg-[#33333c]">
            Recipients
          </th>
        </tr>
      </thead>
      <tbody>
        {notifications.slice().reverse().map((notification, index) => (
          <tr key={index}>
            <td className="border-b border-gray-600 shadow-sm px-4 py-2 text-left">{notification.time}</td>
            <td className="border-b border-gray-600 shadow-sm px-4 py-2 text-left">{notification.title}</td>
            <td className="border-b border-gray-600 shadow-sm px-4 py-2 text-left">{notification.body}</td>
            <td className="border-b border-gray-600 shadow-sm px-4 py-2 text-left">{notification.recipients}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NotificationsTable;
