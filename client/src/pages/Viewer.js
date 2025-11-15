import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionnaireAPI, responseAPI } from '../services/api';
import './Viewer.css';

function Viewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [pathQueue, setPathQueue] = useState([]); // Queue of questions to visit for multiple selection
  const [completed, setCompleted] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    loadQuestionnaire();
  }, [id]);

  const loadQuestionnaire = async () => {
    try {
      const response = await questionnaireAPI.getById(id);
      setQuestionnaire(response.data);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      alert('Failed to load questionnaire');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = () => {
    if (!questionnaire || !questionnaire.questions) return null;
    return questionnaire.questions[currentQuestionIndex];
  };

  const handleOptionSelect = (optionId) => {
    const currentQuestion = getCurrentQuestion();

    if (currentQuestion.type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      // Multiple choice - toggle selection
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const saveResponse = async (questionId, optionId) => {
    try {
      await responseAPI.create({
        questionnaire_id: questionnaire.id,
        session_id: sessionId,
        question_id: questionId,
        option_id: optionId
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleNext = async () => {
    const currentQuestion = getCurrentQuestion();

    if (selectedOptions.length === 0) {
      alert('Please select at least one option');
      return;
    }

    // Save answers
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = selectedOptions;
    setAnswers(newAnswers);

    // Save responses to database
    for (const optionId of selectedOptions) {
      await saveResponse(currentQuestion.id, optionId);
    }

    // Determine next question based on selection type
    if (currentQuestion.type === 'single') {
      // Single choice - go to next question in sequence
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questionnaire.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedOptions([]);
      } else {
        setCompleted(true);
      }
    } else {
      // Multiple choice - add all selected paths to queue
      const newPaths = [];
      const currentOptions = currentQuestion.options;

      for (const optionId of selectedOptions) {
        const option = currentOptions.find(o => o.id === optionId);
        if (option && option.next_question_id) {
          // Find question by ID
          const nextQuestionIndex = questionnaire.questions.findIndex(
            q => q.id === option.next_question_id
          );
          if (nextQuestionIndex !== -1 && !newPaths.includes(nextQuestionIndex)) {
            newPaths.push(nextQuestionIndex);
          }
        }
      }

      if (newPaths.length > 0) {
        // Start with first path
        const [firstPath, ...restPaths] = newPaths;
        setPathQueue([...pathQueue, ...restPaths]);
        setCurrentQuestionIndex(firstPath);
        setSelectedOptions([]);
      } else if (pathQueue.length > 0) {
        // Continue with queued paths
        const [nextPath, ...restPaths] = pathQueue;
        setPathQueue(restPaths);
        setCurrentQuestionIndex(nextPath);
        setSelectedOptions([]);
      } else {
        // Move to next question in sequence
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questionnaire.questions.length) {
          setCurrentQuestionIndex(nextIndex);
          setSelectedOptions([]);
        } else {
          setCompleted(true);
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setPathQueue([]);
    setCompleted(false);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!questionnaire) {
    return <div className="container">Questionnaire not found</div>;
  }

  if (completed) {
    return (
      <div className="container">
        <div className="completion-card">
          <h1>Thank You!</h1>
          <p>You have completed the questionnaire.</p>
          <div className="completion-actions">
            <button className="secondary-btn" onClick={handleRestart}>
              Start Over
            </button>
            <button className="primary-btn" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return <div className="container">No questions available</div>;
  }

  return (
    <div className="container">
      <div className="viewer-header">
        <h1>{questionnaire.title}</h1>
        <p>{questionnaire.description}</p>
      </div>

      <div className="question-container">
        <div className="progress-bar">
          <div className="progress-info">
            Question {currentQuestionIndex + 1} of {questionnaire.questions.length}
            {pathQueue.length > 0 && (
              <span className="queue-info"> ({pathQueue.length} more paths to explore)</span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questionnaire.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="question-card">
          <h2>{currentQuestion.text}</h2>
          <p className="question-type">
            {currentQuestion.type === 'single' ? 'Select one option' : 'Select multiple options'}
          </p>

          <div className="options-list">
            {currentQuestion.options && currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`option-item ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="option-radio">
                  {currentQuestion.type === 'single' ? (
                    <div className={`radio ${selectedOptions.includes(option.id) ? 'checked' : ''}`} />
                  ) : (
                    <div className={`checkbox ${selectedOptions.includes(option.id) ? 'checked' : ''}`}>
                      {selectedOptions.includes(option.id) && '✓'}
                    </div>
                  )}
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>

          <div className="question-actions">
            <button className="light-btn" onClick={() => navigate('/')}>
              Exit
            </button>
            <button
              className="primary-btn"
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;
