"use client";

import { load_chats, load_friends } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import styles from "./dm.module.css";
import Images from "@/Images";

export default function DM({ params }) {
  const { userId } = params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [receiverColor, setReceiverColor] = useState();
  const [receiverName, setReceiverName] = useState();
  const [myColor, setMyColor] = useState();

  const router = useRouter();

  const connectSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    newSocket.on("message", (data) => {
      const formattedMessage = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      console.log(formattedMessage);
    });

    setSocket(newSocket);

    return newSocket;
  }, []);

  useEffect(() => {
    const storedmyColor = localStorage.getItem("userInfo");
    if (storedmyColor) {
      setMyColor(JSON.parse(storedmyColor).iconColor);
      console.log(storedmyColor);
    }
  }, [router]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await load_chats(decodeURIComponent(userId));
        setMessages(chats);
        console.log(chats);
      } catch (err) {
        console.error("load chat err", err);
      }
    };

    fetchChats();
  }, [userId]);

  useEffect(() => {
    load_friends().then((friendsList) => {
      const matchingFriends = friendsList.filter(
        (friend) => friend.name == decodeURIComponent(userId)
      );

      if (matchingFriends.length > 0) {
        setReceiverColor(matchingFriends[0].iconColor);
        setReceiverName(matchingFriends[0].name);
      } else {
        router.push("/");
      }
    });
  }, []);

  useEffect(() => {
    const newSocket = connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [connectSocket]);

  const sendMessage = useCallback(() => {
    if (message && socket) {
      socket.emit("message", {
        receivedUser: decodeURIComponent(userId),
        message,
      });
      setMessage("");
    }
  }, [message, socket, userId]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);

    const dateString = date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".");

    const timeString = date
      .toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace("오전", "오전 ")
      .replace("오후", "오후 ");

    return `${dateString} ${timeString}`;
  };

  return (
    <div className={styles.dmBody}>
      <header className={styles.header}>
        <div className={styles.headerWrap}>
          <div className={styles.headerIconWrap}>
            <div
              className={styles.headerIcon}
              style={{ backgroundColor: receiverColor }}
            >
              <Images.icon className={styles.icon} />
            </div>
            {receiverName}
          </div>
        </div>
      </header>

      <div className={styles.chats}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`chat-message ${
              msg.senderId === receiverName ? "received" : "sent"
            }`}
          >
            <div className="message-info">
              <span className="sender-id">{msg.senderId}</span>
              <span className="timestamp">{formatDateTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
      </div>

      <div className={styles.chatInputWrap}>
        <div className={styles.chatInput}>
          <input
            type="text"
            placeholder={`@${receiverName}에 메시지 보내기`}
            className={styles.input}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
          />
        </div>
      </div>
    </div>
  );
}
