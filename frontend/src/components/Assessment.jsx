import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Award, ChevronRight, Play } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './Assessment.css';

const Assessment = () => {
    const [activeTab, setActiveTab] = useState('available'); // available, history
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Mock Assessment Data
    const assessments = [
        {
            id: 1,
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of core JavaScript concepts including closures, prototypes, and async programming.',
            duration: '15 mins',
            questions_count: 5,
            difficulty: 'Intermediate',
            category: 'Development'
        },
        {
            id: 2,
            title: 'React.js Proficiency',
            description: 'Validate your expertise in React hooks, component lifecycle, and state management.',
            duration: '20 mins',
            questions_count: 5,
            difficulty: 'Advanced',
            category: 'Development'
        },
        {
            id: 3,
            title: 'Project Management Basics',
            description: 'Assess your understanding of Agile methodologies, risk management, and stakeholder communication.',
            duration: '10 mins',
            questions_count: 5,
            difficulty: 'Beginner',
            category: 'Management'
        }
    ];

    // Mock Questions for ID 1 (JS)
    const mockQuestions = [
        {
            id: 1,
            text: 'What is the output of "typeof null" in JavaScript?',
            options: ['"object"', '"null"', '"undefined"', '"number"'],
            correct: '"object"'
        },
        {
            id: 2,
            text: 'Which method is used to remove the last element from an array?',
            options: ['shift()', 'pop()', 'push()', 'splice()'],
            correct: 'pop()'
        },
        {
            id: 3,
            text: 'What does the "use strict" directive do?',
            options: [
                'Enforces stricter parsing and error handling',
                'Enables latest ES6 features',
                'Prevents the use of global variables only',
                'Optimizes code for performance'
            ],
            correct: 'Enforces stricter parsing and error handling'
        },
        {
            id: 4,
            text: 'Which of the following is NOT a valid way to declare a function in JavaScript?',
            options: [
                'function myFunction() {}',
                'const myFunction = function() {}',
                'const myFunction = () => {}',
                'function = myFunction() {}'
            ],
            correct: 'function = myFunction() {}'
        },
        {
            id: 5,
            text: 'What is the purpose of "Promise.all()"?',
            options: [
                'Run promises sequentially',
                'Run promises in parallel and wait for all to resolve',
                'Run promises and return the first one that resolves',
                'Cancel all pending promises'
            ],
            correct: 'Run promises in parallel and wait for all to resolve'
        }
    ];

    const handleStart = (assessment) => {
        setSelectedAssessment(assessment);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const calculateScore = () => {
        let correct = 0;
        mockQuestions.forEach(q => {
            if (answers[q.id] === q.correct) {
                correct++;
            }
        });
        return Math.round((correct / mockQuestions.length) * 100);
    };

    const handleSubmit = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setIsSubmitted(true);
    };

    return (
        <DashboardLayout>
            <div className="assessment-page">
                <div className="assessment-header">
                    <h1>Skill Assessments</h1>
                    <p>Validate your skills and earn badges to stand out to employers.</p>
                </div>

                {!selectedAssessment ? (
                    <div className="assessment-content">
                        <div className="assessment-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                                onClick={() => setActiveTab('available')}
                            >
                                Available Assessments
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                My Results
                            </button>
                        </div>

                        {activeTab === 'available' ? (
                            <div className="assessment-grid">
                                {assessments.map(item => (
                                    <div key={item.id} className="assessment-card">
                                        <div className="assessment-card-header">
                                            <span className={`badge badge-${item.difficulty.toLowerCase()}`}>
                                                {item.difficulty}
                                            </span>
                                            <span className="category-label">{item.category}</span>
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        <div className="assessment-meta">
                                            <div className="meta-item">
                                                <Clock size={16} />
                                                {item.duration}
                                            </div>
                                            <div className="meta-item">
                                                <AlertCircle size={16} />
                                                {item.questions_count} Questions
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary start-btn"
                                            onClick={() => handleStart(item)}
                                        >
                                            Start Assessment <Play size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-history">
                                <Award size={64} className="text-gray-400 mb-4" />
                                <h3>No assessments taken yet</h3>
                                <p>Complete an assessment to see your results here.</p>
                            </div>
                        )}
                    </div>
                ) : !isSubmitted ? (
                    <div className="taking-assessment">
                        <div className="question-header">
                            <button
                                className="back-btn"
                                onClick={() => setSelectedAssessment(null)}
                            >
                                &larr; Exit
                            </button>
                            <div className="timer">
                                <Clock size={16} /> 14:59
                            </div>
                        </div>

                        <div className="progress-indicator">
                            Question {currentQuestionIndex + 1} of {mockQuestions.length}
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="question-card">
                            <h2>{mockQuestions[currentQuestionIndex].text}</h2>
                            <div className="options-list">
                                {mockQuestions[currentQuestionIndex].options.map((option, idx) => (
                                    <label
                                        key={idx}
                                        className={`option-item ${answers[mockQuestions[currentQuestionIndex].id] === option ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${mockQuestions[currentQuestionIndex].id}`}
                                            value={option}
                                            checked={answers[mockQuestions[currentQuestionIndex].id] === option}
                                            onChange={() => handleAnswer(mockQuestions[currentQuestionIndex].id, option)}
                                        />
                                        <span className="option-text">{option}</span>
                                        <span className="radio-custom"></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="question-actions">
                            <button
                                className="btn btn-secondary"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                Previous
                            </button>

                            {currentQuestionIndex < mockQuestions.length - 1 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Next Question <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-submit"
                                    onClick={handleSubmit}
                                >
                                    Submit Assessment <CheckCircle size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="results-view">
                        <div className="results-card">
                            <div className={`score-ring ${score >= 70 ? 'pass' : 'fail'}`}>
                                <span className="score-number">{score}%</span>
                                <span className="score-label">Score</span>
                            </div>

                            <h2>{score >= 70 ? 'Congratulations!' : 'Keep Learning'}</h2>
                            <p className="results-message">
                                {score >= 70
                                    ? `You have successfully passed the ${selectedAssessment.title}. A badge has been added to your profile.`
                                    : `You didn't pass the assessment this time. Review the material and try again.`}
                            </p>

                            <div className="results-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedAssessment(null)}
                                >
                                    Back to Assessments
                                </button>
                                {score < 70 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleStart(selectedAssessment)}
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Assessment;
