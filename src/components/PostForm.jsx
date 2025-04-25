import React, { useRef, useState, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, 
  FaLink, FaStethoscope, FaSave, FaFont, FaPalette
} from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';

const useEditorFormatter = (editorRef) => {
  const format = (formatType, value = null) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    
    // Handle different formatting types
    switch (formatType) {
      case 'bold':
        toggleInlineStyle(range, 'fontWeight', 'bold');
        break;
      case 'italic':
        toggleInlineStyle(range, 'fontStyle', 'italic');
        break;
      case 'underline':
        toggleInlineStyle(range, 'textDecoration', 'underline');
        break;
      case 'list':
        toggleList(range, value === 'ordered' ? 'ol' : 'ul');
        break;
      case 'link':
        createLink(range, value);
        break;
      case 'font':
        applyFont(range, value);
        break;
      case 'color':
        applyColor(range, value);
        break;
      case 'clear':
        clearFormatting(range);
        break;
    }
  };

  // Helper functions
  const toggleInlineStyle = (range, style, value) => {
    const span = document.createElement('span');
    span.style[style] = value;
    span.style.direction = 'ltr';
    span.style.textAlign = 'left';
    span.style.unicodeBidi = 'plaintext';
    applyFormat(range, span);
  };

  const toggleList = (range, listType) => {
    const list = document.createElement(listType);
    const li = document.createElement('li');
    li.style.direction = 'ltr';
    li.style.textAlign = 'left';
    li.appendChild(range.extractContents());
    list.appendChild(li);
    range.insertNode(list);
  };

  const createLink = (range, href) => {
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.style.direction = 'ltr';
    a.style.textAlign = 'left';
    a.appendChild(range.extractContents());
    range.insertNode(a);
  };

  const applyFont = (range, font) => {
    const span = document.createElement('span');
    span.style.fontFamily = font;
    span.style.direction = 'ltr';
    span.style.textAlign = 'left';
    applyFormat(range, span);
  };

  const applyColor = (range, color) => {
    const span = document.createElement('span');
    span.style.color = color;
    span.style.direction = 'ltr';
    span.style.textAlign = 'left';
    applyFormat(range, span);
  };

  const clearFormatting = (range) => {
    const text = range.extractContents().textContent;
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
  };

  const applyFormat = (range, element) => {
    element.appendChild(range.extractContents());
    range.insertNode(element);
  };

  return { format };
};

const PostForm = ({ post, onSubmit, isEditMode, loading }) => {
  const editorRef = useRef(null);
  const { format } = useEditorFormatter(editorRef);

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
        // Ensure initial direction is set
        editorRef.current.style.direction = 'ltr';
        editorRef.current.style.textAlign = 'left';
        editorRef.current.style.unicodeBidi = 'plaintext';
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

  const insertMedicalTerm = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'medical-term';
      span.style.direction = 'ltr';
      span.style.textAlign = 'left';
      span.style.unicodeBidi = 'plaintext';
      span.textContent = selection.toString();
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
              onChange={(e) => format('font', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="Georgia">Georgia</option>
            </select>

            <input
              type="color"
              className="color-picker"
              onChange={(e) => format('color', e.target.value)}
            />

            <button type="button" onClick={() => format('bold')}>
              <FaBold />
            </button>
            <button type="button" onClick={() => format('italic')}>
              <FaItalic />
            </button>
            <button type="button" onClick={() => format('underline')}>
              <FaUnderline />
            </button>
            <button type="button" onClick={() => format('list', 'unordered')}>
              <FaListUl />
            </button>
            <button type="button" onClick={() => format('list', 'ordered')}>
              <FaListOl />
            </button>
            <button type="button" onClick={() => format('link', prompt('Enter URL:'))}>
              <FaLink />
            </button>
            <button type="button" onClick={insertMedicalTerm}>
              <FaStethoscope />
            </button>
            <button type="button" onClick={() => format('clear')}>
              <MdFormatClear />
            </button>
          </div>
          <div
            className="editor-content"
            ref={editorRef}
            contentEditable
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'plaintext',
              minHeight: '300px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem'
            }}
            onInput={handleEditorChange}
            dangerouslySetInnerHTML={{ __html: formData.content }}
            suppressContentEditableWarning={true}
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