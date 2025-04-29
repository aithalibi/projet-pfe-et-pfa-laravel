import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Select, Space, message } from 'antd';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const { Option } = Select;

const ProfessorStudents = ({ professor }) => {
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchAvailableStudents();
  }, [professor.id]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professors/${professor.id}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des étudiants');
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/students/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des étudiants disponibles');
      }

      const data = await response.json();
      setAvailableStudents(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      toast.error('Veuillez sélectionner un étudiant');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professors/${professor.id}/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudent
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'étudiant');
      }

      toast.success('Étudiant ajouté avec succès');
      setModalVisible(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchAvailableStudents();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/professors/${professor.id}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'étudiant');
      }

      toast.success('Étudiant retiré avec succès');
      fetchStudents();
      fetchAvailableStudents();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom'
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Sujet',
      key: 'subject',
      render: (_, record) => record.subject?.title || 'Pas de sujet'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveStudent(record.id)}
        >
          Retirer
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Ajouter un étudiant
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Ajouter un étudiant"
        open={modalVisible}
        onOk={handleAddStudent}
        onCancel={() => {
          setModalVisible(false);
          setSelectedStudent(null);
        }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Sélectionner un étudiant"
          value={selectedStudent}
          onChange={setSelectedStudent}
        >
          {availableStudents.map(student => (
            <Option key={student.id} value={student.id}>
              {student.nom} {student.prenom} - {student.email}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ProfessorStudents;
