import { useState } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { apiUpload, apiFetch } from '../../api/api';
import { LIMITS, validateFile } from '../../utils/validation';

const fmtMB = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

const ResumeUpload = ({ currentUrl, currentFilename, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onSelect = (e) => {
    setError(null);
    const picked = e.target.files?.[0];
    if (!picked) return;
    const msg = validateFile(picked, {
      maxBytes: LIMITS.resumeBytes,
      mimes: LIMITS.resumeMimes
    });
    if (msg) {
      setError(msg);
      return;
    }
    setFile(picked);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await apiUpload('users/uploads/resume', file);
      setFile(null);
      onUploaded?.(res.file);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Remove the current resume? You can upload a new one anytime.')) return;
    try {
      const current = await apiFetch('users/uploads/current/resume');
      if (current?.file?.id) {
        await apiFetch(`users/uploads/${current.file.id}`, { method: 'DELETE' });
        onUploaded?.(null);
      }
    } catch (err) {
      setError(err.message || 'Remove failed');
    }
  };

  if (currentUrl) {
    return (
      <div className="uploaded-file">
        <FileText className="upload-icon" size={32} />
        <div className="uploaded-file-info">
          <h4>{currentFilename || 'Resume uploaded'}</h4>
          <p>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer">
              View current resume
            </a>
          </p>
        </div>
        <button type="button" className="remove-file-btn" onClick={remove} aria-label="Remove resume">
          <Trash2 size={16} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div className="resume-upload-section">
      <Upload className="upload-icon" />
      <h3 className="upload-title">Upload your resume</h3>
      <p className="upload-subtitle">
        PDF, DOC, or DOCX · max {fmtMB(LIMITS.resumeBytes)}
      </p>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onSelect}
        style={{ display: 'none' }}
        id="resume-upload"
      />
      <label htmlFor="resume-upload" className="upload-button">
        Choose file
      </label>
      {file && (
        <div className="upload-staged">
          <p>
            Selected: {file.name} ({fmtMB(file.size)})
          </p>
          <button type="button" onClick={upload} disabled={uploading} className="btn btn-primary">
            {uploading ? 'Uploading…' : 'Upload resume'}
          </button>
        </div>
      )}
      {error && <div className="error-message" role="alert">{error}</div>}
    </div>
  );
};

export default ResumeUpload;
