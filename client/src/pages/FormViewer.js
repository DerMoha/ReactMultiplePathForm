import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formAPI, submissionAPI } from '../services/api';
import './FormViewer.css';

function FormViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const response = await formAPI.getById(id);
      setForm(response.data);
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Failed to load form');
    }
    setLoading(false);
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionVisible = (section) => {
    // If no conditions, always visible
    if (!section.conditions || section.conditions.length === 0) {
      return true;
    }

    // Check if any condition is satisfied
    return section.conditions.some(condition => {
      const optionId = condition.depends_on_option_id;

      // Find which question this option belongs to
      let dependsOnQuestionId = null;
      form.sections.forEach(s => {
        s.questions.forEach(q => {
          if (q.options && q.options.some(opt => (opt.id || opt.tempId) === optionId)) {
            dependsOnQuestionId = q.id || q.tempId;
          }
        });
      });

      if (!dependsOnQuestionId) return false;

      const answer = answers[dependsOnQuestionId];

      // Check if the required option is selected
      if (Array.isArray(answer)) {
        // For checkboxes (array of selected values)
        return answer.includes(optionId);
      } else {
        // For radio buttons (single value)
        return answer === optionId;
      }
    });
  };

  const isQuestionVisible = (question) => {
    // If no conditions, always visible
    if (!question.conditions || question.conditions.length === 0) {
      return true;
    }

    // Check if any condition is satisfied
    return question.conditions.some(condition => {
      const optionId = condition.depends_on_option_id;

      // Find which question this option belongs to
      let dependsOnQuestionId = null;
      form.sections.forEach(section => {
        section.questions.forEach(q => {
          if (q.options && q.options.some(opt => (opt.id || opt.tempId) === optionId)) {
            dependsOnQuestionId = q.id || q.tempId;
          }
        });
      });

      if (!dependsOnQuestionId) return false;

      const answer = answers[dependsOnQuestionId];

      // Check if the required option is selected
      if (Array.isArray(answer)) {
        // For checkboxes (array of selected values)
        return answer.includes(optionId);
      } else {
        // For radio buttons (single value)
        return answer === optionId;
      }
    });
  };

  const handleRadioChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (questionId, optionId) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId)
        : [...currentAnswers, optionId];

      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    form.sections.forEach(section => {
      section.questions.forEach(question => {
        // Only validate if question is visible and required
        if (question.is_required && isQuestionVisible(question)) {
          const questionId = question.id || question.tempId;
          const answer = answers[questionId];

          if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
            newErrors[questionId] = 'This question is required';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please answer all required questions');
      return;
    }

    // Prepare answers in the format the API expects
    const formattedAnswers = [];

    form.sections.forEach(section => {
      section.questions.forEach(question => {
        if (!isQuestionVisible(question)) return;

        const questionId = question.id || question.tempId;
        const answer = answers[questionId];

        if (question.type === 'text') {
          if (answer) {
            formattedAnswers.push({
              question_id: question.id,
              text_value: answer
            });
          }
        } else if (question.type === 'radio') {
          if (answer) {
            // Find the actual option ID from the database
            const option = question.options.find(opt => (opt.id || opt.tempId) === answer);
            if (option && option.id) {
              formattedAnswers.push({
                question_id: question.id,
                option_id: option.id
              });
            }
          }
        } else if (question.type === 'checkbox') {
          if (answer && answer.length > 0) {
            answer.forEach(optionIdOrTempId => {
              const option = question.options.find(opt => (opt.id || opt.tempId) === optionIdOrTempId);
              if (option && option.id) {
                formattedAnswers.push({
                  question_id: question.id,
                  option_id: option.id
                });
              }
            });
          }
        }
      });
    });

    setSubmitting(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await submissionAPI.create({
        form_id: form.id,
        session_id: sessionId,
        answers: formattedAnswers
      });

      alert('Form submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  if (!form) {
    return <div className="error">Form not found</div>;
  }

  return (
    <div className="form-viewer">
      <div className="viewer-header">
        <h1>{form.title}</h1>
        {form.description && <p className="form-description">{form.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {form.sections.map((section) => {
          const sectionId = section.id || section.tempId;
          const isCollapsed = collapsedSections[sectionId];

          // Check if section is visible based on conditions
          if (!isSectionVisible(section)) return null;

          // Check if section has any visible questions
          const visibleQuestions = section.questions.filter(q => isQuestionVisible(q));
          if (visibleQuestions.length === 0) return null;

          return (
            <div key={sectionId} className="section-viewer">
              <div
                className="section-header-viewer"
                onClick={() => section.is_collapsible && toggleSection(sectionId)}
                style={{ cursor: section.is_collapsible ? 'pointer' : 'default' }}
              >
                <h2>{section.title}</h2>
                {section.is_collapsible && (
                  <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
                )}
              </div>

              {!isCollapsed && (
                <div className="section-content">
                  {section.questions.map((question) => {
                    if (!isQuestionVisible(question)) return null;

                    const questionId = question.id || question.tempId;
                    const hasError = errors[questionId];

                    return (
                      <div key={questionId} className={`question-viewer ${hasError ? 'has-error' : ''}`}>
                        <label className="question-label">
                          {question.text}
                          {question.is_required && <span className="required">*</span>}
                        </label>

                        {question.type === 'text' && (
                          <input
                            type="text"
                            placeholder={question.placeholder || ''}
                            value={answers[questionId] || ''}
                            onChange={(e) => handleTextChange(questionId, e.target.value)}
                            className="text-input"
                          />
                        )}

                        {question.type === 'radio' && (
                          <div className="options-group">
                            {question.options.map((option) => {
                              const optionId = option.id || option.tempId;
                              return (
                                <label key={optionId} className="option-label">
                                  <input
                                    type="radio"
                                    name={`question_${questionId}`}
                                    value={optionId}
                                    checked={answers[questionId] === optionId}
                                    onChange={() => handleRadioChange(questionId, optionId)}
                                  />
                                  <span className="option-text">{option.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {question.type === 'checkbox' && (
                          <div className="options-group">
                            {question.options.map((option) => {
                              const optionId = option.id || option.tempId;
                              const isChecked = answers[questionId]?.includes(optionId) || false;

                              return (
                                <label key={optionId} className="option-label">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleCheckboxChange(questionId, optionId)}
                                  />
                                  <span className="option-text">{option.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {hasError && <div className="error-message">{errors[questionId]}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormViewer;
