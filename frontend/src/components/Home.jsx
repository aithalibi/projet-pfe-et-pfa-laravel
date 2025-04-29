import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Table, Statistic, Modal, message, Result } from 'antd';
import { PlusOutlined, TeamOutlined, BookOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AddDepartmentModal from './AddDepartmentModal';

const { Header, Content } = Layout;

const Home = () => {
  const [stats, setStats] = useState({
    departments: [],
    totalProfessors: 0,
    totalStudents: 0,
    totalSubjects: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Veuillez vous connecter');
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      console.log('Token:', token); // Pour le débogage

      const response = await axios.get('/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response); // Pour le débogage

      if (response.data) {
        if (response.data.status === 'error') {
          throw new Error(response.data.message);
        }
        
        setStats(prevStats => ({
          ...prevStats,
          departments: response.data.data || []
        }));
      }
    } catch (err) {
      console.error('Erreur:', err);
      
      if (err.response?.status === 401) {
        message.error('Session expirée, veuillez vous reconnecter');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
        message.error(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nom du département',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Nombre de professeurs',
      dataIndex: 'professors_count',
      key: 'professors_count',
      width: 180,
      sorter: (a, b) => (a.professors_count || 0) - (b.professors_count || 0),
      render: (text) => text || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          onClick={() => navigate(`/admin/departments/${record.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <Result
        status="error"
        title="Erreur de chargement"
        subTitle={error}
        extra={[
          <Button 
            type="primary" 
            key="retry" 
            onClick={fetchData}
            icon={<ReloadOutlined />}
          >
            Réessayer
          </Button>
        ]}
      />
    );
  }

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Header className="bg-white shadow-sm flex items-center justify-between px-8" style={{ height: '64px', lineHeight: '64px', padding: '0 24px' }}>
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="EMSI Logo" 
            className="h-12"
            style={{ marginRight: '24px' }}
          />
          <h1 className="text-2xl font-semibold text-gray-800 m-0">
            Tableau de bord administrateur
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={loading}
          >
            Actualiser
          </Button>
          <Button 
            type="primary"
            danger
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
          >
            Déconnexion
          </Button>
        </div>
      </Header>

      <Content style={{ height: 'calc(100vh - 64px)', overflow: 'auto', padding: '24px' }}>
        {/* Statistiques */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={<span className="text-lg">Départements</span>}
                value={stats.departments.length}
                prefix={<TeamOutlined className="text-green-600" />}
                valueStyle={{ color: '#3f8600', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={<span className="text-lg">Professeurs</span>}
                value={stats.totalProfessors}
                prefix={<UserOutlined className="text-red-600" />}
                valueStyle={{ color: '#cf1322', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={<span className="text-lg">Étudiants</span>}
                value={stats.totalStudents}
                prefix={<TeamOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={<span className="text-lg">Matières</span>}
                value={stats.totalSubjects}
                prefix={<BookOutlined className="text-purple-600" />}
                valueStyle={{ color: '#722ed1', fontSize: '28px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Liste des départements */}
        <Card 
          title={<span className="text-xl">Départements</span>}
          extra={
            <div className="space-x-4">
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
              >
                Actualiser
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                size="large"
              >
                Ajouter un département
              </Button>
            </div>
          }
          className="shadow-md"
          style={{ marginBottom: '24px' }}
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={stats.departments}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} départements`
            }}
            className="custom-table"
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </Card>

        {/* Modal d'ajout de département */}
        <AddDepartmentModal
          visible={isModalOpen}
          onClose={(shouldRefresh) => {
            setIsModalOpen(false);
            if (shouldRefresh) {
              fetchData();
            }
          }}
        />
      </Content>
    </Layout>
  );
};

export default Home;
