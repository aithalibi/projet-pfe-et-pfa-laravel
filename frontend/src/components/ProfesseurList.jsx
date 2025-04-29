import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Popconfirm
} from 'antd';

const { Option } = Select;

const ProfesseurList = ({ departmentId }) => {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfesseur, setEditingProfesseur] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfesseurs();
  }, [departmentId]);

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom)
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a, b) => a.prenom.localeCompare(b.prenom)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone'
    },
    {
      title: 'Spécialité',
      dataIndex: 'specialite',
      key: 'specialite'
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <span style={{ 
          color: statut === 'permanent' ? 'green' : 'orange',
          textTransform: 'capitalize'
        }}>
          {statut}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce professeur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Récupérer la liste des professeurs
  const fetchProfesseurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professors?department_id=${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des professeurs');
      }
      
      const data = await response.json();
      setProfesseurs(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingProfesseur 
        ? `http://localhost:8001/api/professors/${editingProfesseur.id}`
        : 'http://localhost:8001/api/professors';
      
      const method = editingProfesseur ? 'PUT' : 'POST';
      
      const dataToSend = {
        ...values,
        department_id: departmentId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'enregistrement');
      }

      toast.success(editingProfesseur ? 'Professeur modifié avec succès' : 'Professeur ajouté avec succès');
      setShowModal(false);
      form.resetFields();
      setEditingProfesseur(null);
      fetchProfesseurs();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  // Modifier un professeur
  const handleEdit = (professeur) => {
    setEditingProfesseur(professeur);
    form.setFieldsValue(professeur);
    setShowModal(true);
  };

  // Supprimer un professeur
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }

      toast.success('Professeur supprimé avec succès');
      fetchProfesseurs();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la suppression');
    }
  };

  return (
    <div className="professor-list">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Liste des Professeurs</h2>
        <Button type="primary" onClick={() => {
          setEditingProfesseur(null);
          form.resetFields();
          setShowModal(true);
        }}>
          Ajouter un Professeur
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={professeurs}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} professeurs`
        }}
      />

      <Modal
        title={editingProfesseur ? 'Modifier le Professeur' : 'Ajouter un Professeur'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
          setEditingProfesseur(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            statut: 'permanent'
          }}
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="prenom"
            label="Prénom"
            rules={[{ required: true, message: 'Le prénom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'L\'email est requis' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="telephone"
            label="Téléphone"
            rules={[{ required: true, message: 'Le téléphone est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specialite"
            label="Spécialité"
            rules={[{ required: true, message: 'La spécialité est requise' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="statut"
            label="Statut"
            rules={[{ required: true, message: 'Le statut est requis' }]}
          >
            <Select>
              <Option value="permanent">Permanent</Option>
              <Option value="vacataire">Vacataire</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
                setEditingProfesseur(null);
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProfesseur ? 'Modifier' : 'Ajouter'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfesseurList;
