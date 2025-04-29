import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag } from 'antd';
import { toast } from 'react-toastify';
import axios from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const SubjectList = ({ departmentId }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (departmentId) {
      fetchSubjects();
      fetchStudents();
    }
  }, [departmentId]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`/api/subjects?department_id=${departmentId}`);
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la récupération des sujets');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/students?department_id=${departmentId}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la récupération des étudiants');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'put' : 'post';
      
      // Ne prendre que les champs nécessaires
      const data = {
        title: values.title,
        description: values.description,
        technologies: values.technologies,
        student_id: values.student_id,
        department_id: departmentId
      };

      if (!editingSubject) {
        data.status = 'pending';
      }

      const response = await axios[method](url, data);
      
      if (response.data.subject) {
        toast.success(response.data.message);
        setShowModal(false);
        form.resetFields();
        setEditingSubject(null);
        fetchSubjects();
      } else {
        toast.error('Erreur: Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la création/modification du sujet');
      }
    }
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      const response = await axios.put(`/api/subjects/${record.id}/status`, {
        status: newStatus,
        department_id: departmentId
      });
      
      if (response.data.subject) {
        toast.success(response.data.message);
        fetchSubjects();
      } else {
        toast.error('Erreur: Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
      }
    }
  };

  const getStatusTag = (status) => {
    const statusColors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };

    const statusLabels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    };

    return (
      <Tag color={statusColors[status]}>
        {statusLabels[status]}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Technologies',
      dataIndex: 'technologies',
      key: 'technologies',
      ellipsis: true,
    },
    {
      title: 'Étudiant',
      key: 'student',
      render: (_, record) => record.student ? `${record.student.nom} ${record.student.prenom}` : '-'
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Space>
          {getStatusTag(record.status)}
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record, value)}
          >
            <Option value="pending">En attente</Option>
            <Option value="approved">Approuver</Option>
            <Option value="rejected">Rejeter</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => {
            setEditingSubject(record);
            form.setFieldsValue({
              title: record.title,
              description: record.description,
              technologies: record.technologies,
              student_id: record.student?.id
            });
            setShowModal(true);
          }}>
            Modifier
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/subjects/${id}`);
      if (response.data.message) {
        toast.success(response.data.message);
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du sujet');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => {
          setEditingSubject(null);
          form.resetFields();
          setShowModal(true);
        }}>
          Ajouter un sujet
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={subjects}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title={editingSubject ? "Modifier le sujet" : "Ajouter un sujet"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
          setEditingSubject(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: '',
            description: '',
            technologies: '',
            student_id: null
          }}
        >
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Le titre est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'La description est requise' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="technologies"
            label="Technologies"
            rules={[{ required: true, message: 'Les technologies sont requises' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="student_id"
            label="Étudiant"
          >
            <Select
              allowClear
              placeholder="Sélectionner un étudiant"
              showSearch
              optionFilterProp="children"
            >
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.nom} {student.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSubject ? 'Modifier' : 'Ajouter'}
              </Button>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
                setEditingSubject(null);
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

export default SubjectList;
