import React, { useRef, useState, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, 
  FaStethoscope, FaSave, FaHeart, FaTimes, FaFont } from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';
import DOMPurify from 'dompurify';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import '../index.css';

const medicalSpecialties = [
  { name: 'General Medicine', color: '#4CAF50', icon: '🩺' },
  { name: 'Radiology', color: '#9C27B0', icon: '📷' },
  { name: 'Cardiology', color: '#F44336', icon: '❤️' },
  { name: 'Neurology', color: '#3F51B5', icon: '🧠' },
  { name: 'Oncology', color: '#FF5722', icon: '🦠' },
  { name: 'Pediatrics', color: '#FFC107', icon: '👶' },
  { name: 'Orthopedics', color: '#795548', icon: '🦴' },
  { name: 'Dermatology', color: '#FF9800', icon: '👩⚕️' },
  { name: 'Gastroenterology', color: '#8BC34A', icon: '🍏' },
  { name: 'Endocrinology', color: '#E91E63', icon: '⚖️' },
  { name: 'Pulmonology', color: '#00BCD4', icon: '🌬️' },
  { name: 'Nephrology', color: '#673AB7', icon: '💧' },
  { name: 'Hematology', color: '#F44336', icon: '🩸' },
  { name: 'Rheumatology', color: '#FF7043', icon: '🦵' },
  { name: 'Infectious Diseases', color: '#CDDC39', icon: '🦠' },
  { name: 'Emergency Medicine', color: '#F44336', icon: '🚑' },
  { name: 'Family Medicine', color: '#4CAF50', icon: '👪' },
  { name: 'Psychiatry', color: '#9C27B0', icon: '🧠' },
  { name: 'Obstetrics/Gynecology', color: '#E91E63', icon: '🤰' },
  { name: 'Urology', color: '#3F51B5', icon: '🚹' },
  { name: 'Ophthalmology', color: '#00BCD4', icon: '👁️' },
  { name: 'Otolaryngology', color: '#795548', icon: '👂' },
  { name: 'Anesthesiology', color: '#607D8B', icon: '💉' },
  { name: 'Pathology', color: '#9E9E9E', icon: '🔬' }
];

