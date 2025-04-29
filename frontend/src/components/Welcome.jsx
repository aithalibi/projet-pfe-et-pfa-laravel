import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="EMSI Logo" 
              className="h-16 object-contain"
              style={{ minWidth: '120px' }} 
            />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            CONNEXION
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 py-16">
          {/* Left Side - Text Content */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Bienvenue sur la plateforme
              <span className="text-green-600 block">EMSI PFE ET PFA</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Gérez vos projets de fin d'études efficacement avec notre plateforme dédiée.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                Commencer
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Gestion des PFE',
                description: 'Suivez et gérez vos projets de fin d\'études en temps réel.'
              },
              {
                title: 'Stages',
                description: 'Trouvez et gérez les stages pour les étudiants.'
              },
              {
                title: 'Encadrement',
                description: 'Communication facilitée entre étudiants et encadrants.'
              },
              {
                title: 'Suivi',
                description: 'Tableau de bord pour suivre l\'avancement des projets.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            {new Date().getFullYear()} EMSI. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
