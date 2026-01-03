import { useState } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Paperclip, CheckCheck } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './Messages.css';

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState(1);
    const [messageInput, setMessageInput] = useState('');

    const chats = [
        {
            id: 1,
            name: 'Sarah Wilson',
            avatar: 'https://via.placeholder.com/40?text=SW',
            lastMessage: 'Sure, I can send you the updated resume.',
            time: '10:30 AM',
            unread: 0,
            status: 'online',
            messages: [
                { id: 1, sender: 'them', text: 'Hi, I saw your job posting for the Senior React Developer role.', time: '10:00 AM' },
                { id: 2, sender: 'me', text: 'Hello Sarah! Yes, are you interested in applying?', time: '10:05 AM' },
                { id: 3, sender: 'them', text: 'Yes, absolutely. I have 5 years of experience with React.', time: '10:15 AM' },
                { id: 4, sender: 'me', text: 'That sounds great. Could you share your resume?', time: '10:20 AM' },
                { id: 5, sender: 'them', text: 'Sure, I can send you the updated resume.', time: '10:30 AM' }
            ]
        },
        {
            id: 2,
            name: 'TechCorp Recruiter',
            avatar: 'https://via.placeholder.com/40?text=TR',
            lastMessage: 'When are you available for an interview?',
            time: 'Yesterday',
            unread: 2,
            status: 'offline',
            messages: [
                { id: 1, sender: 'them', text: 'Hello, we reviewed your profile and were impressed.', time: 'Yesterday' },
                { id: 2, sender: 'them', text: 'When are you available for an interview?', time: 'Yesterday' }
            ]
        },
        {
            id: 3,
            name: 'John Doe',
            avatar: 'https://via.placeholder.com/40?text=JD',
            lastMessage: 'Thanks for the connection!',
            time: '2 days ago',
            unread: 0,
            status: 'online',
            messages: [
                { id: 1, sender: 'me', text: 'Hi John, thanks for reaching out.', time: '2 days ago' },
                { id: 2, sender: 'them', text: 'Thanks for the connection!', time: '2 days ago' }
            ]
        }
    ];

    const currentChat = chats.find(c => c.id === selectedChat);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        // In a real app, this would send to backend
        // For now, we just update local state (which won't persist because chats is static const here,
        // but React would re-render if I made chats stateful. For simple UI demo, I'll just clear input)
        setMessageInput('');
    };

    return (
        <DashboardLayout>
            <div className="messages-container">
                {/* Chat Sidebar */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h2>Messages</h2>
                        <button className="icon-btn"><MoreVertical size={20} /></button>
                    </div>
                    <div className="chat-search">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Search messages..." />
                    </div>
                    <div className="conversations-list">
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`conversation-item ${selectedChat === chat.id ? 'active' : ''} ${chat.unread > 0 ? 'unread' : ''}`}
                                onClick={() => setSelectedChat(chat.id)}
                            >
                                <div className="avatar-container">
                                    <img src={chat.avatar} alt={chat.name} className="avatar" />
                                    <span className={`status-indicator ${chat.status}`}></span>
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-top">
                                        <span className="conversation-name">{chat.name}</span>
                                        <span className="conversation-time">{chat.time}</span>
                                    </div>
                                    <div className="conversation-bottom">
                                        <p className="last-message">{chat.lastMessage}</p>
                                        {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Main Area */}
                <div className="chat-main">
                    {currentChat ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <img src={currentChat.avatar} alt={currentChat.name} className="avatar" />
                                    <div>
                                        <h3>{currentChat.name}</h3>
                                        <span className="chat-status">{currentChat.status === 'online' ? 'Online' : 'Offline'}</span>
                                    </div>
                                </div>
                                <div className="chat-header-actions">
                                    <button className="icon-btn"><Phone size={20} /></button>
                                    <button className="icon-btn"><Video size={20} /></button>
                                    <button className="icon-btn"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            <div className="messages-list">
                                {currentChat.messages.map(msg => (
                                    <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                        <div className="message-content">
                                            <p>{msg.text}</p>
                                            <div className="message-meta">
                                                <span className="message-time">{msg.time}</span>
                                                {msg.sender === 'me' && <CheckCheck size={14} className="read-receipt" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="message-input-area">
                                <button className="icon-btn"><Paperclip size={20} /></button>
                                <form onSubmit={handleSendMessage} className="message-form">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <button type="submit" className="send-btn">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Messages;
