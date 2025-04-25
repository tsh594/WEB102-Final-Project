import { useState, useEffect } from 'react';
import { FaSearch, FaBookMedical, FaInfoCircle, FaRegSadTear, FaExternalLinkAlt, FaCopy } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';

const MedicalFlashcardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);
  const [detailedLoading, setDetailedLoading] = useState(false);

  const searchConditions = async (query) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      if (data?.[3]) {
        const formattedResults = data[3].map((term, index) => ({
          id: index,
          name: term[0],
          synonyms: term[1] || [],
          codes: term[2] || []
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Failed to load medical conditions');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWikipediaSummary = async (termName) => {
    try {
      setDetailedLoading(true);
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termName)}`
      );
      
      if (!response.ok) throw new Error('No Wikipedia summary available');
      
      const data = await response.json();
      return {
        summary: data.extract,
        image: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page
      };
    } catch (error) {
      console.error('Wikipedia API Error:', error);
      return null;
    } finally {
      setDetailedLoading(false);
    }
  };

  const handleTermClick = async (term) => {
    setSelectedTerm(term);
    const wikiData = await fetchWikipediaSummary(term.name);
    setDetailedInfo(wikiData);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      const debounceTimer = setTimeout(() => {
        searchConditions(searchTerm.trim());
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  return (
    <div className="medical-references">
      <header className="medical-references-header">
        <h1>
          <FaBookMedical className="header-icon" />
          Medical Reference Library
        </h1>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search medical conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <ClipLoader className="loading-spinner" size={20} />}
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <FaRegSadTear className="error-icon" />
          {error}
        </div>
      )}

      <div className="results-grid">
        {results.map((term) => (
          <article 
            key={term.id}
            className="medical-card"
            onClick={() => handleTermClick(term)}
          >
            <div className="card-header">
              <h3>{term.name}</h3>
              <FaInfoCircle className="info-icon" />
            </div>
            
            {term.synonyms.length > 0 && (
              <div className="synonyms-list">
                <h4>Also known as:</h4>
                <ul>
                  {term.synonyms.slice(0, 3).map((synonym, index) => (
                    <li key={index}>{synonym}</li>
                  ))}
                </ul>
              </div>
            )}

            {term.codes.length > 0 && (
              <div className="medical-codes">
                <h4>Medical Codes:</h4>
                <div className="codes-container">
                  {term.codes.slice(0, 3).map((code, index) => (
                    <span key={index} className="code-badge">{code}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {results.length === 0 && searchTerm.length > 2 && !loading && (
        <div className="empty-state">
          <FaRegSadTear className="empty-icon" />
          <p>No results found for "{searchTerm}"</p>
        </div>
      )}

      {selectedTerm && (
        <div className="modal-overlay">
          <div className="medical-modal">
            <button
              className="modal-close"
              onClick={() => {
                setSelectedTerm(null);
                setDetailedInfo(null);
              }}
            >
              &times;
            </button>
            
            <div className="modal-content">
              {detailedInfo?.image && (
                <img 
                  src={detailedInfo.image} 
                  alt={selectedTerm.name}
                  className="modal-image"
                />
              )}
              
              <div className="modal-main">
                <h2>{selectedTerm.name}</h2>
                
                <div className="action-buttons">
                  <button
                    onClick={() => copyToClipboard(selectedTerm.name)}
                    className="copy-button"
                  >
                    <FaCopy /> Copy Name
                  </button>
                  
                  {detailedInfo?.url && (
                    <a
                      href={detailedInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      <FaExternalLinkAlt /> Wikipedia
                    </a>
                  )}
                </div>

                {selectedTerm.codes.length > 0 && (
                  <div className="modal-codes">
                    <h3>Medical Codes</h3>
                    <div className="codes-container">
                      {selectedTerm.codes.map((code, index) => (
                        <span key={index} className="code-badge">{code}</span>
                      ))}
                    </div>
                  </div>
                )}

                {detailedLoading ? (
                  <div className="loading-state">
                    <ClipLoader className="loading-spinner" size={24} />
                    <p>Loading medical details...</p>
                  </div>
                ) : (
                  <>
                    {detailedInfo?.summary ? (
                      <div className="medical-description">
                        <h3>Description</h3>
                        <p>{detailedInfo.summary}</p>
                      </div>
                    ) : (
                      <div className="no-description">
                        No detailed description available
                      </div>
                    )}

                    {selectedTerm.synonyms.length > 0 && (
                      <div className="modal-synonyms">
                        <h3>Also Known As</h3>
                        <div className="synonyms-container">
                          {selectedTerm.synonyms.map((synonym, index) => (
                            <span key={index} className="synonym-badge">{synonym}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalFlashcardsPage;