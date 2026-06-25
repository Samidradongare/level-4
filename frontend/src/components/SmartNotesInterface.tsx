import React, { useState } from 'react';
import useSmartNotes from '../hooks/useSmartNotes';
import { BookOpen, Sparkles, Copy, Check, Info } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SmartNotesInterfaceProps {
  onSummaryGenerated: () => void;
}

export const SmartNotesInterface: React.FC<SmartNotesInterfaceProps> = ({ onSummaryGenerated }) => {
  const [notes, setNotes] = useState<string>('');
  const [style, setStyle] = useState<string>('balanced');
  const [summary, setSummary] = useState<string | null>(null);
  
  const { generateSummary, loading, error } = useSmartNotes();
  const [copied, setCopied] = useState<boolean>(false);
  const [sessionCost, setSessionCost] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    try {
      const data = await generateSummary(notes, style);
      setSummary(data.summary);
      setSessionCost(data.cost_stroops);
      onSummaryGenerated(); // Notify parent to refresh balance / logs
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const costXlm = notes.trim().length > 0 
    ? (5000000 + Math.floor(notes.length / 1000) * 100) / 10000000
    : 0.5;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: summary ? '1fr 1fr' : '1fr', gap: '24px', width: '100%' }}>
      
      {/* Input panel */}
      <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: 'var(--primary)' }} />
          <span>SmartNotes AI Summarizer</span>
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Messy Study Notes / Lecture Transcripts</label>
            <textarea 
              className="form-textarea"
              style={{ minHeight: '220px', resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Paste raw lectures, messy study notes, or meeting transcripts here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Character count: {notes.length}</span>
              <span>Estimated Cost: ~{costXlm.toFixed(3)} XLM</span>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Summarization Profile</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['balanced', 'bulleted', 'detailed'].map(profile => (
                <button
                  key={profile}
                  type="button"
                  onClick={() => setStyle(profile)}
                  className={`btn ${style === profile ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', textTransform: 'capitalize', fontSize: '0.85rem' }}
                  disabled={loading}
                >
                  {profile}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              color: 'var(--error)',
              fontSize: '0.8rem',
              background: 'var(--error-glow)',
              border: '1px solid var(--error)',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '12px' }}
            disabled={loading || !notes.trim()}
          >
            {loading ? (
              <LoadingSpinner size="sm" label="Generating summary..." />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Study Summary</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output panel */}
      {summary && (
        <div className="glass-panel" style={{ 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'fit-content',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--success)' }} />
              <span>AI Study Summary</span>
            </h3>
            
            <button 
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {copied ? (
                <>
                  <Check size={14} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            maxHeight: '340px',
            overflowY: 'auto',
            marginBottom: '16px',
          }}>
            {summary}
          </div>

          {sessionCost && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '12px',
            }}>
              <Info size={14} />
              <span>Summary generated. Billed {parseInt(sessionCost) / 10000000} XLM on-chain.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SmartNotesInterface;
