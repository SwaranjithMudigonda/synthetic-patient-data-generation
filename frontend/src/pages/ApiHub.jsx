import React, { useState, useEffect } from 'react';
import { getApiKeys, createApiKey } from '../services/cohortService';
import { 
  Key, 
  Copy, 
  Check, 
  Plus, 
  Terminal, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ApiHub() {
  const [keys, setKeys] = useState([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await getApiKeys();
      if (Array.isArray(data)) setKeys(data);
    } catch {
      setKeys([
        {
          key_id: 'key_live_demo',
          label: 'Default Research Gateway Client',
          created_at: new Date().toISOString(),
          request_count: 18
        }
      ]);
    }
  };

  const handleCreateKey = async () => {
    setIsCreatingKey(true);
    try {
      const res = await createApiKey(newKeyLabel || 'Clinical Pipeline Client');
      if (res && res.api_key) {
        setCreatedRawKey(res.api_key);
        setNewKeyLabel('');
        loadKeys();
      }
    } catch (err) {
      alert(`Key generation failed: ${err.message}`);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apiBaseUrl = (import.meta.env && import.meta.env.VITE_BACKEND_URL)
    || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

  const curlExample = `curl -X POST "${apiBaseUrl}/api/v1/generate" \\
  -H "X-API-Key: ${createdRawKey || 'syn_live_your_api_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{"n": 1000, "targets": {"diabetes": 1, "age_gt": 60}}'`;

  const pythonExample = `import requests

url = "${apiBaseUrl}/api/v1/generate"
headers = {
    "X-API-Key": "${createdRawKey || 'syn_live_your_api_key_here'}",
    "Content-Type": "application/json"
}
payload = {
    "n": 1000,
    "targets": {"diabetes": 1, "age_gt": 60}
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Generated Cohort ID:", data["cohort_id"])`;

  const jsExample = `const response = await fetch('${apiBaseUrl}/api/v1/generate', {
  method: 'POST',
  headers: {
    'X-API-Key': '${createdRawKey || 'syn_live_your_api_key_here'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    n: 1000,
    targets: { diabetes: 1, age_gt: 60 }
  })
});

const data = await response.json();
console.log('Cohort ID:', data.cohort_id);`;

  return (
    <div className="wrap" style={{ padding: '3.5rem 2rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="label-tag" style={{ marginBottom: '0.6rem' }}>
          <span className="rule-dot"></span>
          <span>WORKSPACE 07 &mdash; PROGRAMMATIC DEVELOPER GATEWAY</span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 42px)', marginBottom: '0.75rem' }}>
          API Gateway & <span className="italic-serif">Developer Hub</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 740 }}>
          Generate authenticated REST API keys (<code className="mono">X-API-Key</code>) and integrate conditioned synthetic cohort sampling directly into external Python pipelines, research scripts, or clinical registries.
        </p>
      </div>

      {/* Section 1: API Key Management */}
      <div className="editorial-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <span className="label-tag">AUTHENTICATION KEYS (X-API-KEY)</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>RATE-LIMITED GATEWAY</span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Generate programmatic API keys for batch sampling and automated test suites.
        </p>

        {/* Generate Key Form */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-text"
            placeholder="Key Label (e.g. Clinical Trial Staging Client)..."
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            style={{ maxWidth: 360, height: 38 }}
          />
          <button
            onClick={handleCreateKey}
            disabled={isCreatingKey}
            className="btn btn-ink"
            style={{ height: 38, padding: '0 1.25rem' }}
          >
            <Plus size={14} />
            <span>{isCreatingKey ? 'Generating Key...' : 'Create API Key'}</span>
          </button>
        </div>

        {/* Created Key Box */}
        {createdRawKey && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 4,
            backgroundColor: 'var(--emerald-soft)',
            border: '1px solid #A7F3D0',
            color: 'var(--emerald)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>NEW API KEY GENERATED (STORE SECURELY):</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{createdRawKey}</div>
            </div>
            <button
              onClick={() => copyToClipboard(createdRawKey, 'new')}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.75rem', fontSize: 11.5 }}
            >
              {copiedIndex === 'new' ? <Check size={13} color="green" /> : <Copy size={13} />}
              <span>{copiedIndex === 'new' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Active Keys Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Key Identifier</th>
                <th>Client Label</th>
                <th>Created Timestamp</th>
                <th>Request Invocations</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k, idx) => (
                <tr key={k.key_id || idx}>
                  <td className="mono" style={{ fontWeight: 600 }}>{k.key_id}</td>
                  <td>{k.label}</td>
                  <td className="mono" style={{ fontSize: 11.5 }}>
                    {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="mono">{k.request_count || 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge-telemetry badge-telemetry-pass">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Interactive Code Snippets */}
      <div className="editorial-card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--hairline)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span className="label-tag">CODE SNIPPETS & CLIENT EXAMPLES</span>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Standard programmatic calls for automated generation
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--ivory-alt)', padding: 3, borderRadius: 3 }}>
            {['curl', 'python', 'javascript'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`btn ${activeCodeTab === tab ? 'btn-ink' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: 11.5, borderRadius: 2, textTransform: 'capitalize' }}
              >
                {tab === 'curl' ? 'cURL' : tab === 'python' ? 'Python' : 'JavaScript'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <pre style={{
            backgroundColor: 'var(--ink-black)',
            color: 'var(--ivory)',
            padding: '1.5rem',
            borderRadius: 4,
            overflowX: 'auto',
            fontSize: 12.5,
            lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', monospace",
            margin: 0,
            border: '1px solid var(--hairline-dark)'
          }}>
            {activeCodeTab === 'curl' ? curlExample : activeCodeTab === 'python' ? pythonExample : jsExample}
          </pre>

          <button
            onClick={() => copyToClipboard(
              activeCodeTab === 'curl' ? curlExample : activeCodeTab === 'python' ? pythonExample : jsExample,
              'code'
            )}
            className="btn btn-outline-dark"
            style={{ position: 'absolute', top: 12, right: 12, padding: '0.35rem 0.7rem', fontSize: 11.5 }}
          >
            {copiedIndex === 'code' ? <Check size={13} color="lime" /> : <Copy size={13} />}
            <span>{copiedIndex === 'code' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