const PostForm = ({ post, onSubmit, isEditMode, loading }) => {
  const editorRef = useRef(null);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    raw_content: '',
    post_category: 'General Medicine',
    is_peer_reviewed: false,
    image_url: '',
    post_type: 'Discussion',
    urgency_level: 0,
    medical_references: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        raw_content: post.raw_content || '',
        post_category: post.post_category?.name || 'General Medicine',
        is_peer_reviewed: post.is_peer_reviewed || false,
        image_url: post.image_url || '',
        post_type: post.post_type || 'Discussion',
        urgency_level: post.urgency_level || 0,
        medical_references: post.medical_references || ''
      });
      if (editorRef.current) editorRef.current.innerHTML = post.content || '';
    }
    document.execCommand('styleWithCSS', false, true);
  }, [post]);

  const handleUpvote = async () => {
    const user = supabase.auth.user();
    if (!user) {
      setError('Please login to upvote');
      return;
    }

    try {
      if (hasUpvoted) {
        await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setUpvotes(prev => prev - 1);
      } else {
        await supabase
            .from('post_votes')
            .insert([{ 
              post_id: post.id, 
              user_id: user.id,
              direction: 1 
            }]);
        setUpvotes(prev => prev + 1);
      }
      setHasUpvoted(!hasUpvoted);
    } catch (err) {
      setError('Error updating vote');
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    setFormData(prev => ({
      ...prev,
      content: DOMPurify.sanitize(editorRef.current.innerHTML),
      raw_content: editorRef.current.innerText
    }));
  };

  const formatText = (cmd, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, value);
    handleEditorChange();
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    sel.addRange(range);
    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);
    sel.removeAllRanges();
    editorRef.current.focus();
    handleEditorChange();
  };

  const insertMedicalTerm = () => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const text = sel.toString();
    if (!text) return;
    
    const span = document.createElement('span');
    span.className = 'medical-term';
    span.textContent = text;
    
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    range.setStartAfter(span);
    sel.removeAllRanges();
    sel.addRange(range);
    handleEditorChange();
  };

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('post-attachments')
            .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('post-attachments')
            .getPublicUrl(data.path);

        return {
          type: file.type.split('/')[0],
          url: urlData.publicUrl,
          name: fileName
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
      
      uploadedFiles.forEach(file => {
        let html = '';
        if (file.type === 'image') {
          html = `<img src="${file.url}" alt="Uploaded content" class="uploaded-media" />`;
        } else if (file.type === 'video') {
          html = `<video controls class="uploaded-media"><source src="${file.url}" type="video/mp4"></video>`;
        }
        
        if (html && editorRef.current) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          editorRef.current.appendChild(range.createContextualFragment(html));
          handleEditorChange();
        }
      });

    } catch (err) {
      setError('File upload failed: ' + err.message);
    }
    e.target.value = null;
  };

  const insertMediaElement = (html, isVideo = false) => {
    const container = document.createElement('div');
    container.className = `media-container ${isVideo ? 'video-container' : ''}`;
    container.draggable = true;
    
    container.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'media');
      container.classList.add('dragging');
    });

    container.addEventListener('dragend', () => {
      container.classList.remove('dragging');
      handleEditorChange();
    });

    container.innerHTML = `
      <div class="media-handle">⣿⣿</div>
      ${html}
    `;

    if (editorRef.current) {
      editorRef.current.appendChild(container);
      handleEditorChange();
    }
  };

  const addUrlAttachment = () => {
    const url = formData.image_url.trim();
    if (!url) return;

    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const isVideo = videoExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
    
    setAttachments(prev => [
      ...prev, 
      { 
        type: isVideo ? 'video' : 'image', 
        url,
        name: url.split('/').pop() || 'external-media'
      }
    ]);

    if (editorRef.current) {
      if (isVideo) {
        insertMediaElement(`
          <video controls class="uploaded-media">
            <source src="${url}" type="video/${url.split('.').pop()}">
          </video>
          <div class="video-source">External Video</div>
        `, true);
      } else {
        insertMediaElement(`<img src="${url}" alt="External Image" class="zoomable-image" />`);
      }
    }

    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const removeAttachment = idx => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    const cleanContent = formData.content.replace(/<div><br><\/div>/g, '').trim();
    if (!cleanContent) {
      setError('Content is required');
      return;
    }
    
    onSubmit({ 
      ...formData,
      content: cleanContent,
      attachments 
    });
  };

  const getUrgencyColor = (value) => {
    if (value <= 3) return '#4CAF50';
    if (value <= 6) return '#FFC107';
    return '#F44336';
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="form-error">{error}</div>}

      {!isEditMode && post?.id && (
        <div className="upvote-section">
          <button
            type="button"
            onClick={handleUpvote}
            className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
            aria-label={hasUpvoted ? 'Remove upvote' : 'Upvote post'}
          >
            <FaHeart className="upvote-icon" />
            <span className="upvote-count">{upvotes}</span>
          </button>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          name="title"
          type="text"
          className="form-control"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter post title..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Medical Specialty</label>
        <div className="specialty-selector">
          <select
            name="post_category"
            value={formData.post_category}
            onChange={handleChange}
            className="form-control"
          >
            {medicalSpecialties.map(specialty => (
              <option key={specialty.name} value={specialty.name}>
                {specialty.icon} {specialty.name}
              </option>
            ))}
          </select>
          <div className="specialty-preview">
            <span className="specialty-icon">
              {medicalSpecialties.find(s => s.name === formData.post_category)?.icon}
            </span>
            <span 
              className="color-tag"
              style={{ 
                backgroundColor: medicalSpecialties.find(s => s.name === formData.post_category)?.color
              }}
            ></span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Content *</label>
      {/* Updated Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" onClick={() => formatText('bold')}><FaBold /></button>
          <button type="button" onClick={() => formatText('italic')}><FaItalic /></button>
          <button type="button" onClick={() => formatText('underline')}><FaUnderline /></button>
          <button type="button" onClick={() => formatText('insertunorderedlist')}><FaListUl /></button>
          <button type="button" onClick={() => formatText('insertorderedlist')}><FaListOl /></button>
          <button type="button" onClick={() => formatText('createLink', prompt('Enter URL:', 'https://'))}>
            <FaLink />
          </button>
          <button type="button" onClick={clearFormatting}><MdFormatClear /></button>
          <button type="button" onClick={insertMedicalTerm}><FaStethoscope /></button>
        </div>

        <div className="font-controls">
          <FaFont className="font-icon" />
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              formatText('fontName', e.target.value);
            }}
            className="font-selector"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
          </select>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value);
              formatText('foreColor', e.target.value);
            }}
            className="color-picker"
          />
        </div>
      </div>
        <div
          contentEditable
          ref={editorRef}
          onInput={handleEditorChange}
          className="editor-content"
          placeholder="Write your post here..."
        ></div>
      </div>

      <div className="form-group">
        <label className="form-label">Attach Media</label>
        <div className="attachment-controls">
          <input
            type="file"
            onChange={handleFileAttach}
            multiple
            className="form-control"
            accept="image/*, video/*, .pdf, .doc, .docx"
          />
            <input
              type="text"
              value={formData.image_url}
              onChange={handleChange}
              name="image_url"
              placeholder="Enter image or video URL"
              className="form-control"
            />
          </div>
            <div className="attachment-controls-a">
            <button 
              type="button" 
              onClick={addUrlAttachment} 
              className="btn btn-primary"
            >
              Add URL
            </button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="attachments">
          <h6>Attachments Preview:</h6>
          <div className="attachment-grid">
            {attachments.map((attachment, idx) => (
              <div key={idx} className="attachment-item">
                {attachment.type === 'image' ? (
                  <div className="attachment-image-container">
                    <img 
                      src={attachment.url} 
                      alt="Attachment" 
                      className="attachment-preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <div className="fallback">
                      <span className="file-name">{attachment.name}</span>
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                ) : attachment.type === 'video' ? (
                  <div className="video-attachment-preview">
                    <video controls className="attachment-preview">
                      <source src={attachment.url} type={`video/${attachment.url.split('.').pop()}`} />
                    </video>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-icon">📄</div>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      {attachment.name}
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  className="remove-attachment"
                  onClick={() => removeAttachment(idx)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Medical References</label>
        <textarea
          name="medical_references"
          value={formData.medical_references}
          onChange={handleChange}
          className="form-control"
          placeholder="Cite any medical references here (APA format recommended)..."
          rows="4"
        />
      </div>

      <div className="form-group urgency-group">
        <label className="form-label">Urgency Level</label>
        <div className="urgency-slider-container">
          <div className="urgency-header">
            <span className="urgency-label">Current Level:</span>
            <span 
              className="urgency-value-badge"
              style={{ backgroundColor: getUrgencyColor(formData.urgency_level) }}
            >
              {formData.urgency_level}
            </span>
          </div>
          <input
            name="urgency_level"
            type="range"
            min="0"
            max="10"
            className="urgency-slider"
            value={formData.urgency_level}
            onChange={handleChange}
            style={{
              background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 30%, #FFC107 30%, #FFC107 60%, #F44336 60%, #F44336 100%)`
            }}
          />
          <div className="urgency-labels">
            <span style={{ color: '#4CAF50' }}>Low (0-3)</span>
            <span style={{ color: '#FFC107' }}>Medium (4-6)</span>
            <span style={{ color: '#F44336' }}>High (7-10)</span>
          </div>
        </div>
      </div>

      {/* Updated Peer Review Section */}
      <div className="form-group peer-review-group">
        <div className="peer-review-content">
          <label className="peer-review-label">
            <input
              type="checkbox"
              name="is_peer_reviewed"
              checked={formData.is_peer_reviewed}
              onChange={handleChange}
              className="peer-review-checkbox"
            />
           
            <span className="peer-review-text">Peer Reviewed Content</span>
          </label>
          <small className="peer-review-hint">
            Check this if your content has been verified by medical professionals
          </small>
          
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          <FaSave /> {loading ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
};

PostForm.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    raw_content: PropTypes.string,
    post_category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string
      })
    ]),
    is_peer_reviewed: PropTypes.bool,
    image_url: PropTypes.string,
    post_type: PropTypes.string,
    urgency_level: PropTypes.number,
    medical_references: PropTypes.string,
    votes: PropTypes.array
  }),
  onSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  loading: PropTypes.bool
};

PostForm.defaultProps = {
  isEditMode: false,
  loading: false
};

export default PostForm;