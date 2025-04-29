import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined,
  AppstoreOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfessorList from './ProfessorList';
import StudentList from './StudentList';
import SubjectList from './SubjectList';
import ProfessorRoles from './ProfessorRoles';
import axios from '../api/axios';
import Navbar from './Navbar';

const { Content, Sider } = Layout;

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('professeurs');

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/departments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDepartment(response.data);
      } catch (error) {
        console.error('Erreur:', error);
        if (error.response?.status === 404) {
          toast.error('Département non trouvé');
          navigate('/admin/home');
        } else {
          setError(error.response?.data?.message || 'Erreur lors de la récupération du département');
          toast.error(error.response?.data?.message || 'Erreur lors de la récupération du département');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id, navigate]);

  const renderContent = () => {
    switch (activeSection) {
      case 'professeurs':
        return <ProfessorList departmentId={id} />;
      case 'etudiants':
        return <StudentList departmentId={id} />;
      case 'sujets':
        return <SubjectList departmentId={id} />;
      case 'roles':
        return <ProfessorRoles departmentId={id} />;
      default:
        return <ProfessorList departmentId={id} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Sider
          style={{
            background: '#fff',
            marginTop: '64px',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            overflowY: 'auto'
          }}
          width={200}
        >
          <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <div
                  onClick={() => setActiveSection('professeurs')}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    backgroundColor: activeSection === 'professeurs' ? '#e6f7ff' : 'transparent',
                    color: activeSection === 'professeurs' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <UserOutlined />
                  Professeurs
                </div>
              </li>
              <li>
                <div
                  onClick={() => setActiveSection('etudiants')}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    backgroundColor: activeSection === 'etudiants' ? '#e6f7ff' : 'transparent',
                    color: activeSection === 'etudiants' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <TeamOutlined />
                  Étudiants
                </div>
              </li>
              <li>
                <div
                  onClick={() => setActiveSection('sujets')}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    backgroundColor: activeSection === 'sujets' ? '#e6f7ff' : 'transparent',
                    color: activeSection === 'sujets' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <BookOutlined />
                  Sujets
                </div>
              </li>
              <li>
                <div
                  onClick={() => setActiveSection('roles')}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    backgroundColor: activeSection === 'roles' ? '#e6f7ff' : 'transparent',
                    color: activeSection === 'roles' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <SettingOutlined />
                  Rôles
                </div>
              </li>
            </ul>
          </nav>
        </Sider>
        <Layout style={{ marginLeft: 200, marginTop: 64 }}>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{department?.name}</h2>
                  <p style={{ margin: '4px 0 0', color: '#666' }}>{department?.code} - {department?.description}</p>
                </div>
              </div>
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DepartmentDashboard;
