import React, { useRef, useState, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, 
  FaLink, FaStethoscope, FaSave 
} from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';

const PostForm = ({ post, onSubmit, isEditMode, loading }) => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rawContent: '',
    post_category: 'General',
    is_peer_reviewed: false,
    image_url: '',
    post_type: 'Discussion',
    urgency_level: 0,
    medical_references: ''
  });
  const [error, setError] = useState('');

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        rawContent: post.rawContent || '',
        post_category: post.post_category || 'General',
        is_peer_reviewed: post.is_peer_reviewed || false,
        image_url: post.image_url || '',
        post_type: post.post_type || 'Discussion',
        urgency_level: post.urgency_level || 0,
        medical_references: post.medical_references || ''
      });
      
      if (editorRef.current) {
        editorRef.current.innerHTML = post.content || '';
      }
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        content: editorRef.current.innerHTML,
        rawContent: editorRef.current.innerText
      }));
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorChange();
  };

  const insertMedicalTerm = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const span = document.createElement('span');
      span.className = 'medical-term';
      span.textContent = selection.toString();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      handleEditorChange();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim() || formData.content === '<div><br></div>') {
      setError('Content is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Content *</label>
        <div className="editor-container">
          <div className="editor-toolbar">
            <button type="button" onClick={() => formatText('bold')}>
              <FaBold />
            </button>
            <button type="button" onClick={() => formatText('italic')}>
              <FaItalic />
            </button>
            <button type="button" onClick={() => formatText('underline')}>
              <FaUnderline />
            </button>
            <button type="button" onClick={() => formatText('insertUnorderedList')}>
              <FaListUl />
            </button>
            <button type="button" onClick={() => formatText('insertOrderedList')}>
              <FaListOl />
            </button>
            <button type="button" onClick={() => formatText('createLink', prompt('Enter URL:'))}>
              <FaLink />
            </button>
            <button type="button" onClick={insertMedicalTerm}>
              <FaStethoscope />
            </button>
            <button type="button" onClick={() => formatText('removeFormat')}>
              <MdFormatClear />
            </button>
          </div>
          <div
            className="editor-content"
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            dangerouslySetInnerHTML={{ __html: formData.content }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            name="post_category"
            value={formData.post_category}
            onChange={handleChange}
            required
          >
            <option value="General">General</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Oncology">Oncology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Neurology">Neurology</option>
            <option value="Surgery">Surgery</option>
          </select>
        </div>

        <div className="form-group">
          <label>Post Type *</label>
          <select
            name="post_type"
            value={formData.post_type}
            onChange={handleChange}
            required
          >
            <option value="Discussion">Discussion</option>
            <option value="Case Study">Case Study</option>
            <option value="Research">Research</option>
            <option value="Question">Question</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Urgency Level: {formData.urgency_level}</label>
        <input
          type="range"
          name="urgency_level"
          min="0"
          max="5"
          value={formData.urgency_level}
          onChange={handleChange}
        />
      </div>

      <div className="form-checkbox">
        <input
          type="checkbox"
          id="peer-reviewed"
          name="is_peer_reviewed"
          checked={formData.is_peer_reviewed}
          onChange={handleChange}
        />
        <label htmlFor="peer-reviewed">Peer Reviewed Content</label>
      </div>

      <div className="form-group">
        <label>Image URL (optional)</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Medical References (optional)</label>
        <textarea
          name="medical_references"
          value={formData.medical_references}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        <FaSave />
        {loading ? (
          <span>{isEditMode ? 'Updating...' : 'Publishing...'}</span>
        ) : (
          <span>{isEditMode ? 'Update Post' : 'Publish Post'}</span>
        )}
      </button>
    </form>
  );
};

export default PostForm;