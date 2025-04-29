import React, { useState, useEffect } from 'react';
import StudentsList from './StudentsList';
import Chat from './Chat';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [professor, setProfessor] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Récupérer les informations du professeur connecté
        const fetchProfessorData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    }
                    throw new Error('Erreur lors de la récupération des données');
                }

                const data = await response.json();
                setProfessor(data.user);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                navigate('/login');
            }
        };

        fetchProfessorData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">
                                Tableau de bord - {professor?.name}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Liste des étudiants */}
                    <div className="col-span-1">
                        <StudentsList
                            professorId={professor?.id}
                            onSelectStudent={setSelectedStudent}
                            selectedStudent={selectedStudent}
                        />
                    </div>

                    {/* Chat */}
                    <div className="col-span-1 md:col-span-2">
                        {selectedStudent ? (
                            <Chat
                                professorId={professor?.id}
                                studentId={selectedStudent.id}
                                studentName={selectedStudent.name}
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                Sélectionnez un étudiant pour commencer la discussion
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 