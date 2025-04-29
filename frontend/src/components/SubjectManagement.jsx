import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Space, Tag, Select } from 'antd';
import { toast } from 'react-toastify';

const { Option } = Select;

const SubjectManagement = ({ departmentId }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, [departmentId]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/subjects?department_id=${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sujets');
      }
      
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subjectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/subjects/${subjectId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour avec succès');
      fetchSubjects();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Étudiant',
      dataIndex: ['student', 'nom'],
      key: 'student_name',
      render: (text, record) => `${record.student?.nom} ${record.student?.prenom}`
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Technologies',
      dataIndex: 'technologies',
      key: 'technologies',
      render: (technologies) => (
        <div style={{ maxWidth: 200, whiteSpace: 'normal' }}>
          {technologies.split(',').map((tech, index) => (
            <Tag key={index} color="blue" style={{ margin: '2px' }}>
              {tech.trim()}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status.toUpperCase();
        switch (status) {
          case 'approved':
            color = 'success';
            text = 'APPROUVÉ';
            break;
          case 'rejected':
            color = 'error';
            text = 'REJETÉ';
            break;
          case 'pending':
            color = 'processing';
            text = 'EN ATTENTE';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => {
            setSelectedSubject(record);
            setShowModal(true);
          }}>
            Gérer
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="subject-management">
      <div style={{ marginBottom: 16 }}>
        <h2 className="text-xl font-semibold">Gestion des Sujets de Stage</h2>
      </div>

      <Table
        columns={columns}
        dataSource={subjects}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} sujets`
        }}
      />

      <Modal
        title="Gérer le Sujet"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setSelectedSubject(null);
        }}
        footer={null}
        width={800}
      >
        {selectedSubject && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Étudiant</h3>
              <p>{selectedSubject.student?.nom} {selectedSubject.student?.prenom}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Titre</h3>
              <p>{selectedSubject.title}</p>
            </div>

            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{selectedSubject.description}</p>
            </div>

            <div>
              <h3 className="font-semibold">Technologies</h3>
              <div>
                {selectedSubject.technologies.split(',').map((tech, index) => (
                  <Tag key={index} color="blue" style={{ margin: '2px' }}>
                    {tech.trim()}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Motivations</h3>
              <p>{selectedSubject.motivations}</p>
            </div>

            <div>
              <h3 className="font-semibold">Changer le statut</h3>
              <Space>
                <Select
                  defaultValue={selectedSubject.status}
                  style={{ width: 200 }}
                  onChange={(value) => handleStatusChange(selectedSubject.id, value)}
                >
                  <Option value="pending">En attente</Option>
                  <Option value="approved">Approuver</Option>
                  <Option value="rejected">Rejeter</Option>
                </Select>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubjectManagement;
