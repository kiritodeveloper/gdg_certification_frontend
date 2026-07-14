import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Download, FileCheck, ShieldCheck, ArrowLeft,
  Loader2, User,
} from 'lucide-react';
import { certApi } from '../api';
import './VerCertificadoPage.css';

/* ── Types ─────────────────────────────────────────── */
interface CertResult {
  id: number;
  nombre_completo: string;
  email: string;
  evento_id: number;
  evento_nombre: string;
  fecha_emision: string;
  descripcion: string;
  codigo_verif: string;
  enviado: boolean;
}

/* ── Page ──────────────────────────────────────────── */
type Tab = 'buscar' | 'activar';

export default function VerCertificadoPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('buscar');

  useEffect(() => {
    if (code && code.trim()) setTab('activar');
  }, [code]);

  return (
    <div className="ver-bg">
      {/* Background gradient */}
      <div className="ver-bg-gradient" />

      {/* Animated bubbles */}
      <div className="ver-bubble ver-bubble-1" />
      <div className="ver-bubble ver-bubble-2" />

      {/* Admin button */}
      <Link to="/login" className="ver-admin-btn" title="Panel de Administración">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </Link>

      {/* Main container */}
      <div className="ver-container">
        <div className="ver-card">
          {/* Header */}
          <header className="ver-header">
            <div className="ver-badge-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M17 10.43V2H7v8.43c0 2.25 1.36 4.3 3.44 5.17l.56.23v2.85l-2 1.2v2.12l3-1.8 3 1.8v-2.12l-2-1.2v-2.85l.56-.23C15.64 14.73 17 12.68 17 10.43zm-5 4.07a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
              </svg>
            </div>
            <h1>Ver Certificado</h1>
            <p className="ver-subtitle">
              Busca tu certificado o actívalo con tu código para descargarlo.
            </p>
          </header>

          {/* Tabs */}
          <nav className="ver-tabs-nav">
            <button
              className={`ver-tab-btn ${tab === 'buscar' ? 'active' : ''}`}
              onClick={() => setTab('buscar')}
            >
              <span>1. Buscar</span>
            </button>
            <button
              className={`ver-tab-btn ${tab === 'activar' ? 'active' : ''}`}
              onClick={() => setTab('activar')}
            >
              <span>2. Activar por Código</span>
            </button>
          </nav>

          {/* Tab content */}
          <div className={`ver-tab-content ${tab === 'buscar' ? 'active' : ''}`}>
            <BuscarTab />
          </div>
          <div className={`ver-tab-content ${tab === 'activar' ? 'active' : ''}`}>
            <ActivarTab initialCode={code} navigate={navigate} />
          </div>

          {/* Footer */}
          <div className="ver-footer">
            <Link to="/" className="ver-link">
              <ArrowLeft size={14} /> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 1: BUSCAR POR NOMBRE O EMAIL
   ═══════════════════════════════════════════════════════ */
function BuscarTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CertResult[]>([]);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setMessage('');
    try {
      const res = await certApi.publicSearch(q);
      if (res.found && res.certificates) {
        setResults(res.certificates);
      } else {
        setMessage(res.message || 'No se encontraron certificados');
      }
    } catch {
      setMessage('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert: CertResult) => {
    window.open(certApi.publicActivateUrl(cert.codigo_verif), '_blank');
  };

  return (
    <>
      <p className="ver-instructions">
        Escribe tu nombre o correo electrónico para encontrar y descargar tu certificado.
      </p>

      <form onSubmit={handleSearch}>
        <div className="ver-search-row">
          <div className="ver-input-group">
            <label>Nombre o Correo Electrónico</label>
            <input
              type="text"
              placeholder="Ej: María García o maria@ejemplo.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="ver-search-btn" disabled={!query.trim() || loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </div>
      </form>

      {/* Certificate Preview */}
      <div className="ver-cert-preview" style={{ marginTop: 24 }}>
        <div className="ver-preview-overlay">Vista Previa</div>
        <img src="/plantilla.png" alt="Plantilla de certificado" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="ver-loading">
          <div className="ver-spinner" />
          <p>Buscando certificados...</p>
        </div>
      )}

      {/* No results */}
      {searched && !loading && message && (
        <div className="ver-empty-box">
          <User size={28} />
          <p>{message}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="ver-results">
          <p className="ver-results-title">
            {results.length} certificado{results.length > 1 ? 's' : ''} encontrado{results.length > 1 ? 's' : ''}
          </p>
          <div className="ver-results-list">
            {results.map((cert) => (
              <div key={cert.id} className="ver-result-card">
                <div className="ver-result-info">
                  <p className="ver-result-name">{cert.nombre_completo}</p>
                  <p className="ver-result-event">
                    {cert.evento_nombre || 'Sin evento'}
                  </p>
                  <p className="ver-result-meta">
                    {cert.fecha_emision}
                    {cert.enviado ? (
                      <span className="ver-badge-enviado">Enviado</span>
                    ) : (
                      <span className="ver-badge-pendiente">Pendiente</span>
                    )}
                  </p>
                </div>
                <button
                  className="ver-dl-btn"
                  onClick={() => handleDownload(cert)}
                  title="Descargar PDF"
                >
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
          <p className="ver-hint">
            Presiona el botón verde para generar y descargar tu certificado en PDF.
          </p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 2: ACTIVAR POR CÓDIGO
   ═══════════════════════════════════════════════════════ */
function ActivarTab({ initialCode, navigate }: { initialCode?: string; navigate: (path: string) => void }) {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certInfo, setCertInfo] = useState<CertResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCode?.trim()) fetchInfo(initialCode.trim());
  }, [initialCode]);

  const fetchInfo = async (c: string) => {
    setLoading(true);
    setError('');
    setCertInfo(null);
    try {
      const res = await certApi.publicActivateInfo(c);
      if (res.valid && res.certificate) {
        setCertInfo(res.certificate as CertResult);
      } else {
        setError(res.message || 'Código inválido');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    navigate(`/ver-certificado/${c}`);
  };

  const handleDownload = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setDownloading(true);
    try {
      const url = certApi.publicActivateUrl(c);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificado_${(certInfo?.nombre_completo || 'certificado').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('No se pudo generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  /* ── Vista: resultado encontrado ──────────────────── */
  if (certInfo) {
    return (
      <div className="ver-success-box">
        <div className="ver-success-header">
          <ShieldCheck size={28} style={{ color: '#10b981' }} />
          <div>
            <p className="ver-success-title">Certificado encontrado</p>
            <p className="ver-success-code">{certInfo.codigo_verif}</p>
          </div>
        </div>

        <div className="ver-info-grid">
          <div className="ver-info-item">
            <span className="ver-info-label">Nombre</span>
            <span className="ver-info-value">{certInfo.nombre_completo}</span>
          </div>
          <div className="ver-info-item">
            <span className="ver-info-label">Evento</span>
            <span className="ver-info-value">{certInfo.evento_nombre || '—'}</span>
          </div>
          <div className="ver-info-item">
            <span className="ver-info-label">Fecha</span>
            <span className="ver-info-value">{certInfo.fecha_emision}</span>
          </div>
          {certInfo.descripcion && (
            <div className="ver-info-item">
              <span className="ver-info-label">Descripción</span>
              <span className="ver-info-value">{certInfo.descripcion}</span>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="ver-cert-preview">
          <div className="ver-preview-overlay">Vista Previa</div>
          <img src="/plantilla.png" alt="Plantilla de certificado" />
        </div>

        <button className="ver-btn ver-btn-generate" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <><Loader2 size={20} className="animate-spin" /> Generando PDF...</>
          ) : (
            <><Download size={20} /> Descargar mi Certificado (PDF)</>
          )}
        </button>
        <p className="ver-hint">Tu certificado se genera con tu nombre al momento de descargar.</p>
      </div>
    );
  }

  /* ── Vista: cargando ──────────────────────────────── */
  if (loading) {
    return (
      <div className="ver-loading">
        <div className="ver-spinner" />
        <p>Verificando código...</p>
      </div>
    );
  }

  /* ── Vista: error ─────────────────────────────────── */
  if (error) {
    return (
      <div className="ver-error-box">
        <XCircleIcon size={28} />
        <p className="ver-error-title">Código no válido</p>
        <p className="ver-error-msg">{error}</p>
      </div>
    );
  }

  /* ── Vista: formulario de activación ──────────────── */
  return (
    <>
      <p className="ver-instructions">
        Ingresa el código de activación que recibiste por correo electrónico para descargar tu certificado.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="ver-input-group">
          <label>Código de Activación</label>
          <input
            type="text"
            className="ver-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CERT-XXXXXXXX-XXXX"
            autoFocus={!initialCode}
          />
        </div>
        <button type="submit" className="ver-btn ver-btn-primary" disabled={!code.trim() || loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
          Activar
        </button>
      </form>

      {/* Preview */}
      <div className="ver-cert-preview" style={{ marginTop: 24 }}>
        <div className="ver-preview-overlay">Vista Previa</div>
        <img src="/plantilla.png" alt="Plantilla de certificado" />
      </div>

      {/* Guide */}
      <div className="ver-guide">
        <h3 className="ver-guide-title">Cómo obtener tu código</h3>
        <div className="ver-steps">
          <div className="ver-step">
            <div className="ver-step-num">1</div>
            <p>Revisa tu <strong>bandeja de entrada</strong> y la carpeta de <strong>spam</strong>.</p>
          </div>
          <div className="ver-step">
            <div className="ver-step-num">2</div>
            <p>Busca el correo "<strong>Tu Certificado está Listo</strong>" y copia el código.</p>
          </div>
          <div className="ver-step">
            <div className="ver-step-num">3</div>
            <p>Pégalo arriba y presiona <strong>Activar</strong> para descargar tu PDF.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Small icon component ──────────────────────────── */
function XCircleIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}