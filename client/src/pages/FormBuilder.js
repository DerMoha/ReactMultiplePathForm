import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formAPI } from '../services/api';
import './FormBuilder.css';

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    sections: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadForm();
    }
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

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    setSaving(true);
    try {
      await formAPI.saveComplete(form);
      alert('Form saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    }
    setSaving(false);
  };

  const addSection = () => {
    setForm({
      ...form,
      sections: [
        ...form.sections,
        {
          tempId: generateTempId(),
          title: 'New Section',
          order_index: form.sections.length,
          is_collapsible: true,
          questions: []
        }
      ]
    });
  };

  const removeSection = (sectionIndex) => {
    const newSections = form.sections.filter((_, idx) => idx !== sectionIndex);
    setForm({
      ...form,
      sections: newSections.map((s, idx) => ({ ...s, order_index: idx }))
    });
  };

  const updateSection = (sectionIndex, field, value) => {
    const newSections = [...form.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      [field]: value
    };
    setForm({ ...form, sections: newSections });
  };

  const addQuestion = (sectionIndex, type = 'text') => {
    const newSections = [...form.sections];
    const section = newSections[sectionIndex];

    const newQuestion = {
      tempId: generateTempId(),
      text: '',
      type: type,
      order_index: section.questions.length,
      is_required: false,
      placeholder: '',
      options: type !== 'text' ? [
        { tempId: generateTempId(), text: 'Option 1', value: 'option1', order_index: 0 }
      ] : [],
      conditions: []
    };

    section.questions.push(newQuestion);
    setForm({ ...form, sections: newSections });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const newSections = [...form.sections];
    const section = newSections[sectionIndex];
    const removedQuestionId = section.questions[questionIndex].id || section.questions[questionIndex].tempId;

    // Remove the question
    section.questions = section.questions.filter((_, idx) => idx !== questionIndex)
      .map((q, idx) => ({ ...q, order_index: idx }));

    // Remove any conditions that depend on this question's options
    section.questions.forEach(q => {
      q.conditions = q.conditions.filter(c =>
        c.depends_on_question_id !== removedQuestionId
      );
    });

    setForm({ ...form, sections: newSections });
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const newSections = [...form.sections];
    const question = newSections[sectionIndex].questions[questionIndex];

    question[field] = value;

    // If changing type to text, clear options and conditions
    if (field === 'type' && value === 'text') {
      question.options = [];
      // Also remove any conditions that depend on this question
      newSections.forEach(section => {
        section.questions.forEach(q => {
          q.conditions = q.conditions.filter(c =>
            !question.options.some(opt =>
              (opt.id && opt.id === c.depends_on_option_id) ||
              (opt.tempId && opt.tempId === c.depends_on_option_id)
            )
          );
        });
      });
    }

    // If changing to radio/checkbox and no options, add one
    if (field === 'type' && (value === 'radio' || value === 'checkbox') && question.options.length === 0) {
      question.options = [
        { tempId: generateTempId(), text: 'Option 1', value: 'option1', order_index: 0 }
      ];
    }

    setForm({ ...form, sections: newSections });
  };

  const addOption = (sectionIndex, questionIndex) => {
    const newSections = [...form.sections];
    const question = newSections[sectionIndex].questions[questionIndex];

    question.options.push({
      tempId: generateTempId(),
      text: `Option ${question.options.length + 1}`,
      value: `option${question.options.length + 1}`,
      order_index: question.options.length
    });

    setForm({ ...form, sections: newSections });
  };

  const removeOption = (sectionIndex, questionIndex, optionIndex) => {
    const newSections = [...form.sections];
    const question = newSections[sectionIndex].questions[questionIndex];
    const removedOption = question.options[optionIndex];
    const removedOptionId = removedOption.id || removedOption.tempId;

    // Remove the option
    question.options = question.options.filter((_, idx) => idx !== optionIndex)
      .map((o, idx) => ({ ...o, order_index: idx }));

    // Remove any conditions that depend on this option
    newSections.forEach(section => {
      section.questions.forEach(q => {
        q.conditions = q.conditions.filter(c => c.depends_on_option_id !== removedOptionId);
      });
    });

    setForm({ ...form, sections: newSections });
  };

  const updateOption = (sectionIndex, questionIndex, optionIndex, field, value) => {
    const newSections = [...form.sections];
    const option = newSections[sectionIndex].questions[questionIndex].options[optionIndex];

    option[field] = value;

    // Auto-generate value from text if text is changed
    if (field === 'text') {
      option.value = value.toLowerCase().replace(/\s+/g, '_');
    }

    setForm({ ...form, sections: newSections });
  };

  const addCondition = (sectionIndex, questionIndex) => {
    const newSections = [...form.sections];
    const question = newSections[sectionIndex].questions[questionIndex];

    question.conditions.push({
      tempId: generateTempId(),
      depends_on_option_id: '',
      condition_type: 'show_if_selected'
    });

    setForm({ ...form, sections: newSections });
  };

  const removeCondition = (sectionIndex, questionIndex, conditionIndex) => {
    const newSections = [...form.sections];
    const question = newSections[sectionIndex].questions[questionIndex];

    question.conditions = question.conditions.filter((_, idx) => idx !== conditionIndex);

    setForm({ ...form, sections: newSections });
  };

  const updateCondition = (sectionIndex, questionIndex, conditionIndex, field, value) => {
    const newSections = [...form.sections];
    const condition = newSections[sectionIndex].questions[questionIndex].conditions[conditionIndex];

    condition[field] = value;

    setForm({ ...form, sections: newSections });
  };

  // Get all options from radio/checkbox questions to use in conditions
  const getAllOptions = () => {
    const options = [];
    form.sections.forEach((section, sIdx) => {
      section.questions.forEach((question, qIdx) => {
        if (question.type === 'radio' || question.type === 'checkbox') {
          question.options.forEach(option => {
            options.push({
              id: option.id || option.tempId,
              label: `${section.title} → ${question.text || 'Untitled Question'} → ${option.text}`,
              sectionIndex: sIdx,
              questionIndex: qIdx
            });
          });
        }
      });
    });
    return options;
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  return (
    <div className="form-builder">
      <div className="builder-header">
        <h1>{id ? 'Edit Form' : 'Create New Form'}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="builder-content">
        {/* Form metadata */}
        <div className="form-meta">
          <div className="form-group">
            <label>Form Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter form title"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter form description"
              rows="3"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="sections">
          {form.sections.map((section, sIdx) => (
            <div key={section.id || section.tempId} className="section-card">
              <div className="section-header">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sIdx, 'title', e.target.value)}
                  placeholder="Section title"
                  className="section-title-input"
                />
                <button onClick={() => removeSection(sIdx)} className="btn-danger-small">
                  Remove Section
                </button>
              </div>

              {/* Questions in this section */}
              <div className="questions">
                {section.questions.map((question, qIdx) => (
                  <div key={question.id || question.tempId} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{qIdx + 1}</span>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(sIdx, qIdx, 'type', e.target.value)}
                        className="question-type-select"
                      >
                        <option value="text">Text Field</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>
                      <button onClick={() => removeQuestion(sIdx, qIdx)} className="btn-danger-small">
                        Remove
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Question Text</label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(sIdx, qIdx, 'text', e.target.value)}
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="question-options">
                      <label>
                        <input
                          type="checkbox"
                          checked={question.is_required}
                          onChange={(e) => updateQuestion(sIdx, qIdx, 'is_required', e.target.checked)}
                        />
                        Required
                      </label>
                    </div>

                    {/* Text field specific */}
                    {question.type === 'text' && (
                      <div className="form-group">
                        <label>Placeholder</label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => updateQuestion(sIdx, qIdx, 'placeholder', e.target.value)}
                          placeholder="Enter placeholder text"
                        />
                      </div>
                    )}

                    {/* Radio/Checkbox options */}
                    {(question.type === 'radio' || question.type === 'checkbox') && (
                      <div className="options-section">
                        <label>Options</label>
                        {question.options.map((option, oIdx) => (
                          <div key={option.id || option.tempId} className="option-row">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(sIdx, qIdx, oIdx, 'text', e.target.value)}
                              placeholder="Option text"
                            />
                            <button onClick={() => removeOption(sIdx, qIdx, oIdx)} className="btn-danger-small">
                              ×
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addOption(sIdx, qIdx)} className="btn-secondary-small">
                          + Add Option
                        </button>
                      </div>
                    )}

                    {/* Conditional logic */}
                    <div className="conditions-section">
                      <label>Show this question if:</label>
                      {question.conditions.map((condition, cIdx) => (
                        <div key={condition.id || condition.tempId} className="condition-row">
                          <select
                            value={condition.depends_on_option_id}
                            onChange={(e) => updateCondition(sIdx, qIdx, cIdx, 'depends_on_option_id', e.target.value)}
                          >
                            <option value="">Select option...</option>
                            {getAllOptions()
                              .filter(opt => !(opt.sectionIndex === sIdx && opt.questionIndex === qIdx))
                              .map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                              ))
                            }
                          </select>
                          <span>is selected</span>
                          <button onClick={() => removeCondition(sIdx, qIdx, cIdx)} className="btn-danger-small">
                            ×
                          </button>
                        </div>
                      ))}
                      {getAllOptions().length > 0 && (
                        <button onClick={() => addCondition(sIdx, qIdx)} className="btn-secondary-small">
                          + Add Condition
                        </button>
                      )}
                      {getAllOptions().length === 0 && (
                        <p className="hint">Add radio/checkbox questions first to enable conditional logic</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-actions">
                <button onClick={() => addQuestion(sIdx, 'text')} className="btn-secondary-small">
                  + Text Field
                </button>
                <button onClick={() => addQuestion(sIdx, 'radio')} className="btn-secondary-small">
                  + Radio Buttons
                </button>
                <button onClick={() => addQuestion(sIdx, 'checkbox')} className="btn-secondary-small">
                  + Checkboxes
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addSection} className="btn-primary">
          + Add Section
        </button>
      </div>
    </div>
  );
}

export default FormBuilder;
