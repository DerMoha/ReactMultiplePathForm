import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formAPI } from '../services/api';
import './FormHome.css';

function FormHome() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const response = await formAPI.getAll();
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
      alert('Failed to load forms');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await formAPI.delete(id);
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  if (loading) {
    return <div className="loading">Loading forms...</div>;
  }

  return (
    <div className="form-home">
      <div className="home-header">
        <h1>Dynamic Form Builder</h1>
        <p className="subtitle">Create forms with conditional logic and branching questions</p>
        <button onClick={() => navigate('/form-builder')} className="btn-create">
          + Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="empty-state">
          <p>No forms yet. Create your first form to get started!</p>
        </div>
      ) : (
        <div className="forms-grid">
          {forms.map((form) => (
            <div key={form.id} className="form-card">
              <div className="card-header">
                <h3>{form.title}</h3>
                <span className="form-date">
                  {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>

              {form.description && (
                <p className="card-description">{form.description}</p>
              )}

              <div className="card-actions">
                <button
                  onClick={() => navigate(`/form-viewer/${form.id}`)}
                  className="btn-fill"
                >
                  Fill Out Form
                </button>
                <button
                  onClick={() => navigate(`/form-builder/${form.id}`)}
                  className="btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormHome;
