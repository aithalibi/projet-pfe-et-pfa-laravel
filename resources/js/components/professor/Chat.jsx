import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ professorId, studentId, studentName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (professorId && studentId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Actualiser toutes les 5 secondes
            return () => clearInterval(interval);
        }
    }, [professorId, studentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chat/${professorId}/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des messages');
            }

            const data = await response.json();
            setMessages(data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    professor_id: professorId,
                    student_id: studentId,
                    message: newMessage,
                    sender_type: 'professor'
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            } else {
                throw new Error('Erreur lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    };

    if (loading) return <div className="text-center py-4">Chargement...</div>;

    return (
        <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chat avec {studentName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.sender_type === 'professor' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender_type === 'professor'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            <p>{message.message}</p>
                            <p className="text-xs mt-1 opacity-75">
                                {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat; 