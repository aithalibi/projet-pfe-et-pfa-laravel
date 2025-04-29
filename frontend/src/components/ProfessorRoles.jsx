import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message } from 'antd';
import axios from '../api/axios';

const { Option } = Select;

const ProfessorRoles = ({ departmentId }) => {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (departmentId) {
      fetchData();
    }
  }, [departmentId]);

  const fetchData = async () => {
    try {
      const [subjectsRes, professorsRes] = await Promise.all([
        axios.get(`/api/subjects?department_id=${departmentId}`),
        axios.get(`/api/professors?department_id=${departmentId}`)
      ]);

      setSubjects(subjectsRes.data);
      setProfessors(professorsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      message.error('Erreur lors de la récupération des données');
      setLoading(false);
    }
  };

  const handleAssignRoles = (subject) => {
    setSelectedSubject(subject);
    
    const initialValues = {
      encadrant_id: subject.roles?.encadrant?.id || null,
      president_id: subject.roles?.president?.id || null,
      rapporteur_id: subject.roles?.rapporteur?.id || null
    };
    
    form.setFieldsValue(initialValues);
    setShowModal(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (!values.encadrant_id) {
        message.error('L\'encadrant est obligatoire');
        return;
      }

      const roles = [];
      if (values.encadrant_id) roles.push({ professor_id: values.encadrant_id, role_type: 'encadrant' });
      if (values.president_id) roles.push({ professor_id: values.president_id, role_type: 'president' });
      if (values.rapporteur_id) roles.push({ professor_id: values.rapporteur_id, role_type: 'rapporteur' });

      await axios.post(`/api/subjects/${selectedSubject.id}/roles`, { roles });

      message.success('Rôles attribués avec succès');
      setShowModal(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      message.error(error.response?.data?.message || 'Erreur lors de l\'attribution des rôles');
    }
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
      title: 'Encadrant',
      key: 'encadrant',
      render: (_, record) => record.roles?.encadrant ? `${record.roles.encadrant.nom} ${record.roles.encadrant.prenom}` : '-'
    },
    {
      title: 'Président',
      key: 'president',
      render: (_, record) => record.roles?.president ? `${record.roles.president.nom} ${record.roles.president.prenom}` : '-'
    },
    {
      title: 'Rapporteur',
      key: 'rapporteur',
      render: (_, record) => record.roles?.rapporteur ? `${record.roles.rapporteur.nom} ${record.roles.rapporteur.prenom}` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleAssignRoles(record)}>
          Gérer les rôles
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Table
        loading={loading}
        dataSource={subjects}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title="Gestion des rôles"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16, padding: 16, background: '#f0f2f5', borderRadius: 4 }}>
          <h4 style={{ marginBottom: 8 }}>Règles d'attribution des rôles :</h4>
          <ul style={{ paddingLeft: 20 }}>
            <li>Un professeur peut avoir jusqu'à deux rôles sur le même sujet</li>
            <li>L'encadrant est obligatoire</li>
            <li>Les autres rôles (rapporteur, président) sont optionnels</li>
          </ul>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="encadrant_id"
            label="Encadrant"
            rules={[{ required: true, message: 'Veuillez sélectionner un encadrant' }]}
          >
            <Select placeholder="Sélectionner un encadrant">
              {professors.map(prof => (
                <Option key={prof.id} value={prof.id}>
                  {prof.nom} {prof.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="president_id"
            label="Président"
          >
            <Select placeholder="Sélectionner un président" allowClear>
              {professors.map(prof => (
                <Option key={prof.id} value={prof.id}>
                  {prof.nom} {prof.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rapporteur_id"
            label="Rapporteur"
          >
            <Select placeholder="Sélectionner un rapporteur" allowClear>
              {professors.map(prof => (
                <Option key={prof.id} value={prof.id}>
                  {prof.nom} {prof.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => {
                setShowModal(false);
                form.resetFields();
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfessorRoles;
