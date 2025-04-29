import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message as toast } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../api/axios';

const { Option } = Select;

const StudentList = ({ departmentId }) => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/students${departmentId ? `?department_id=${departmentId}` : ''}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la récupération des étudiants');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [departmentId]);

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
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
      title: 'Type de Stage',
      dataIndex: 'type_stage',
      key: 'type_stage',
      filters: [
        { text: 'PFE', value: 'PFE' },
        { text: 'PPFA', value: 'PPFA' },
      ],
      onFilter: (value, record) => record.type_stage === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStudent(record);
              form.setFieldsValue(record);
              setShowModal(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'put' : 'post';
      
      const response = await axios[method](url, {
        ...values,
        department_id: departmentId
      });

      toast.success(editingStudent ? 'Étudiant modifié avec succès' : 'Étudiant ajouté avec succès');
      setShowModal(false);
      form.resetFields();
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Une erreur est survenue lors de l\'enregistrement';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`);
      toast.success('Étudiant supprimé avec succès');
      fetchStudents();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'étudiant');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Liste des étudiants</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditingStudent(null);
            form.resetFields();
            setShowModal(true);
          }}
        >
          Ajouter un étudiant
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} étudiants`
        }}
      />

      <Modal
        title={editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
          setEditingStudent(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingStudent || {}}
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
            name="type_stage"
            label="Type de Stage"
            rules={[{ required: true, message: 'Le type de stage est requis' }]}
          >
            <Select>
              <Option value="PFE">PFE</Option>
              <Option value="PPFA">PPFA</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingStudent ? 'Modifier' : 'Ajouter'}
              </Button>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
                setEditingStudent(null);
              }}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;
