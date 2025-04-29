import React from 'react';
import { Layout, Button, Input } from 'antd';
import { SearchOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Navbar.css';

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Supprimer le token du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion
      navigate('/login');
      
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const onSearch = (value) => {
    console.log('Recherche:', value);
    // Implémentez ici la logique de recherche
  };

  return (
    <Header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#fff',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'fixed',
      zIndex: 1,
      width: '100%',
      height: '64px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '24px'
      }}>
        <img 
          src="/logo.png"
          alt="EMSI Logo" 
          style={{ 
            height: '50px'
          }} 
        />
        <Search
          placeholder="Rechercher..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          style={{ width: 400 }}
          className="custom-search"
        />
      </div>
      <Button 
        onClick={handleLogout} 
        type="primary" 
        danger
        icon={<LogoutOutlined />}
      >
        Se déconnecter
      </Button>
    </Header>
  );
};

export default Navbar;
