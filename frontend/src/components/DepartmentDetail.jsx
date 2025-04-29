import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Tabs, Table, Button, Spin, message, Result } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../api/axios';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.get(`/api/departments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setDepartment(response.data.data);
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement du département');
      }
    } catch (err) {
      console.error('Erreur:', err);
      
      if (err.response?.status === 401) {
        message.error('Session expirée, veuillez vous reconnecter');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Département non trouvé');
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement du département');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Veuillez vous connecter');
      navigate('/login');
      return;
    }
    fetchDepartment();
  }, [id, navigate]);

  const professorColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a, b) => a.prenom.localeCompare(b.prenom),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Spécialité',
      dataIndex: 'specialite',
      key: 'specialite',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link"
          onClick={() => navigate(`/admin/professors/${record.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link"
          onClick={() => navigate(`/admin/subjects/${record.id}`)}
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
        title="Erreur"
        subTitle={error}
        extra={[
          <Button 
            key="back" 
            onClick={() => navigate('/admin/home')}
          >
            Retour à l'accueil
          </Button>,
          <Button 
            key="retry" 
            type="primary" 
            onClick={fetchDepartment}
            icon={<ReloadOutlined />}
          >
            Réessayer
          </Button>,
        ]}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Chargement du département..." />
      </div>
    );
  }

  if (!department) {
    return (
      <Result
        status="404"
        title="Département non trouvé"
        subTitle="Le département que vous recherchez n'existe pas ou a été supprimé."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/admin/home')}
          >
            Retour à l'accueil
          </Button>
        }
      />
    );
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm flex items-center justify-between px-8">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/home')}
            style={{ marginRight: '16px' }}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold m-0">
            Département : {department.name}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={fetchDepartment}
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

      <Content className="p-8">
        <Card className="mb-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Informations générales</h3>
              <p><strong>Nom :</strong> {department.name}</p>
              <p><strong>Code :</strong> {department.code}</p>
              <p><strong>Description :</strong> {department.description || 'Aucune description'}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Statistiques</h3>
              <p><strong>Nombre de professeurs :</strong> {department.professors_count || 0}</p>
              <p><strong>Nombre de matières :</strong> {department.subjects?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <Tabs defaultActiveKey="professors">
            <TabPane tab="Professeurs" key="professors">
              <div className="mb-4 flex justify-end">
                <Button
                  type="primary"
                  onClick={() => navigate(`/admin/departments/${id}/add-professor`)}
                >
                  Ajouter un professeur
                </Button>
              </div>
              <Table
                columns={professorColumns}
                dataSource={department.professors || []}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} professeurs`
                }}
              />
            </TabPane>
            <TabPane tab="Matières" key="subjects">
              <div className="mb-4 flex justify-end">
                <Button
                  type="primary"
                  onClick={() => navigate(`/admin/departments/${id}/add-subject`)}
                >
                  Ajouter une matière
                </Button>
              </div>
              <Table
                columns={subjectColumns}
                dataSource={department.subjects || []}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} matières`
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default DepartmentDetail;
