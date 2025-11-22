import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageCircle, UserPlus, Mail, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const user = await base44.auth.me();
    const data = await base44.entities.Notification.filter(
      { user_email: user.email },
      "-created_date",
      20
    );
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const markAsRead = async (notification) => {
    if (!notification.read) {
      await base44.entities.Notification.update(notification.id, { read: true });
      await loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification);
    
    if (notification.type === "comment") {
      navigate(createPageUrl("Feed"));
    } else if (notification.type === "message") {
      navigate(createPageUrl("Messages"));
    } else if (notification.type === "follow") {
      navigate(`${createPageUrl("Profile")}?email=${encodeURIComponent(notification.from_user)}`);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    await Promise.all(unreadIds.map(id => 
      base44.entities.Notification.update(id, { read: true })
    ));
    await loadNotifications();
  };

  const getIcon = (type) => {
    switch(type) {
      case "comment": return MessageCircle;
      case "message": return Mail;
      case "follow": return UserPlus;
      default: return Bell;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-cyan-300 hover:text-cyan-100">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[#1b263b] border-cyan-900/50 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b border-cyan-900/30">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-cyan-400 hover:text-cyan-300 h-auto py-1 px-2"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-cyan-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer p-3 ${
                  !notification.read ? 'bg-cyan-900/20' : ''
                } hover:bg-cyan-900/30 text-cyan-100`}
              >
                <div className="flex gap-3 w-full">
                  <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words">{notification.content}</p>
                    <p className="text-xs text-cyan-500 mt-1">
                      {format(new Date(notification.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}