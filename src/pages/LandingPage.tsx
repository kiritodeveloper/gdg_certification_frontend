import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Printer, LogIn, ShieldCheck, Download,
  Loader2, CheckCircle2, FileSearch, User, QrCode,
} from 'lucide-react';
import { certApi } from '../api';
import './LandingPage.css';

/* ═══════════════════════════════════════════════════════
   LANDING PAGE — Estilo siscert.ipelc.gob.bo
   3 opciones: Buscar/Verificar | Reimprimir | Ingresar
   ═══════════════════════════════════════════════════════ */

/* ── Types ─────────────────────────────────────────── */
interface CertInfo {
  nombre_completo: string;
  evento_nombre: string;
  fecha_emision: string;
  descripcion: string;
  codigo_verif: string;
}

export default function LandingPage() {
  return (
    <div className="lp-page">
      {/* ── Navbar ──────────────────────────────── */}
      <nav className="lp-navbar">
        <div className="lp-navbar-inner">
          <div className="lp-navbar-brand">
            <div className="lp-navbar-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M17 10.43V2H7v8.43c0 2.25 1.36 4.3 3.44 5.17l.56.23v2.85l-2 1.2v2.12l3-1.8 3 1.8v-2.12l-2-1.2v-2.85l.56-.23C15.64 14.73 17 12.68 17 10.43zm-5 4.07a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
              </svg>
            </div>
            <div className="lp-navbar-text">
              <span className="lp-navbar-title">Sistema de Certificados</span>
              <span className="lp-navbar-sub">Gestión y Verificación</span>
            </div>
          </div>
          <Link to="/login" className="lp-navbar-login">
            <LogIn size={16} />
            Ingresar
          </Link>
        </div>
      </nav>

      <div style={{ marginTop: 68 }}>
        {/* ── Hero Section ──────────────────────── */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <h1 className="lp-hero-title">Sistema de Certificación</h1>
            <p className="lp-hero-subtitle">
              Valide la autenticidad de los certificados emitidos, reimprima su documento o ingrese al sistema de gestión.
            </p>
          </div>
        </section>

        {/* ── Search / Verify Box ───────────────── */}
        <section className="lp-search-section">
          <div className="lp-search-box">
            <BuscarVerificarBox />
          </div>
        </section>

        {/* ── Action Cards ──────────────────────── */}
        <section className="lp-cards-section">
          <div className="lp-cards-grid">
            {/* Card: Reimprimir */}
            <ReimprimirCard />

            {/* Card: Ingresar al Sistema */}
            <div className="lp-action-card lp-card-login" onClick={() => window.location.href = '/login'}>
              <div className="lp-action-icon lp-action-icon--blue">
                <LogIn size={32} />
              </div>
              <h3 className="lp-action-title">Ingresar al Sistema</h3>
              <p className="lp-action-desc">
                Acceda al panel de administración para gestionar eventos, certificados y usuarios.
              </p>
              <span className="lp-action-btn lp-action-btn--blue">
                Ir al Login
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="lp-footer">
        <p>&copy; {new Date().getFullYear()} Sistema de Gestión de Certificados</p>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BUSCAR / VERIFICAR BOX (principal, sobre hero)
   ═══════════════════════════════════════════════════════ */
function BuscarVerificarBox() {
  const [tab, setTab] = useState<'buscar' | 'verificar'>('verificar');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<CertInfo & { id: number; email: string; enviado: boolean }>>([]);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    cert?: CertInfo;
    message?: string;
  } | null>(null);

  /* ── Verificar por codigo ────────────────────── */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    setLoading(true);
    setVerifyResult(null);
    try {
      const res = await certApi.publicActivateInfo(c);
      if (res.valid && res.certificate) {
        const cert = res.certificate as unknown as CertInfo;
        setVerifyResult({ valid: true, cert });
      } else {
        setVerifyResult({ valid: false, message: res.message || 'Certificado no encontrado' });
      }
    } catch {
      setVerifyResult({ valid: false, message: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Buscar por nombre/correo ────────────────── */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    setSearchResults([]);
    setMessage('');
    try {
      const res = await certApi.publicSearch(q);
      if (res.found && res.certificates) {
        setSearchResults(res.certificates as typeof searchResults);
      } else {
        setMessage(res.message || 'No se encontraron certificados');
      }
    } catch {
      setMessage('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  /* ── Descargar PDF ───────────────────────────── */
  const handleDownload = async (codigo: string) => {
    setDownloading(true);
    try {
      const resp = await fetch(certApi.publicActivateUrl(codigo));
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificado_${codigo}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setMessage('No se pudo generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  const resetVerify = () => {
    setVerifyResult(null);
    setCode('');
  };

  /* ── Resultado de verificación ───────────────── */
  if (verifyResult) {
    return (
      <div className="lp-verify-result">
        {verifyResult.valid && verifyResult.cert ? (
          <>
            <div className="lp-verify-badge lp-verify-badge--ok">
              <CheckCircle2 size={20} />
              <span>Certificado Válido y Auténtico</span>
            </div>
            <div className="lp-verify-details">
              <div className="lp-verify-row">
                <div className="lp-verify-cell">
                  <span className="lp-verify-label">Nombre Completo</span>
                  <span className="lp-verify-value">{verifyResult.cert.nombre_completo}</span>
                </div>
                <div className="lp-verify-cell">
                  <span className="lp-verify-label">Evento</span>
                  <span className="lp-verify-value">{verifyResult.cert.evento_nombre || '—'}</span>
                </div>
                <div className="lp-verify-cell">
                  <span className="lp-verify-label">Fecha Emisión</span>
                  <span className="lp-verify-value">{verifyResult.cert.fecha_emision}</span>
                </div>
                <div className="lp-verify-cell">
                  <span className="lp-verify-label">Código</span>
                  <span className="lp-verify-value lp-mono">{verifyResult.cert.codigo_verif}</span>
                </div>
              </div>
              {verifyResult.cert.descripcion && (
                <div className="lp-verify-cell lp-verify-cell--full">
                  <span className="lp-verify-label">Descripción</span>
                  <span className="lp-verify-value">{verifyResult.cert.descripcion}</span>
                </div>
              )}
            </div>
            <div className="lp-verify-actions">
              <button
                className="lp-btn-download"
                onClick={() => handleDownload(verifyResult.cert!.codigo_verif)}
                disabled={downloading}
              >
                {downloading ? <Loader2 size={18} className="lp-spin" /> : <Download size={18} />}
                Descargar Certificado (PDF)
              </button>
              <button className="lp-btn-retry" onClick={resetVerify}>
                Nueva Consulta
              </button>
            </div>
            <p className="lp-verify-note">
              <ShieldCheck size={14} />
              El sistema certifica que los datos mostrados fueron emitidos por nuestra plataforma.
            </p>
          </>
        ) : (
          <>
            <div className="lp-verify-badge lp-verify-badge--err">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
              <span>Certificado No Válido</span>
            </div>
            <p className="lp-verify-err-msg">{verifyResult.message}</p>
            <button className="lp-btn-retry" onClick={resetVerify}>
              Intentar de Nuevo
            </button>
          </>
        )}
      </div>
    );
  }

  /* ── Formulario principal ────────────────────── */
  return (
    <>
      {/* Tabs */}
      <div className="lp-search-tabs">
        <button
          className={`lp-search-tab ${tab === 'verificar' ? 'lp-search-tab--active' : ''}`}
          onClick={() => { setTab('verificar'); setMessage(''); setSearchResults([]); setSearched(false); }}
        >
          <QrCode size={16} />
          Verificar Certificado
        </button>
        <button
          className={`lp-search-tab ${tab === 'buscar' ? 'lp-search-tab--active' : ''}`}
          onClick={() => { setTab('buscar'); setMessage(''); setVerifyResult(null); }}
        >
          <FileSearch size={16} />
          Buscar por Nombre / Correo
        </button>
      </div>

      {tab === 'verificar' ? (
        /* ── Verificar Form ──────────────────── */
        <form onSubmit={handleVerify}>
          <label className="lp-search-label">
            <i><ShieldCheck size={16} /></i>
            VERIFICACIÓN DE CERTIFICADO
          </label>
          <div className="lp-search-input-row">
            <input
              type="text"
              className="lp-search-input lp-mono-input"
              placeholder="Ingrese el código del certificado..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <button type="submit" className="lp-search-btn" disabled={!code.trim() || loading}>
              {loading ? <Loader2 size={18} className="lp-spin" /> : <Search size={18} />}
              Validar
            </button>
          </div>
        </form>
      ) : (
        /* ── Buscar Form ──────────────────────── */
        <form onSubmit={handleSearch}>
          <label className="lp-search-label">
            <i><User size={16} /></i>
            BÚSQUEDA DE CERTIFICADO
          </label>
          <div className="lp-search-input-row">
            <input
              type="text"
              className="lp-search-input"
              placeholder="Ingrese nombre o correo electrónico..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="lp-search-btn" disabled={!query.trim() || loading}>
              {loading ? <Loader2 size={18} className="lp-spin" /> : <Search size={18} />}
              Buscar
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="lp-mini-loading">
          <Loader2 size={16} className="lp-spin" />
          <span>{tab === 'verificar' ? 'Verificando...' : 'Buscando...'}</span>
        </div>
      )}

      {/* Search Results */}
      {tab === 'buscar' && searched && !loading && message && (
        <div className="lp-mini-empty">
          <span>{message}</span>
        </div>
      )}

      {searchResults.length > 0 && !loading && (
        <div className="lp-search-results">
          <p className="lp-results-count">
            {searchResults.length} certificado{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
          </p>
          {searchResults.map((cert) => (
            <div key={cert.id} className="lp-search-result-item">
              <div className="lp-sr-info">
                <p className="lp-sr-name">{cert.nombre_completo}</p>
                <p className="lp-sr-event">{cert.evento_nombre || 'Sin evento'}</p>
                <p className="lp-sr-date">
                  {cert.fecha_emision}
                  {cert.enviado
                    ? <span className="lp-badge-ok">Enviado</span>
                    : <span className="lp-badge-warn">Pendiente</span>
                  }
                </p>
              </div>
              <button
                className="lp-btn-dl"
                onClick={() => handleDownload(cert.codigo_verif)}
                title="Descargar PDF"
                disabled={downloading}
              >
                {downloading ? <Loader2 size={16} className="lp-spin" /> : <Download size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   REIMPRIMIR CARD
   ═══════════════════════════════════════════════════════ */
function ReimprimirCard() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [mode, setMode] = useState<'form' | 'result'>('form');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setError('');
    setCertInfo(null);
    try {
      const res = await certApi.publicActivateInfo(c);
      if (res.valid && res.certificate) {
        setCertInfo(res.certificate as unknown as CertInfo);
        setMode('result');
      } else {
        setError(res.message || 'Código no encontrado');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certInfo) return;
    setDownloading(true);
    try {
      const resp = await fetch(certApi.publicActivateUrl(certInfo.codigo_verif));
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificado_${certInfo.nombre_completo.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('No se pudo generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setMode('form');
    setCode('');
    setCertInfo(null);
    setError('');
  };

  return (
    <div className="lp-action-card lp-card-print">
      <div className="lp-action-icon lp-action-icon--red">
        <Printer size={32} />
      </div>
      <h3 className="lp-action-title">Reimprimir Certificado</h3>
      <p className="lp-action-desc">
        ¿Ya tiene su código? Ingréselo para volver a descargar e imprimir su certificado en PDF.
      </p>

      {mode === 'result' && certInfo ? (
        <div className="lp-reprint-result">
          <p className="lp-reprint-name">{certInfo.nombre_completo}</p>
          <p className="lp-reprint-event">{certInfo.evento_nombre || '—'}</p>
          <button
            className="lp-action-btn lp-action-btn--red"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? <><Loader2 size={16} className="lp-spin" /> Generando...</> : <><Download size={16} /> Descargar PDF</>}
          </button>
          <button className="lp-link-sm" onClick={reset}>
            Nueva consulta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="lp-reprint-form">
          <input
            type="text"
            className="lp-reprint-input lp-mono-input"
            placeholder="Ingrese su código..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
          />
          {error && <p className="lp-reprint-error">{error}</p>}
          <button type="submit" className="lp-action-btn lp-action-btn--red" disabled={!code.trim() || loading}>
            {loading ? <><Loader2 size={16} className="lp-spin" /> Buscando...</> : <><Printer size={16} /> Buscar y Reimprimir</>}
          </button>
        </form>
      )}
    </div>
  );
}