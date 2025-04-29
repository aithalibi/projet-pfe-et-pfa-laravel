import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from '../api/axios';

const AddDepartmentModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Récupérer le token CSRF
      await axios.get('/sanctum/csrf-cookie');
      
      const response = await axios.post('/api/departments', {
        name: values.name,
        code: values.code.toUpperCase(),
        description: values.description
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.data) {
        message.success('Département ajouté avec succès');
        form.resetFields();
        onClose(true); // true indique qu'il faut rafraîchir les données
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.errors) {
        // Afficher les erreurs de validation
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(errors[key][0]);
        });
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Une erreur est survenue lors de l\'ajout du département');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Ajouter un département"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Nom du département"
          rules={[
            { required: true, message: 'Le nom du département est requis' },
            { min: 3, message: 'Le nom doit contenir au moins 3 caractères' }
          ]}
        >
          <Input placeholder="Ex: Informatique" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Code du département"
          rules={[
            { required: true, message: 'Le code du département est requis' },
            { 
              pattern: /^[A-Z0-9]+$/, 
              message: 'Le code doit être en majuscules et/ou chiffres',
              transform: (value) => value ? value.toUpperCase() : value
            }
          ]}
          normalize={value => value ? value.toUpperCase() : value}
        >
          <Input 
            placeholder="Ex: INFO" 
            maxLength={10}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'La description est requise' },
            { min: 10, message: 'La description doit contenir au moins 10 caractères' }
          ]}
        >
          <Input.TextArea 
            placeholder="Description du département..."
            rows={4}
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <Button 
            onClick={handleCancel} 
            className="mr-4"
          >
            Annuler
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Ajouter
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartmentModal;
