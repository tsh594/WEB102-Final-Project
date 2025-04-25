import React, { useRef, useState, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaStethoscope, FaSave, FaHeart } from 'react-icons/fa';
import { MdFormatClear } from 'react-icons/md';
import DOMPurify from 'dompurify';
import { supabase } from '../config/supabase'; // Ensure you have Supabase set up.4
import { v4 as uuidv4 } from 'uuid';


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
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

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

// Update the handleFileAttach and add these new functions
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

      return {
        type: file.type.split('/')[0], // 'image', 'video', 'application', etc
        url: supabase.storage
          .from('post-attachments')
          .getPublicUrl(data.path).publicURL
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    setAttachments(prev => [...prev, ...uploadedFiles]);
    
    // Insert images/videos into editor
    uploadedFiles.forEach(file => {
      if (file.type === 'image') {
        const imgTag = `<img src="${file.url}" alt="Uploaded content" class="uploaded-media" />`;
        document.execCommand('insertHTML', false, imgTag);
      } else if (file.type === 'video') {
        const videoTag = `<video controls src="${file.url}" class="uploaded-media"></video>`;
        document.execCommand('insertHTML', false, videoTag);
      }
    });

  } catch (err) {
    setError('File upload failed: ' + err.message);
  }
  e.target.value = null;
};

  // Update the attachments rendering section
  <div className="attachments">
    {attachments.map((attachment, idx) => (
      <div key={idx} className="attachment-preview">
        {attachment.type === 'image' && (
          <img 
            src={attachment.url} 
            alt="Attachment preview" 
            className="preview-image"
          />
        )}
        {attachment.type === 'video' && (
          <video controls className="preview-video">
            <source src={attachment.url} type="video/mp4" />
          </video>
        )}
        {attachment.type === 'application' && (
          <div className="file-preview">
            <a 
              href={attachment.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View File
            </a>
          </div>
        )}
        <button
          type="button"
          className="remove-attachment"
          onClick={() => removeAttachment(idx)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  const addUrlAttachment = () => {
    const url = formData.image_url.trim();
    if (!url) return;
    
    setAttachments(prev => [
      ...prev, 
      { type: 'url', url }
    ]);
    setFormData(prev => ({ ...prev, image_url: '' }));

    // Insert image into editor content
    if (editorRef.current) {
      const imgTag = `<img src="${url}" alt="Image" class="zoomable-image" />`;
      editorRef.current.innerHTML += imgTag;  // Append image tag to content
      handleEditorChange();
    }
  };

  const removeAttachment = idx => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim() || formData.content === '<div><br></div>') {
      setError('Content is required');
      return;
    }
    onSubmit({ ...formData, attachments });
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="form-error">{error}</div>}

      {!isEditMode && (
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
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          name="post_category"
          value={formData.post_category}
          onChange={handleChange}
          className="form-control"
        >
          <option value="General">General</option>
          <option value="Medical">Medical</option>
          <option value="Technology">Technology</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Content *</label>
        <div className="editor-toolbar">
          <button type="button" onClick={() => formatText('bold')}><FaBold /></button>
          <button type="button" onClick={() => formatText('italic')}><FaItalic /></button>
          <button type="button" onClick={() => formatText('underline')}><FaUnderline /></button>
          <button type="button" onClick={() => formatText('insertunorderedlist')}><FaListUl /></button>
          <button type="button" onClick={() => formatText('insertorderedlist')}><FaListOl /></button>
          <button type="button" onClick={() => formatText('createLink')}><FaLink /></button>
          <button type="button" onClick={clearFormatting}><MdFormatClear /></button>
          <button type="button" onClick={insertMedicalTerm}><FaStethoscope /></button>
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
        <label className="form-label">Attach Image or File</label>
        <input
          type="file"
          onChange={handleFileAttach}
          multiple
          className="form-control"
        />
        <input
          type="text"
          value={formData.image_url}
          onChange={handleChange}
          name="image_url"
          placeholder="Enter image URL"
          className="form-control"
        />
        <button type="button" onClick={addUrlAttachment} className="btn btn-primary">
          Add Image
        </button>
      </div>

      <div className="attachments">
        {attachments.map((attachment, idx) => (
          <div key={idx} className="attachment">
            {attachment.type === 'file' ? (
              <span>{attachment.file.name}</span>
            ) : (
              <img src={attachment.url} alt="Attachment" className="attachment-image zoomable-image" />
            )}
            <button
              type="button"
              className="remove-attachment"
              onClick={() => removeAttachment(idx)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">Medical References</label>
        <textarea
          name="medical_references"
          value={formData.medical_references}
          onChange={handleChange}
          className="form-control"
          placeholder="Cite any medical references here..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Urgency Level</label>
        <input
          name="urgency_level"
          type="number"
          min="0"
          max="10"
          className="form-control"
          value={formData.urgency_level}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Peer Review</label>
        <input
          type="checkbox"
          name="is_peer_reviewed"
          checked={formData.is_peer_reviewed}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-success" disabled={loading}>
        <FaSave /> {loading ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  );
};

export default PostForm;
