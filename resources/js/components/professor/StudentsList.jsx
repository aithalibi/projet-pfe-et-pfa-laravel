import React, { useState, useEffect } from 'react';

const StudentsList = ({ professorId, onSelectStudent, selectedStudent }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        if (professorId) {
            fetchStudents();
            const interval = setInterval(fetchUnreadCounts, 10000); // Actualiser toutes les 10 secondes
            return () => clearInterval(interval);
        }
    }, [professorId]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/professors/${professorId}/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des étudiants');
            }

            const data = await response.json();
            setStudents(data);
            setLoading(false);
            fetchUnreadCounts();
        } catch (error) {
            setError('Erreur lors de la récupération des étudiants');
            setLoading(false);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const counts = {};
            for (const student of students) {
                const response = await fetch(`/api/chat/unread/${professorId}/${student.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                counts[student.id] = data.unread_count;
            }
            setUnreadCounts(counts);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages non lus:', error);
        }
    };

    if (loading) return <div className="text-center py-4">Chargement...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Mes Étudiants</h2>
            </div>
            <div className="divide-y">
                {students.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Aucun étudiant assigné
                    </div>
                ) : (
                    students.map((student) => (
                        <div
                            key={student.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                                selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => onSelectStudent(student)}
                        >
                            <div>
                                <h3 className="font-medium">{student.name}</h3>
                                <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            {unreadCounts[student.id] > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                    {unreadCounts[student.id]}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentsList; 