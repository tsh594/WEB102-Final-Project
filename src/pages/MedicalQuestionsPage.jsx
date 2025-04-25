import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaLock, FaStethoscope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const MedicalQuestionsPage = () => {
    const { user } = useAuth();
    const [cards, setCards] = useState([
        {
            id: 1,
            question: "What are the classic symptoms of a myocardial infarction?",
            answer: "Chest pain/pressure, shortness of breath, nausea, cold sweat, pain radiating to left arm/jaw",
            category: "Cardiology",
            difficulty: "High",
            createdBy: "system"
        },
        {
            id: 2,
            question: "What is the difference between Type 1 and Type 2 diabetes?",
            answer: "Type 1: Autoimmune destruction of insulin-producing cells. Type 2: Insulin resistance with relative insulin deficiency.",
            category: "Endocrinology",
            difficulty: "Medium",
            createdBy: "system"
        },
        {
            id: 3,
            question: "What are the ABCDEs of melanoma detection?",
            answer: "Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution over time",
            category: "Dermatology",
            difficulty: "Medium",
            createdBy: "system"
        },
        {
            id: 4,
            question: "What is the Glasgow Coma Scale used for?",
            answer: "Assessing level of consciousness in head injuries (Eye, Verbal, Motor responses)",
            category: "Neurology",
            difficulty: "High",
            createdBy: "system"
        }
    ]);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [navDirection, setNavDirection] = useState(null);
    const [buttonAnimation, setButtonAnimation] = useState('');
    const [newCard, setNewCard] = useState({
        question: '',
        answer: '',
        category: '',
        difficulty: 'Medium',
        styles: {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#000000'
        }
    });
    const [editCard, setEditCard] = useState(null);

    const questionRef = useRef(null);
    const answerRef = useRef(null);

    // Fix for bidirectional text issue
    useEffect(() => {
    const enforceTextDirection = (element) => {
        if (element) {
        element.style.direction = 'ltr';
        element.style.textAlign = 'left';
        element.style.unicodeBidi = 'plaintext';
        }
    };

    enforceTextDirection(questionRef.current);
    enforceTextDirection(answerRef.current);
    }, [editCard, newCard.question, newCard.answer]);

    // Navigation handlers
    const navigateCard = (direction) => {
        setNavDirection(direction);
        setButtonAnimation(direction === 'next' ? 'slide-out-right' : 'slide-out-left');
        setShowAnswer(false);

        setTimeout(() => {
            setCurrentCardIndex(prev => {
                if (direction === 'prev') return Math.max(0, prev - 1);
                return Math.min(cards.length - 1, prev + 1);
            });
            setButtonAnimation(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
            setTimeout(() => setButtonAnimation(''), 300);
        }, 300);
    };

    // Text formatting functions
        const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        // Re-enforce direction after formatting
        if (editorRef.current) {
            editorRef.current.style.direction = 'ltr';
            editorRef.current.style.textAlign = 'left';
            editorRef.current.style.unicodeBidi = 'plaintext';
        }
        handleEditorChange();
        };

    // Content change handlers
    const handleQuestionChange = () => {
        setNewCard({
            ...newCard,
            question: DOMPurify.sanitize(questionRef.current.innerHTML)
        });
    };

    const handleAnswerChange = () => {
        setNewCard({
            ...newCard,
            answer: DOMPurify.sanitize(answerRef.current.innerHTML)
        });
    };

    // Card management
    const handleCardUpdate = () => {
        if (!user) return;
        
        const updatedCards = editCard 
            ? cards.map(c => c.id === editCard.id ? { 
                ...newCard, 
                id: editCard.id,
                createdBy: user.id 
            } : c)
            : [...cards, { 
                ...newCard, 
                id: Date.now(), 
                createdBy: user.id 
            }];
        
        setCards(updatedCards);
        setEditCard(null);
        setNewCard({ 
            question: '', 
            answer: '', 
            category: '', 
            difficulty: 'Medium',
            styles: {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#000000'
            }
        });
        toast.success(editCard ? 'Card updated!' : 'Card added!');
    };

    return (
        <div className="medical-questions-container">
            <header className="questions-header">
                <h1>
                    <span className="header-icon">📚</span>
                    Medical Knowledge Hub
                </h1>
                <div className="progress-indicator">
                    <span className="current-card">{currentCardIndex + 1}</span>
                    <span className="total-cards">/{cards.length}</span>
                </div>
            </header>

            <main className="flashcard-viewport">
                <div className="navigation-controls">
                    <button 
                        className="nav-button prev-button"
                        onClick={() => navigateCard('prev')}
                        disabled={currentCardIndex === 0}
                    >
                        <FaChevronLeft size={24} />
                    </button>
                </div>

                <div className="flashcard-wrapper">
                    <div 
                        className={`flashcard ${showAnswer ? 'revealed' : ''}`}
                        onClick={() => setShowAnswer(!showAnswer)}
                    >
                        <div className="card-face front">
                            <h2 
                                className="card-question" 
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cards[currentCardIndex]?.question) }} 
                            />
                            <div className="card-metadata">
                                <span className={`difficulty ${cards[currentCardIndex]?.difficulty.toLowerCase()}`}>
                                    {cards[currentCardIndex]?.difficulty}
                                </span>
                                <span className="category-tag">
                                    {cards[currentCardIndex]?.category}
                                </span>
                            </div>
                            {user && (
                                <div className="card-actions">
                                    <button
                                        className="icon-button edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditCard(cards[currentCardIndex]);
                                            setNewCard({
                                                ...cards[currentCardIndex],
                                                difficulty: cards[currentCardIndex]?.difficulty || 'Medium'
                                            });
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="icon-button delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCards(prev => prev.filter((_, i) => i !== currentCardIndex));
                                            if (currentCardIndex >= cards.length - 1) {
                                                setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                            }
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="card-face back">
                            <div className="answer-content">
                                <p 
                                    className="answer-text"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cards[currentCardIndex]?.answer) }} 
                                />
                                {cards[currentCardIndex]?.category === 'Pharmacology' && (
                                    <div className="additional-info">
                                        <h4>Key Considerations:</h4>
                                        <ul className="clinical-points">
                                            <li>Dosage adjustments</li>
                                            <li>Drug interactions</li>
                                            <li>Monitoring parameters</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="navigation-controls">
                    <button 
                        className="nav-button next-button"
                        onClick={() => navigateCard('next')}
                        disabled={currentCardIndex === cards.length - 1}
                    >
                        <FaChevronRight size={24} />
                    </button>
                </div>
            </main>

            <button
                className={`toggle-answer-button ${buttonAnimation}`}
                onClick={() => setShowAnswer(!showAnswer)}
            >
                <FaStethoscope />
                {showAnswer ? 'Hide Clinical Answer' : 'Reveal Clinical Answer'}
            </button>

            {user ? (
                <section className="card-management">
                    <div className="form-header">
                        <h2>{editCard ? 'Edit Clinical Card' : 'Create New Medical Card'}</h2>
                        <p className="form-subtitle">
                            {editCard ? 
                                'Update evidence-based medical content:' : 
                                'Contribute to medical education:'
                            }
                        </p>
                    </div>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Clinical Scenario ✏️</label>
                            <div className="text-editor-toolbar">
                                <button type="button" onClick={() => formatText('bold', null, 'question')}><strong>B</strong></button>
                                <button type="button" onClick={() => formatText('italic', null, 'question')}><em>I</em></button>
                                <button type="button" onClick={() => formatText('underline', null, 'question')}><u>U</u></button>
                                <button type="button" onClick={() => formatText('insertUnorderedList', null, 'question')}>• List</button>
                                <select onChange={(e) => formatText('fontName', e.target.value, 'question')}>
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times</option>
                                </select>
                                <input 
                                    type="color" 
                                    onChange={(e) => formatText('foreColor', e.target.value, 'question')}
                                />
                                <select 
                                    onChange={(e) => formatText('fontSize', e.target.value, 'question')}
                                >
                                    <option value="1">Small</option>
                                    <option value="3">Medium</option>
                                    <option value="5">Large</option>
                                </select>
                            </div>
                            <div
                            ref={questionRef}
                            className="editable-content"
                            contentEditable
                            style={{
                                direction: 'ltr',
                                textAlign: 'left',
                                unicodeBidi: 'plaintext'
                            }}
                            onInput={handleQuestionChange}
                            dangerouslySetInnerHTML={{ __html: newCard.question }}
                            suppressContentEditableWarning={true}
                            />
                        </div>
                        <div className="form-group">
                            <label>Evidence-Based Analysis 📚</label>
                            <div className="text-editor-toolbar">
                                <button type="button" onClick={() => formatText('bold', null, 'answer')}><strong>B</strong></button>
                                <button type="button" onClick={() => formatText('italic', null, 'answer')}><em>I</em></button>
                                <button type="button" onClick={() => formatText('underline', null, 'answer')}><u>U</u></button>
                                <button type="button" onClick={() => formatText('insertUnorderedList', null, 'answer')}>• List</button>
                                <select onChange={(e) => formatText('fontName', e.target.value, 'answer')}>
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times</option>
                                </select>
                                <input 
                                    type="color" 
                                    onChange={(e) => formatText('foreColor', e.target.value, 'answer')}
                                />
                                <select 
                                    onChange={(e) => formatText('fontSize', e.target.value, 'answer')}
                                >
                                    <option value="1">Small</option>
                                    <option value="3">Medium</option>
                                    <option value="5">Large</option>
                                </select>
                            </div>
                            <div
                            ref={answerRef}
                            className="editable-content"
                            contentEditable
                            style={{
                                direction: 'ltr',
                                textAlign: 'left',
                                unicodeBidi: 'plaintext'
                            }}
                            onInput={handleAnswerChange}
                            dangerouslySetInnerHTML={{ __html: newCard.answer }}
                            suppressContentEditableWarning={true}
                            />
                        </div>
                        <div className="form-group specialty-select">
                            <label>Medical Specialty 🏥</label>
                            <div className="select-wrapper">
                                <select
                                    value={newCard.category}
                                    onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                                >
                                    <option value="">Select Specialty</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Emergency Medicine">Emergency Medicine</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="Radiology">Radiology</option>
                                </select>
                                <div className="select-arrow">▼</div>
                            </div>
                        </div>

                        <div className="form-group complexity-level">
                            <label>Complexity Level 🎯</label>
                            <div className="difficulty-buttons">
                                <button
                                    type="button"
                                    className={`difficulty-option ${newCard.difficulty === 'Easy' ? 'active' : ''}`}
                                    onClick={() => setNewCard({...newCard, difficulty: 'Easy'})}
                                >
                                    <span className="difficulty-icon">👨⚕️</span>
                                    Medical Student
                                </button>
                                <button
                                    type="button"
                                    className={`difficulty-option ${newCard.difficulty === 'Medium' ? 'active' : ''}`}
                                    onClick={() => setNewCard({...newCard, difficulty: 'Medium'})}
                                >
                                    <span className="difficulty-icon">👨⚕️</span>
                                    Resident Level
                                </button>
                                <button
                                    type="button"
                                    className={`difficulty-option ${newCard.difficulty === 'Hard' ? 'active' : ''}`}
                                    onClick={() => setNewCard({...newCard, difficulty: 'Hard'})}
                                >
                                    <span className="difficulty-icon">👨⚕️</span>
                                    Attending Level
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        {editCard && (
                            <button 
                                className="secondary-button"
                                onClick={() => setEditCard(null)}
                            >
                                Discard Changes
                            </button>
                        )}
                        <button
                            className="primary-button"
                            onClick={handleCardUpdate}
                            disabled={!newCard.question || !newCard.answer}
                        >
                            <span className="button-content">
                                {editCard ? 'Update Medical Card' : 'Publish Clinical Case'}
                                <span className="publish-icon">📌</span>
                            </span>
                        </button>
                    </div>
                </section>
            ) : (
                <div className="auth-required">
                    <FaLock className="auth-icon" />
                    <h3>Clinical Expert Access Required</h3>
                    <p>Sign in to contribute medical knowledge and access advanced clinical features</p>
                </div>
            )}
        </div>
    );
};

export default MedicalQuestionsPage;