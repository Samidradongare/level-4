import React, { useState } from 'react';
import useSmartNotes from '../hooks/useSmartNotes';
import { BookOpen, Sparkles, Copy, Check, Info } from 'lucide-react';
import Card from './Card';
import Button from './Button';

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
      <Card
        style={{ height: 'fit-content' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>SmartNotes AI Summarizer</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.95rem' }}>Messy Study Notes / Lecture Transcripts</label>
            <textarea 
              className="form-textarea"
              style={{ minHeight: '220px', resize: 'vertical', lineHeight: '1.6', fontSize: '0.95rem', padding: '16px' }}
              placeholder="Paste raw lectures, messy study notes, or meeting transcripts here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', padding: '0 4px' }}>
              <span>Character count: {notes.length}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Estimated Cost: ~{costXlm.toFixed(3)} XLM</span>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Summarization Profile</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['balanced', 'bulleted', 'detailed'].map(profile => (
                <Button
                  key={profile}
                  type="button"
                  onClick={() => setStyle(profile)}
                  variant={style === profile ? 'primary' : 'secondary'}
                  style={{ flex: 1, padding: '12px 8px', textTransform: 'capitalize', fontSize: '0.9rem', fontWeight: 500 }}
                  disabled={loading}
                >
                  {profile}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              color: 'var(--error)',
              fontSize: '0.85rem',
              background: 'var(--error-glow)',
              border: '1px solid var(--error)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            style={{ padding: '16px', marginTop: '8px', fontSize: '1rem', width: '100%' }}
            disabled={loading || !notes.trim()}
            loading={loading}
          >
            <Sparkles size={18} style={{ marginRight: '6px' }} />
            <span>Generate Study Summary</span>
          </Button>
        </form>
      </Card>

      {/* Output panel */}
      {summary && (
        <Card
          style={{ height: 'fit-content' }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>AI Study Summary</span>
              </div>
              
              <Button 
                onClick={handleCopy}
                variant="secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {copied ? (
                  <>
                    <Check size={16} style={{ color: 'var(--success)', marginRight: '6px' }} />
                    <span style={{ color: 'var(--success)' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} style={{ marginRight: '6px' }} />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          }
        >
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            fontSize: '1rem',
            lineHeight: '1.7',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px',
            overflowY: 'auto',
            marginBottom: '20px',
          }}>
            {summary}
          </div>

          {sessionCost && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '16px',
            }}>
              <Info size={16} />
              <span>Summary generated. Billed {parseInt(sessionCost) / 10000000} XLM on-chain.</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SmartNotesInterface;
