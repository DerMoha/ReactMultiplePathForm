import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireAPI } from '../services/api';
import './Home.css';

function Home() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const response = await questionnaireAPI.getAll();
      setQuestionnaires(response.data);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      alert('Failed to load questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this questionnaire?')) {
      return;
    }

    try {
      await questionnaireAPI.delete(id);
      setQuestionnaires(questionnaires.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      alert('Failed to delete questionnaire');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="home-header">
        <h1>Questionnaire Builder</h1>
        <button
          className="primary-btn"
          onClick={() => navigate('/builder')}
        >
          Create New Questionnaire
        </button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="empty-state">
          <p>No questionnaires yet. Create your first one!</p>
        </div>
      ) : (
        <div className="questionnaire-grid">
          {questionnaires.map((q) => (
            <div key={q.id} className="questionnaire-card">
              <h3>{q.title}</h3>
              <p>{q.description || 'No description'}</p>
              <div className="card-actions">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/view/${q.id}`)}
                >
                  Take Quiz
                </button>
                <button
                  className="light-btn"
                  onClick={() => navigate(`/builder/${q.id}`)}
                >
                  Edit
                </button>
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(q.id)}
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

export default Home;
