import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questionnaireAPI } from '../services/api';
import { generateTempId } from '../utils/generateId';
import './Builder.css';

function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestionnaire();
    }
  }, [id]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    try {
      const response = await questionnaireAPI.getById(id);
      setQuestionnaire(response.data);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      alert('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!questionnaire.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (questionnaire.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setLoading(true);
    try {
      await questionnaireAPI.saveComplete(questionnaire);
      alert('Questionnaire saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      alert('Failed to save questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      tempId: generateTempId(),
      text: '',
      type: 'single',
      order_index: questionnaire.questions.length,
      parent_option_id: null,
      options: []
    };
    setQuestionnaire({
      ...questionnaire,
      questions: [...questionnaire.questions, newQuestion]
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...questionnaire.questions];
    updatedQuestions[questionIndex][field] = value;
    setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
  };

  const deleteQuestion = (questionIndex) => {
    const updatedQuestions = questionnaire.questions.filter((_, i) => i !== questionIndex);
    // Re-index questions
    updatedQuestions.forEach((q, i) => q.order_index = i);
    setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questionnaire.questions];
    const newOption = {
      tempId: generateTempId(),
      text: '',
      order_index: updatedQuestions[questionIndex].options.length,
      next_question_id: null
    };
    updatedQuestions[questionIndex].options.push(newOption);
    setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questionnaire.questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questionnaire.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    // Re-index options
    updatedQuestions[questionIndex].options.forEach((o, i) => o.order_index = i);
    setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
  };

  if (loading && id) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="builder-header">
        <h1>{id ? 'Edit' : 'Create'} Questionnaire</h1>
        <div className="header-actions">
          <button className="light-btn" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="builder-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={questionnaire.title}
            onChange={(e) => setQuestionnaire({ ...questionnaire, title: e.target.value })}
            placeholder="Enter questionnaire title"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={questionnaire.description}
            onChange={(e) => setQuestionnaire({ ...questionnaire, description: e.target.value })}
            placeholder="Enter description (optional)"
            rows="3"
          />
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button className="secondary-btn" onClick={addQuestion}>
              Add Question
            </button>
          </div>

          {questionnaire.questions.length === 0 ? (
            <div className="empty-state">
              <p>No questions yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            questionnaire.questions.map((question, qIndex) => (
              <div key={question.tempId || question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {qIndex + 1}</span>
                  <button
                    className="danger-btn"
                    onClick={() => deleteQuestion(qIndex)}
                  >
                    Delete
                  </button>
                </div>

                <div className="form-group">
                  <label>Question Text *</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="form-group">
                  <label>Answer Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                  </select>
                </div>

                <div className="options-section">
                  <div className="section-header">
                    <h4>Options</h4>
                    <button
                      className="light-btn"
                      onClick={() => addOption(qIndex)}
                    >
                      Add Option
                    </button>
                  </div>

                  {question.options.map((option, oIndex) => (
                    <div key={option.tempId || option.id} className="option-row">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      <button
                        className="danger-btn"
                        onClick={() => deleteOption(qIndex, oIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Builder;
