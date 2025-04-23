import React, { useRef, useState, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, 
  FaLink, FaStethoscope, FaSave, FaFont, FaPalette
} from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';

const PostForm = ({ post, onSubmit, isEditMode, loading }) => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    raw_content: '',
    post_category: 'General',
    is_peer_reviewed: false,
    image_url: '',
    post_type: 'Discussion',
    urgency_level: 0,
    medical_references: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        raw_content: post.raw_content || '',
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
        raw_content: editorRef.current.innerText
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
        <label className="form-label">Title *</label>
        <input
          type="text"
          name="title"
          className="form-control"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content *</label>
        <div className="editor-container">
          <div className="editor-toolbar">
            <select 
              className="font-selector"
              onChange={(e) => formatText('fontName', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="Georgia">Georgia</option>
            </select>

            <input
              type="color"
              className="color-picker"
              onChange={(e) => formatText('foreColor', e.target.value)}
            />

            <button type="button" className="toolbar-button" onClick={() => formatText('bold')}>
              <FaBold />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('italic')}>
              <FaItalic />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('underline')}>
              <FaUnderline />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('insertUnorderedList')}>
              <FaListUl />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('insertOrderedList')}>
              <FaListOl />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('createLink', prompt('Enter URL:'))}>
              <FaLink />
            </button>
            <button type="button" className="toolbar-button" onClick={insertMedicalTerm}>
              <FaStethoscope />
            </button>
            <button type="button" className="toolbar-button" onClick={() => formatText('removeFormat')}>
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
          <label className="form-label">Category *</label>
          <select
            name="post_category"
            className="form-control"
            value={formData.post_category}
            onChange={handleChange}
            required
          >
            <option value="General">General</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Oncology">Oncology</option>
            <option value="Neurology">Neurology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Surgery">Surgery</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Radiology">Radiology</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Post Type *</label>
          <select
            name="post_type"
            className="form-control"
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Urgency Level</label>
          <div className="urgency-control">
            <input
              type="range"
              name="urgency_level"
              className="form-range"
              min="0"
              max="5"
              value={formData.urgency_level}
              onChange={handleChange}
            />
            <div className="urgency-level-display">
              Current Level: {formData.urgency_level}
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="peer-reviewed-control">
            <div className="form-checkbox">
              <label htmlFor="peer-reviewed" className="form-checkbox-label">
                Peer Reviewed Content
              </label>
              <input
                type="checkbox"
                id="peer-reviewed"
                className="form-checkbox-input"
                name="is_peer_reviewed"
                checked={formData.is_peer_reviewed}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Image URL (optional)</label>
        <input
          type="url"
          name="image_url"
          className="form-control"
          value={formData.image_url}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Medical References (optional)</label>
        <textarea
          name="medical_references"
          className="form-control"
          value={formData.medical_references}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        <FaSave className="btn-icon" />
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