import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import axios from '../api/axios';

const ProfessorList = ({ departmentId }) => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfessors();
  }, [departmentId]);

  const fetchProfessors = async () => {
    try {
      const response = await axios.get(`/api/professors?department_id=${departmentId}`);
      setProfessors(response.data);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        Object.values(validationErrors).forEach(errors => {
          errors.forEach(error => toast.error(error));
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingProfessor
        ? `/api/professors/${editingProfessor.id}`
        : '/api/professors';
      
      const method = editingProfessor ? 'put' : 'post';
      
      const response = await axios[method](url, {
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        telephone: values.telephone,
        specialite: values.specialite,
        type: values.type,
        department_id: departmentId
      });

      await fetchProfessors();
      setModalVisible(false);
      form.resetFields();
      setEditingProfessor(null);
      toast.success(editingProfessor ? 'Professeur modifié avec succès' : 'Professeur ajouté avec succès');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        Object.values(validationErrors).forEach(errors => {
          errors.forEach(error => toast.error(error));
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/professors/${id}`);

      await fetchProfessors();
      toast.success('Professeur supprimé avec succès');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        Object.values(validationErrors).forEach(errors => {
          errors.forEach(error => toast.error(error));
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProfessor(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Modifier
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProfessor(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Ajouter un professeur
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={professors}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingProfessor ? "Modifier le professeur" : "Ajouter un professeur"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProfessor(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingProfessor}
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
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select>
              <Select.Option value="vacataire">Vacataire</Select.Option>
              <Select.Option value="permanent">Permanent</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingProfessor(null);
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProfessor ? 'Modifier' : 'Ajouter'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfessorList;
