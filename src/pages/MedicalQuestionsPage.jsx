import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaLock, FaStethoscope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const MedicalQuestionsPage = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([
    { id: 1, question: "What are the classic symptoms of a myocardial infarction?", answer: "Chest pain/pressure, shortness of breath, nausea, cold sweat, pain radiating to left arm/jaw", category: "Cardiology", difficulty: "Hard", createdBy: "system" },
    { id: 2, question: "What is the difference between Type 1 and Type 2 diabetes?", answer: "Type 1: Autoimmune destruction of insulin-producing cells. Type 2: Insulin resistance with relative insulin deficiency.", category: "Endocrinology", difficulty: "Medium", createdBy: "system" },
    { id: 3, question: "What are the ABCDEs of melanoma detection?", answer: "Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution over time", category: "Dermatology", difficulty: "Medium", createdBy: "system" },
    { id: 4, question: "What is the Glasgow Coma Scale used for?", answer: "Assessing level of consciousness in head injuries (Eye, Verbal, Motor responses)", category: "Neurology", difficulty: "Hard", createdBy: "system" }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [navDirection, setNavDirection] = useState(null);
  const [buttonAnimation, setButtonAnimation] = useState('');
  const [newCard, setNewCard] = useState({ question: '', answer: '', category: '', difficulty: 'Medium' });
  const [editCard, setEditCard] = useState(null);

  const questionRef = useRef(null);
  const answerRef = useRef(null);

  // Make formatting persist
  useEffect(() => {
    document.execCommand('styleWithCSS', false, true);
  }, []);

  // Navigate cards
  const navigateCard = (direction) => {
    setNavDirection(direction);
    setButtonAnimation(direction === 'next' ? 'slide-out-right' : 'slide-out-left');
    setShowAnswer(false);
    setTimeout(() => {
      setCurrentCardIndex(prev =>
        direction === 'prev' ? Math.max(0, prev - 1) : Math.min(cards.length - 1, prev + 1)
      );
      setButtonAnimation(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
      setTimeout(() => setButtonAnimation(''), 300);
    }, 300);
  };

  // Apply formatting
  const formatText = (command, value = null, field) => {
    const target = field === 'question' ? questionRef.current : answerRef.current;
    if (!target) return;
    target.focus();
    document.execCommand(command, false, value);
    field === 'question' ? handleQuestionChange() : handleAnswerChange();
  };

  // Clear all styles & links
  const clearFormatting = (field) => {
    const target = field === 'question' ? questionRef.current : answerRef.current;
    if (!target) return;

    const sel = window.getSelection();
    sel.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(target);
    sel.addRange(range);

    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);

    sel.removeAllRanges();
    target.focus();
    field === 'question' ? handleQuestionChange() : handleAnswerChange();
  };

  // Sync content to state
  const handleQuestionChange = () => {
    setNewCard(prev => ({ ...prev, question: DOMPurify.sanitize(questionRef.current.innerHTML) }));
  };
  const handleAnswerChange = () => {
    setNewCard(prev => ({ ...prev, answer: DOMPurify.sanitize(answerRef.current.innerHTML) }));
  };

  // Prefill when editing
  useEffect(() => {
    if (editCard && questionRef.current && answerRef.current) {
      questionRef.current.innerHTML = editCard.question;
      answerRef.current.innerHTML = editCard.answer;
      setNewCard({ ...editCard });
    } else if (!editCard && questionRef.current && answerRef.current) {
      questionRef.current.innerHTML = '';
      answerRef.current.innerHTML = '';
      setNewCard({ question: '', answer: '', category: '', difficulty: 'Medium' });
    }
  }, [editCard]);

  // Add or update card
  const handleCardUpdate = () => {
    if (!user) return;
    const updated = editCard
      ? cards.map(c => c.id === editCard.id
          ? { ...newCard, id: editCard.id, createdBy: user.id }
          : c)
      : [...cards, { ...newCard, id: Date.now(), createdBy: user.id }];
    setCards(updated);
    setEditCard(null);
    setNewCard({ question: '', answer: '', category: '', difficulty: 'Medium' });
    toast.success(editCard ? 'Card updated!' : 'Card added!');
  };

  return (
    <div className="medical-questions-container">
      <header className="questions-header">
        <h1><span className="header-icon">📚</span>Medical Knowledge Hub</h1>
        <div className="progress-indicator">
          <span className="current-card">{currentCardIndex + 1}</span>
          <span className="total-cards">/{cards.length}</span>
        </div>
      </header>

      <main className="flashcard-viewport">
        <button
          className="nav-button prev-button"
          onClick={() => navigateCard('prev')}
          disabled={currentCardIndex === 0}
          aria-label="Previous card"
        >
          <FaChevronLeft size={24} />
        </button>
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
                    onClick={e => { e.stopPropagation(); setEditCard(cards[currentCardIndex]); }}
                    aria-label="Edit card"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={e => {
                      e.stopPropagation();
                      setCards(prev => prev.filter((_, i) => i !== currentCardIndex));
                      setCurrentCardIndex(prev => Math.max(0, prev - 1));
                    }}
                    aria-label="Delete card"
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
        <button
          className="nav-button next-button"
          onClick={() => navigateCard('next')}
          disabled={currentCardIndex === cards.length - 1}
          aria-label="Next card"
        >
          <FaChevronRight size={24} />
        </button>
      </main>

      <button
        className={`toggle-answer-button ${buttonAnimation}`}
        onClick={() => setShowAnswer(!showAnswer)}
        aria-label={showAnswer ? 'Hide answer' : 'Show answer'}
      >
        <FaStethoscope />
        {showAnswer ? 'Hide Clinical Answer' : 'Reveal Clinical Answer'}
      </button>

      {user ? (
        <section className="card-management">
          <div className="form-header">
            <h2>{editCard ? 'Edit Clinical Card' : 'Create New Medical Card'}</h2>
            <p className="form-subtitle">
              {editCard ? 'Update evidence-based medical content:' : 'Contribute to medical education:'}
            </p>
          </div>

          <div className="form-grid">
            {/* Question Editor */}
            <div className="form-group">
              <label>Clinical Scenario ✏️</label>
              <div className="text-editor-toolbar">
                <select
                  onChange={e => formatText('fontName', e.target.value, 'question')}
                  aria-label="Font Family"
                >
                  <option value="">Font</option>
                  <option value="Arial">Arial</option>
                  <option value="'Times New Roman'">Times New Roman</option>
                  <option value="Courier">Courier</option>
                </select>
                <select
                  onChange={e => formatText('fontSize', e.target.value, 'question')}
                  aria-label="Font Size"
                >
                  <option value="">Size</option>
                  {[1,2,3,4,5,6,7].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
                <input
                  type="color"
                  onChange={e => formatText('foreColor', e.target.value, 'question')}
                  aria-label="Text Color"
                />
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('bold', null, 'question'); }}
                  aria-label="Bold"
                ><strong>B</strong></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('italic', null, 'question'); }}
                  aria-label="Italic"
                ><em>I</em></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('underline', null, 'question'); }}
                  aria-label="Underline"
                ><u>U</u></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('insertUnorderedList', null, 'question'); }}
                  aria-label="Bullet list"
                >• List</button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('insertOrderedList', null, 'question'); }}
                  aria-label="Numbered list"
                >1. List</button>
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    const url = prompt('Enter URL:');
                    url && formatText('createLink', url, 'question');
                  }}
                  aria-label="Insert link"
                >Link</button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); clearFormatting('question'); }}
                  aria-label="Clear all styles"
                  title="Clear all inline styles and links"
                >Clear All Styles</button>
              </div>
              <div
                ref={questionRef}
                className="editable-content"
                contentEditable
                style={{
                  minHeight: '150px',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                onInput={handleQuestionChange}
                suppressContentEditableWarning={true}
                aria-label="Question editor"
              />
            </div>

            {/* Answer Editor */}
            <div className="form-group">
              <label>Evidence-Based Analysis 📚</label>
              <div className="text-editor-toolbar">
                <select
                  onChange={e => formatText('fontName', e.target.value, 'answer')}
                  aria-label="Font Family"
                >
                  <option value="">Font</option>
                  <option value="Arial">Arial</option>
                  <option value="'Times New Roman'">Times New Roman</option>
                  <option value="Courier">Courier</option>
                </select>
                <select
                  onChange={e => formatText('fontSize', e.target.value, 'answer')}
                  aria-label="Font Size"
                >
                  <option value="">Size</option>
                  {[1,2,3,4,5,6,7].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
                <input
                  type="color"
                  onChange={e => formatText('foreColor', e.target.value, 'answer')}
                  aria-label="Text Color"
                />
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('bold', null, 'answer'); }}
                  aria-label="Bold"
                ><strong>B</strong></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('italic', null, 'answer'); }}
                  aria-label="Italic"
                ><em>I</em></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('underline', null, 'answer'); }}
                  aria-label="Underline"
                ><u>U</u></button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('insertUnorderedList', null, 'answer'); }}
                  aria-label="Bullet list"
                >• List</button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); formatText('insertOrderedList', null, 'answer'); }}
                  aria-label="Numbered list"
                >1. List</button>
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    const url = prompt('Enter URL:');
                    url && formatText('createLink', url, 'answer');
                  }}
                  aria-label="Insert link"
                >Link</button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); clearFormatting('answer'); }}
                  aria-label="Clear all styles"
                  title="Clear all inline styles and links"
                >Clear All Styles</button>
              </div>
              <div
                ref={answerRef}
                className="editable-content"
                contentEditable
                style={{
                  minHeight: '150px',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                onInput={handleAnswerChange}
                suppressContentEditableWarning={true}
                aria-label="Answer editor"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="form-group specialty-select">
              <label>Medical Specialty 🏥</label>
              <div className="select-wrapper">
                <select
                  value={newCard.category}
                  onChange={e => setNewCard({ ...newCard, category: e.target.value })}
                  aria-label="Select medical specialty"
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
                  onClick={() => setNewCard({ ...newCard, difficulty: 'Easy' })}
                  aria-label="Easy difficulty"
                >👨⚕️ Medical Student</button>
                <button
                  type="button"
                  className={`difficulty-option ${newCard.difficulty === 'Medium' ? 'active' : ''}`}
                  onClick={() => setNewCard({ ...newCard, difficulty: 'Medium' })}
                  aria-label="Medium difficulty"
                >👨⚕️ Resident Level</button>
                <button
                  type="button"
                  className={`difficulty-option ${newCard.difficulty === 'Hard' ? 'active' : ''}`}
                  onClick={() => setNewCard({ ...newCard, difficulty: 'Hard' })}
                  aria-label="Hard difficulty"
                >👨⚕️ Attending Level</button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            {editCard && (
              <button
                className="secondary-button"
                onClick={() => setEditCard(null)}
                aria-label="Discard changes"
              >
                Discard Changes
              </button>
            )}
            <button
              className="primary-button"
              onClick={handleCardUpdate}
              disabled={!newCard.question || !newCard.answer}
              aria-label={editCard ? 'Update card' : 'Create new card'}
            >
              {editCard ? 'Update Medical Card' : 'Publish Clinical Case'} 📌
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
