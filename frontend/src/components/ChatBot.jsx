import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Clean SVG Icons (Strictly Vector SVGs - No emojis or stickers)
const BotIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const UserIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SendIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PackageIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClockIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefundIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const QuestionIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MailIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ArrowRightIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const STATUS_COLORS = {
  pending:   { bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)', color: '#f5a623' },
  paid:      { bg: 'rgba(76,175,80,0.12)',  border: 'rgba(76,175,80,0.3)',  color: '#4caf50' },
  cancelled: { bg: 'rgba(255,77,77,0.12)',  border: 'rgba(255,77,77,0.3)',  color: '#ff4d4d' },
  refunded:  { bg: 'rgba(100,100,255,0.12)',border: 'rgba(100,100,255,0.3)',color: '#6496ff' },
};

export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Dynamic typewriter on trigger button and inside chat
  const [triggerText, setTriggerText] = useState('');
  const [greetingTyped, setGreetingTyped] = useState('');
  const [isTypingGreeting, setIsTypingGreeting] = useState(false);

  const messagesEndRef = useRef(null);
  const DYNAMIC_GREETING = "Hii, How can i help you";

  // Dynamic typing effect on floating trigger button (writes, disappears, and loops)
  useEffect(() => {
    let idx = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      if (!isDeleting) {
        if (idx <= DYNAMIC_GREETING.length) {
          setTriggerText(DYNAMIC_GREETING.slice(0, idx));
          idx++;
          timer = setTimeout(tick, 70);
        } else {
          // Stay visible for 3 seconds before disappearing
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 3000);
        }
      } else {
        if (idx > 0) {
          idx--;
          setTriggerText(DYNAMIC_GREETING.slice(0, idx));
          timer = setTimeout(tick, 35);
        } else {
          // Wait 0.8s before typing again
          isDeleting = false;
          timer = setTimeout(tick, 800);
        }
      }
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  // Fetch logged in user orders
  useEffect(() => {
    if (user && isOpen) {
      setLoadingOrders(true);
      ordersAPI.getOrders()
        .then((res) => setUserOrders(res.data || []))
        .catch(() => setUserOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [user, isOpen]);

  // Dynamic typing greeting inside chat window
  const triggerDynamicGreeting = () => {
    setMessages([]);
    setShowOptions(false);
    setIsTypingGreeting(true);
    setGreetingTyped('');

    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      if (charIdx <= DYNAMIC_GREETING.length) {
        setGreetingTyped(DYNAMIC_GREETING.slice(0, charIdx));
      } else {
        clearInterval(interval);
        setIsTypingGreeting(false);
        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: DYNAMIC_GREETING,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setShowOptions(true);
      }
    }, 38);
  };

  // Run dynamic greeting when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isTypingGreeting) {
      triggerDynamicGreeting();
    }
  }, [isOpen]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isTypingGreeting, greetingTyped, isOpen]);

  // Reset conversation
  const handleRestart = () => {
    setInputText('');
    triggerDynamicGreeting();
  };

  // Add bot reply with simulated typing delay
  const pushBotMessage = (text, extraData = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text,
          extraData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  // Helper to fetch freshest orders
  const fetchUserOrders = async () => {
    if (user) {
      try {
        const res = await ordersAPI.getOrders();
        const list = res.data || [];
        setUserOrders(list);
        return list;
      } catch (err) {
        return userOrders;
      }
    }
    return userOrders;
  };

  // Handle preset option clicks
  const handleSelectOption = async (optionKey) => {
    setShowOptions(false);

    if (optionKey === 'not_received') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "I haven't received my order yet." },
      ]);

      setIsTyping(true);
      const ordersList = await fetchUserOrders();
      setIsTyping(false);

      const pendingOrders = ordersList.filter((o) => o.status === 'pending');
      const paidOrders = ordersList.filter((o) => o.status === 'paid');

      if (pendingOrders.length > 1) {
        pushBotMessage(
          `You have ${pendingOrders.length} pending orders currently in verification status. All digital subscriptions are guaranteed to be delivered within 24 hours of placement:`,
          { orders: pendingOrders }
        );
      } else if (pendingOrders.length === 1) {
        const singlePending = pendingOrders[0];
        pushBotMessage(
          `Your order #${singlePending.order_number} is currently in Pending verification status. It will be delivered to your account and email within 24 hours of placement.`,
          { orders: [singlePending], order: singlePending }
        );
      } else if (paidOrders.length > 0) {
        pushBotMessage(
          `You don't have any pending orders. Your recent order #${paidOrders[0].order_number} has already been marked as Paid & Delivered! You can view your credentials in the My Orders section.`,
          { orders: paidOrders.slice(0, 2), order: paidOrders[0] }
        );
      } else if (ordersList.length > 0) {
        const latest = ordersList[0];
        pushBotMessage(
          `You don't have any pending orders. Your latest order #${latest.order_number} status is "${latest.status.toUpperCase()}". Digital subscriptions are guaranteed to be delivered within 24 hours.`,
          { orders: [latest], order: latest }
        );
      } else {
        pushBotMessage(
          "No pending orders found for your account. All digital subscriptions and credentials are verified and delivered within 24 hours from the time you ordered. If you have an order number, please enter it below to track your live status."
        );
      }
    } else if (optionKey === 'refund_24h') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "When will I get my refund, order already has 24 hrs time?" },
      ]);

      setIsTyping(true);
      const ordersList = await fetchUserOrders();
      setIsTyping(false);

      if (ordersList.length > 0) {
        const latest = ordersList[0];
        pushBotMessage(
          `Our support team connects with you directly regarding eligible refund requests. For order #${latest.order_number}, once initiated, the refund will be credited and debited back to your original payment account within 7 working days.`,
          { order: latest, orders: [latest] }
        );
      } else {
        pushBotMessage(
          "If your order has passed 24 hours without delivery, our team will connect with you. The refund will be credited and debited into your account within 7 working days."
        );
      }
    } else if (optionKey === 'last_order_status') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "Tell me the status of my last order." },
      ]);

      setIsTyping(true);
      const ordersList = await fetchUserOrders();
      setIsTyping(false);

      if (ordersList.length === 0) {
        pushBotMessage(
          "No past orders found for your account. If you placed an order as a guest or want to check a specific order, please type your Order Number below."
        );
      } else {
        const latest = ordersList[0];
        if (latest.status === 'pending') {
          pushBotMessage(
            `Your last order #${latest.order_number} is currently Pending. We will deliver it within 24 hours.`,
            { order: latest, orders: [latest] }
          );
        } else if (latest.status === 'paid') {
          pushBotMessage(
            `Your last order #${latest.order_number} has been delivered! Access your credentials in the My Orders tab.`,
            { order: latest, orders: [latest] }
          );
        } else if (latest.status === 'refunded') {
          pushBotMessage(
            `Your last order #${latest.order_number} is marked as Refunded.`,
            { order: latest, orders: [latest] }
          );
        } else {
          pushBotMessage(
            `Your last order #${latest.order_number} status is ${latest.status.toUpperCase()}.`,
            { order: latest, orders: [latest] }
          );
        }
      }
    } else if (optionKey === 'portal_refund_issue') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "In portal it shows refunded, but in actual it is not?" },
      ]);

      pushBotMessage(
        "When marked as refunded in our portal, bank clearing typically takes 3 to 7 working days to reflect on your statement. If 7 working days have already passed and you have not received it, please contact our support team directly.",
        { showContact: true }
      );
    } else if (optionKey === 'track_order_number') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "Track by Order Number" },
      ]);

      pushBotMessage(
        "Please type your Order Number below (e.g. SF-ABC123XYZ) and send it."
      );
    } else if (optionKey === 'how_credentials') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "How do I access my delivered product credentials?" },
      ]);

      pushBotMessage(
        "Once payment is verified and status turns Paid, your login details, license key, and setup instructions appear instantly on the My Orders page, and are also emailed to you."
      );
    } else if (optionKey === 'contact_support') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: "Connect with support" },
      ]);

      pushBotMessage(
        "Our support team is available to assist you. You can reach out directly via email or check your portal status.",
        { showContact: true }
      );
    }
  };

  // Handle custom text submit (e.g. order number lookup)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: query },
    ]);
    setInputText('');
    setShowOptions(false);

    // Check if query resembles an order number
    const isOrderNumberPattern = /^(SF-)?[A-Za-z0-9]{6,16}$/i.test(query);

    if (isOrderNumberPattern || query.toLowerCase().includes('sf-')) {
      setIsTyping(true);
      try {
        const res = await ordersAPI.trackOrder(query);
        const ord = res.data;
        setIsTyping(false);

        let statusText = '';
        if (ord.status === 'pending') {
          statusText = `Order #${ord.order_number} is Pending. We will deliver it within 24 hours of ordering.`;
        } else if (ord.status === 'paid') {
          statusText = `Order #${ord.order_number} has been delivered and is Paid! You can access your product details.`;
        } else if (ord.status === 'refunded') {
          statusText = `Order #${ord.order_number} is marked as Refunded. Funds credit within 7 working days.`;
        } else {
          statusText = `Order #${ord.order_number} status is currently ${ord.status.toUpperCase()}.`;
        }

        pushBotMessage(statusText, { order: ord, orders: [ord] });
      } catch (err) {
        setIsTyping(false);
        pushBotMessage(
          `Could not find an order with number "${query}". Please verify the order number from your receipt, or contact support.`,
          { showContact: true }
        );
      }
      return;
    }

    // Keyword detection
    const lower = query.toLowerCase();

    // Check if query is asking about not receiving order or asking for pending orders
    const isNotReceivedQuery =
      /not\s*(?:yet\s*)?rec/i.test(lower) ||
      /no\s*rec/i.test(lower) ||
      /pending/i.test(lower) ||
      /not\s*got/i.test(lower) ||
      /haven'?t\s*rec/i.test(lower) ||
      /didn'?t\s*rec/i.test(lower) ||
      lower.includes('not received') ||
      lower.includes('not receive') ||
      lower.includes('not recvined') ||
      lower.includes('undelivered') ||
      lower.includes('order not delivered');

    if (isNotReceivedQuery) {
      setIsTyping(true);
      const ordersList = await fetchUserOrders();
      setIsTyping(false);

      const pendingOrders = ordersList.filter((o) => o.status === 'pending');
      const paidOrders = ordersList.filter((o) => o.status === 'paid');

      if (pendingOrders.length > 1) {
        pushBotMessage(
          `You have ${pendingOrders.length} pending orders currently in verification status. All digital subscriptions are guaranteed to be delivered within 24 hours of placement:`,
          { orders: pendingOrders }
        );
      } else if (pendingOrders.length === 1) {
        const singlePending = pendingOrders[0];
        pushBotMessage(
          `Your order #${singlePending.order_number} is currently in Pending verification status. It will be delivered to your account and email within 24 hours of placement.`,
          { orders: [singlePending], order: singlePending }
        );
      } else if (paidOrders.length > 0) {
        pushBotMessage(
          `You don't have any pending orders right now. Your recent order #${paidOrders[0].order_number} has already been marked as Paid & Delivered! You can view your credentials in the My Orders section.`,
          { orders: paidOrders.slice(0, 2), order: paidOrders[0] }
        );
      } else if (ordersList.length > 0) {
        const latest = ordersList[0];
        pushBotMessage(
          `You don't have any pending orders. Your latest order #${latest.order_number} status is "${latest.status.toUpperCase()}". Digital subscriptions are guaranteed to be delivered within 24 hours.`,
          { orders: [latest], order: latest }
        );
      } else {
        pushBotMessage(
          "No pending orders found for your account. All digital subscriptions and credentials are verified and delivered within 24 hours from the time you ordered. If you have an order number, please enter it below to track your live status."
        );
      }
      return;
    }

    if (lower.includes('refund') || lower.includes('money back')) {
      pushBotMessage(
        "Refunds for orders that have passed 24 hours are debited and credited back to your account within 7 working days. If it has been more than 7 days, please contact our support team.",
        { showContact: true }
      );
    } else if (lower.includes('status') || lower.includes('where is my order') || lower.includes('track')) {
      pushBotMessage(
        "To check your order status, please enter your Order Number (e.g. SF-ABC123) or select 'Tell me the status of my last order'."
      );
    } else if (lower.includes('contact') || lower.includes('help') || lower.includes('email') || lower.includes('whatsapp')) {
      pushBotMessage(
        "You can reach our official customer support team anytime:",
        { showContact: true }
      );
    } else {
      pushBotMessage(
        "I understand. For specific order assistance, please choose an option below or type your Order Number directly."
      );
      setTimeout(() => setShowOptions(true), 600);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Outfit:wght@600;700;800&display=swap');

        /* Floating Left Bottom Trigger - Exactly Matches Currency Toggle Height (42px) */
        .pm-chatbot-trigger {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          height: 42px;
          box-sizing: border-box;
          gap: 10px;
          background: #ffffff;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(124, 92, 252, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(124, 92, 252, 0.1);
          border-radius: 999px;
          padding: 4px 16px 4px 5px;
          cursor: pointer;
          user-select: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pm-chatbot-trigger:hover {
          border-color: rgba(124, 92, 252, 0.65);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16), 0 0 20px rgba(124, 92, 252, 0.25);
          transform: translateY(-2px);
        }
        .pm-bot-inner-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #7c5cfc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2);
          position: relative;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .pm-chatbot-trigger:hover .pm-bot-inner-circle {
          transform: rotate(-6deg);
        }
        .pm-online-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(16, 185, 129, 0.8);
        }
        .pm-trigger-dynamic-text {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          color: #0f172a;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }
        .pm-typing-cursor {
          display: inline-block;
          color: #7c5cfc;
          font-weight: 400;
          margin-left: 2px;
          animation: pmBlinkCursor 0.8s infinite;
        }
        @keyframes pmBlinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Chatbot Modal Window */
        .pm-chatbot-window {
          position: fixed;
          bottom: 84px;
          left: 24px;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 540px;
          max-height: calc(100vh - 110px);
          background: #0b0b12;
          border: 1px solid rgba(124, 92, 252, 0.35);
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(124, 92, 252, 0.2);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: pmChatIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pmChatIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Chat Header */
        .pm-chat-header {
          padding: 14px 16px;
          background: #101018;
          border-bottom: 1px solid #1e1e2e;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pm-chat-h-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pm-chat-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
        }
        .pm-chat-sub {
          font-size: 11px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        .pm-chat-sub-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }
        .pm-chat-h-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pm-chat-h-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #888;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pm-chat-h-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
          border-color: #2a2a3e;
        }

        /* Message Scroll Area */
        .pm-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pm-chat-bubble-wrap {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          width: 100%;
        }
        .pm-chat-bubble-wrap.user {
          justify-content: flex-end;
        }
        .pm-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pm-msg-avatar.bot {
          background: #7c5cfc;
          color: #fff;
        }
        .pm-msg-avatar.user {
          background: #2a2a3e;
          color: #aaa;
        }
        .pm-msg-bubble {
          max-width: 82%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .pm-msg-bubble.bot {
          background: #14141e;
          border: 1px solid #222234;
          color: #e2e8f0;
          border-top-left-radius: 4px;
        }
        .pm-msg-bubble.user {
          background: #7c5cfc;
          color: #fff;
          border-top-right-radius: 4px;
        }
        .pm-msg-time {
          font-size: 10px;
          color: #666;
          margin-top: 4px;
          text-align: right;
        }

        /* Order Info Card in Chat */
        .pm-order-preview-card {
          margin-top: 10px;
          background: #07070d;
          border: 1px solid #28283c;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pm-order-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .pm-order-card-num {
          font-weight: 700;
          color: #fff;
        }
        .pm-order-status-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        /* Support Contact Card in Chat */
        .pm-contact-preview-card {
          margin-top: 10px;
          background: #080811;
          border: 1px solid rgba(124, 92, 252, 0.3);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pm-contact-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c4b5fd;
          font-size: 12.5px;
          font-weight: 600;
        }
        .pm-contact-link {
          color: #a78bfa;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
        .pm-contact-link:hover {
          text-decoration: underline;
        }

        /* Preset Options List */
        .pm-options-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .pm-option-btn {
          background: #11111a;
          border: 1px solid #1f1f2e;
          color: #d1d5db;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          transition: all 0.15s ease;
        }
        .pm-option-btn:hover {
          background: rgba(124, 92, 252, 0.12);
          border-color: #7c5cfc;
          color: #fff;
          transform: translateX(2px);
        }
        .pm-opt-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Typing Dots Animation */
        .pm-typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #14141e;
          border: 1px solid #222234;
          border-radius: 12px;
          width: fit-content;
        }
        .pm-typing-dot {
          width: 5px;
          height: 5px;
          background: #7c5cfc;
          border-radius: 50%;
          animation: pmBlink 1.4s infinite both;
        }
        .pm-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .pm-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pmBlink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }

        /* Chat Input Footer */
        .pm-chat-footer {
          padding: 10px 12px;
          background: #0e0e16;
          border-top: 1px solid #1e1e2e;
        }
        .pm-chat-input-form {
          display: flex;
          align-items: center;
          background: #060609;
          border: 1px solid #26263a;
          border-radius: 12px;
          padding: 4px 6px 4px 12px;
          gap: 6px;
        }
        .pm-chat-input-form:focus-within {
          border-color: #7c5cfc;
          box-shadow: 0 0 0 2px rgba(124, 92, 252, 0.2);
        }
        .pm-chat-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          outline: none;
        }
        .pm-chat-send-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #7c5cfc;
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pm-chat-send-btn:hover {
          background: #6a49f5;
        }
        .pm-chat-send-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .pm-back-menu-btn {
          background: none;
          border: none;
          color: #a78bfa;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .pm-back-menu-btn:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .pm-chatbot-trigger {
            bottom: 16px;
            left: 16px;
            height: 38px;
            padding: 3px 12px 3px 4px;
          }
          .pm-bot-inner-circle {
            width: 28px;
            height: 28px;
          }
          .pm-trigger-dynamic-text {
            font-size: 12px;
          }
          .pm-chatbot-window {
            bottom: 68px;
            left: 12px;
            right: 12px;
            width: auto;
            max-width: none;
            height: 480px;
          }
        }
      `}</style>

      {/* Floating Trigger in Bottom-Left Corner */}
      <button
        type="button"
        className="pm-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle PrimeMarket Support Chatbot"
        title="Open Support Chatbot"
      >
        <div className="pm-bot-inner-circle">
          <BotIcon size={18} color="#ffffff" />
          <span className="pm-online-dot" />
        </div>
        <div className="pm-trigger-dynamic-text">
          <span>{triggerText || 'Hii, How can i help you'}</span>
        </div>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="pm-chatbot-window">
          {/* Header */}
          <div className="pm-chat-header">
            <div className="pm-chat-h-left">
              <div className="pm-bot-avatar-badge" style={{ width: 34, height: 34 }}>
                <BotIcon size={20} color="#fff" />
                <span className="pm-online-dot" />
              </div>
              <div>
                <div className="pm-chat-title">PrimeMarket Bot</div>
                <div className="pm-chat-sub">
                  <span className="pm-chat-sub-dot" />
                  Instant Support Online
                </div>
              </div>
            </div>
            <div className="pm-chat-h-actions">
              <button
                type="button"
                className="pm-chat-h-btn"
                onClick={handleRestart}
                title="Restart Conversation"
              >
                <RefreshIcon size={15} />
              </button>
              <button
                type="button"
                className="pm-chat-h-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="pm-chat-body">
            {/* Dynamic Greeting Typewriter Bubble */}
            {isTypingGreeting && (
              <div className="pm-chat-bubble-wrap bot">
                <div className="pm-msg-avatar bot">
                  <BotIcon size={16} color="#fff" />
                </div>
                <div className="pm-msg-bubble bot">
                  <div>
                    {greetingTyped}
                    <span className="pm-typing-cursor">|</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={m.id} className={`pm-chat-bubble-wrap ${isBot ? 'bot' : 'user'}`}>
                  {isBot && (
                    <div className="pm-msg-avatar bot">
                      <BotIcon size={16} color="#fff" />
                    </div>
                  )}
                  <div className={`pm-msg-bubble ${isBot ? 'bot' : 'user'}`}>
                    <div>{m.text}</div>

                    {/* Order Details Preview Card(s) - Displays all pending orders or single order */}
                    {((m.extraData?.orders && m.extraData.orders.length > 0) || m.extraData?.order) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%' }}>
                        {(m.extraData.orders || [m.extraData.order]).map((ord, idx) => {
                          const st = STATUS_COLORS[ord.status] || STATUS_COLORS.pending;
                          const itemNames = ord.products || ord.items?.map((i) => i.product_name || i.name).filter(Boolean) || [];
                          return (
                            <div key={ord.order_number || ord.id || idx} className="pm-order-preview-card">
                              <div className="pm-order-card-row">
                                <span className="pm-order-card-num">Order #{ord.order_number}</span>
                                <span
                                  className="pm-order-status-badge"
                                  style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}
                                >
                                  {ord.status}
                                </span>
                              </div>
                              {itemNames.length > 0 && (
                                <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.4, marginTop: 2 }}>
                                  <span style={{ color: '#777' }}>Items: </span>
                                  {itemNames.join(', ')}
                                </div>
                              )}
                              {ord.total_amount && (
                                <div className="pm-order-card-row" style={{ marginTop: 2 }}>
                                  <span style={{ fontSize: 11, color: '#777' }}>Amount</span>
                                  <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>
                                    ₹{parseFloat(ord.total_amount).toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="pm-order-card-row" style={{ marginTop: 2 }}>
                                <span style={{ fontSize: 11, color: '#777' }}>Guaranteed Fulfillment</span>
                                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Within 24 Hours</span>
                              </div>
                              <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                                <Link
                                  to="/orders"
                                  onClick={() => setIsOpen(false)}
                                  style={{ fontSize: 11, color: '#a78bfa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                                >
                                  View in My Orders <ArrowRightIcon size={11} color="#a78bfa" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Contact Support Preview Card */}
                    {m.extraData?.showContact && (
                      <div className="pm-contact-preview-card">
                        <div className="pm-contact-row">
                          <MailIcon size={15} />
                          <span>primesmarket.in@gmail.com</span>
                        </div>
                        <a
                          href="mailto:primesmarket.in@gmail.com?subject=Order Support Query"
                          className="pm-contact-link"
                        >
                          Send Email Inquiry
                          <ArrowRightIcon size={12} />
                        </a>
                      </div>
                    )}

                    {m.timestamp && <div className="pm-msg-time">{m.timestamp}</div>}
                  </div>
                  {!isBot && (
                    <div className="pm-msg-avatar user">
                      <UserIcon size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="pm-chat-bubble-wrap bot">
                <div className="pm-msg-avatar bot">
                  <BotIcon size={16} color="#fff" />
                </div>
                <div className="pm-typing-indicator">
                  <span className="pm-typing-dot" />
                  <span className="pm-typing-dot" />
                  <span className="pm-typing-dot" />
                </div>
              </div>
            )}

            {/* Quick Action Options */}
            {showOptions && !isTyping && (
              <div className="pm-options-wrap">
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Select an option:
                </div>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('not_received')}
                >
                  <span className="pm-opt-left">
                    <ClockIcon size={15} color="#f5a623" />
                    <span>I haven't received my order yet</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('refund_24h')}
                >
                  <span className="pm-opt-left">
                    <RefundIcon size={15} color="#60a5fa" />
                    <span>When I get my refund, order already have 24 hrs time?</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('last_order_status')}
                >
                  <span className="pm-opt-left">
                    <PackageIcon size={15} color="#a78bfa" />
                    <span>Tell me the status of the last order</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('track_order_number')}
                >
                  <span className="pm-opt-left">
                    <SearchIcon size={15} color="#34d399" />
                    <span>Track by Order Number</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('portal_refund_issue')}
                >
                  <span className="pm-opt-left">
                    <QuestionIcon size={15} color="#f87171" />
                    <span>In portal it shows refunded, but in actual it is not?</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('how_credentials')}
                >
                  <span className="pm-opt-left">
                    <PackageIcon size={15} color="#c084fc" />
                    <span>How do I access my delivered product?</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>

                <button
                  type="button"
                  className="pm-option-btn"
                  onClick={() => handleSelectOption('contact_support')}
                >
                  <span className="pm-opt-left">
                    <MailIcon size={15} color="#cbd5e1" />
                    <span>Contact Support Team</span>
                  </span>
                  <ArrowRightIcon size={13} color="#888" />
                </button>
              </div>
            )}

            {!showOptions && !isTyping && (
              <div>
                <button
                  type="button"
                  className="pm-back-menu-btn"
                  onClick={() => setShowOptions(true)}
                >
                  <RefreshIcon size={12} />
                  <span>Show menu options</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer Form */}
          <div className="pm-chat-footer">
            <form onSubmit={handleSendMessage} className="pm-chat-input-form">
              <input
                type="text"
                placeholder="Type order number or ask a question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="pm-chat-input"
              />
              <button
                type="submit"
                className="pm-chat-send-btn"
                disabled={!inputText.trim()}
                title="Send"
              >
                <SendIcon size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
