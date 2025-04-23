// PostForm.jsx
import React, { useRef, useState, useEffect } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl,
  FaLink,
  FaStethoscope,
  FaSave
} from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';

const PostForm = ({ post, onSubmit, isEditMode, loading }) => {
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    rawContent: post?.rawContent || '',
    post_category: post?.post_category || 'General',
    is_peer_reviewed: post?.is_peer_reviewed || false,
    image_url: post?.image_url || '',
    post_type: post?.post_type || 'Discussion',
    urgency_level: post?.urgency_level || 0,
    medical_references: post?.medical_references || ''
  });

  const [error, setError] = useState('');

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
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }
    onSubmit(formData);
  };

  useEffect(() => {
    if (editorRef.current && post?.content) {
      editorRef.current.innerHTML = post.content;
    }
  }, [post]);

  return (
    <form onSubmit={handleSubmit} className="glass-panel">
      {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content *</label>
        <div className="editor-container">
          <div className="editor-toolbar">
            <button type="button" onClick={() => formatText('bold')} className="btn-icon">
              <FaBold />
            </button>
            <button type="button" onClick={() => formatText('italic')} className="btn-icon">
              <FaItalic />
            </button>
            <button type="button" onClick={() => formatText('underline')} className="btn-icon">
              <FaUnderline />
            </button>
            <button type="button" onClick={() => formatText('insertUnorderedList')} className="btn-icon">
              <FaListUl />
            </button>
            <button type="button" onClick={() => formatText('insertOrderedList')} className="btn-icon">
              <FaListOl />
            </button>
            <button type="button" onClick={() => formatText('createLink', prompt('Enter URL:'))} className="btn-icon">
              <FaLink />
            </button>
            <button type="button" onClick={insertMedicalTerm} className="btn-icon">
              <FaStethoscope />
            </button>
            <button type="button" onClick={() => formatText('removeFormat')} className="btn-icon">
              <MdFormatClear />
            </button>
          </div>
          <div
            className="editor-content"
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="post_category"
            value={formData.post_category}
            onChange={handleChange}
            className="form-control"
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
          <label className="form-label">Post Type *</label>
          <select
            name="post_type"
            value={formData.post_type}
            onChange={handleChange}
            className="form-control"
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
        <label className="form-label">Urgency Level: {formData.urgency_level}</label>
        <input
          type="range"
          name="urgency_level"
          min="0"
          max="5"
          value={formData.urgency_level}
          onChange={handleChange}
          className="form-range"
        />
      </div>

      <div className="form-group flex items-center gap-sm">
        <input
          type="checkbox"
          id="peer-reviewed"
          name="is_peer_reviewed"
          checked={formData.is_peer_reviewed}
          onChange={handleChange}
          className="form-checkbox"
        />
        <label htmlFor="peer-reviewed">Peer Reviewed Content</label>
      </div>

      <div className="form-group">
        <label className="form-label">Image URL (optional)</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Medical References (optional)</label>
        <textarea
          name="medical_references"
          value={formData.medical_references}
          onChange={handleChange}
          className="form-control"
          rows="3"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
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