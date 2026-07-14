import { useState } from 'react';
import { certApi } from '../api';
import type { PublicCertificate } from '../types';
import './PublicPortalPage.css';

export default function PublicPortalPage() {
  const [activeTab, setActiveTab] = useState<'prueba' | 'email'>('prueba');

  return (
    <div className="public-portal-bg">
      {/* Fondo decorativo */}
      <div className="portal-shape portal-shape-1" />
      <div className="portal-shape portal-shape-2" />
      <div className="portal-shape portal-shape-3" />

      <main className="portal-container">
        <div className="portal-glass-card">
          {/* Encabezado */}
          <header className="portal-header">
            <div className="portal-badge-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M17 10.43V2H7v8.43c0 2.25 1.36 4.3 3.44 5.17l.56.23v2.85l-2 1.2v2.12l3-1.8 3 1.8v-2.12l-2-1.2v-2.85l.56-.23C15.64 14.73 17 12.68 17 10.43zm-5 4.07a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
              </svg>
            </div>
            <h1 className="portal-title">Portal de Certificados</h1>
            <p className="portal-subtitle">Elige una opción para obtener tu certificado.</p>
          </header>

          {/* Pestañas */}
          <nav className="portal-tabs">
            <button
              className={`portal-tab ${activeTab === 'prueba' ? 'active' : ''}`}
              onClick={() => setActiveTab('prueba')}
            >
              <span>1. Prueba Rápida</span>
            </button>
            <button
              className={`portal-tab ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <span>2. Verificación por Correo</span>
            </button>
          </nav>

          {/* Tab 1: Prueba Rápida */}
          {activeTab === 'prueba' && <PruebaTab />}

          {/* Tab 2: Verificación por Correo */}
          {activeTab === 'email' && <EmailTab />}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 1: PRUEBA RÁPIDA
   ═══════════════════════════════════════════════════ */
function PruebaTab() {
  const [nombre, setNombre] = useState('');
  const [generando, setGenerando] = useState<'png' | 'pdf' | null>(null);

  const generarPDF = async () => {
    if (!nombre.trim()) return alert('Escribe tu nombre.');
    setGenerando('pdf');
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Fondo blanco
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, 'F');

      // Borde exterior
      doc.setDrawColor(26, 58, 92);
      doc.setLineWidth(0.8);
      doc.roundedRect(10, 10, 277, 190, 5, 5);

      // Borde interior dorado
      doc.setDrawColor(200, 164, 90);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, 15, 267, 180, 3, 3);

      // Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(26, 58, 92);
      doc.text('CERTIFICADO DE PARTICIPACION', 148.5, 40, { align: 'center' });

      // "Se certifica que"
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(85, 85, 85);
      doc.text('Se certifica que', 148.5, 65, { align: 'center' });

      // Nombre del participante
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(26, 58, 92);
      doc.text(nombre.trim().toUpperCase(), 148.5, 85, { align: 'center' });

      // Línea bajo nombre
      const nameW = doc.getTextWidth(nombre.trim().toUpperCase());
      doc.setDrawColor(200, 164, 90);
      doc.setLineWidth(0.5);
      doc.line(148.5 - nameW / 2 - 10, 89, 148.5 + nameW / 2 + 10, 89);

      // "ha participado exitosamente"
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(85, 85, 85);
      doc.text('ha participado exitosamente en el evento.', 148.5, 105, { align: 'center' });

      // Fecha
      const hoy = new Date().toISOString().split('T')[0];
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text(`Fecha de emision: ${hoy}`, 148.5, 125, { align: 'center' });

      // Modo prueba badge
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(230, 170, 50, 12, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('MODO PRUEBA', 255, 178, { align: 'center' });

      doc.save(`certificado_prueba_${nombre.trim().replace(/\s+/g, '_')}.pdf`);
    } catch {
      alert('Error: No se pudo generar el PDF. Asegúrate de tener conexión a internet para cargar jsPDF.');
    } finally {
      setGenerando(null);
    }
  };

  const generarPNG = async () => {
    if (!nombre.trim()) return alert('Escribe tu nombre.');
    setGenerando('png');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1417;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d')!;

      // Fondo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1417, 1000);

      // Borde exterior
      ctx.strokeStyle = '#1a3a5c';
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, 1387, 970);

      // Borde interior
      ctx.strokeStyle = '#c8a45a';
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 25, 1367, 950);

      // Título
      ctx.fillStyle = '#1a3a5c';
      ctx.font = 'bold 48px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICADO DE PARTICIPACION', 708, 120);

      // Subtítulo
      ctx.fillStyle = '#555555';
      ctx.font = '24px Inter, Arial, sans-serif';
      ctx.fillText('Se certifica que', 708, 210);

      // Nombre
      ctx.fillStyle = '#1a3a5c';
      ctx.font = 'bold 56px Inter, Arial, sans-serif';
      ctx.fillText(nombre.trim().toUpperCase(), 708, 290);

      // Línea
      const textW = ctx.measureText(nombre.trim().toUpperCase()).width;
      ctx.strokeStyle = '#c8a45a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(708 - textW / 2 - 20, 310);
      ctx.lineTo(708 + textW / 2 + 20, 310);
      ctx.stroke();

      // Descripción
      ctx.fillStyle = '#555555';
      ctx.font = '22px Inter, Arial, sans-serif';
      ctx.fillText('ha participado exitosamente en el evento.', 708, 370);

      // Fecha
      const hoy = new Date().toISOString().split('T')[0];
      ctx.fillStyle = '#666666';
      ctx.font = '18px Inter, Arial, sans-serif';
      ctx.fillText(`Fecha de emision: ${hoy}`, 708, 430);

      // Modo prueba
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(1100, 870, 200, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, Arial, sans-serif';
      ctx.fillText('MODO PRUEBA', 1200, 897);

      // Descargar
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `certificado_prueba_${nombre.trim().replace(/\s+/g, '_')}.png`;
      link.click();
    } catch {
      alert('Error generando PNG.');
    } finally {
      setGenerando(null);
    }
  };

  return (
    <div className="portal-section active">
      <p className="portal-instructions">
        Genera un certificado de prueba sin conexión a la base de datos (uso ilimitado).
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="portal-form">
        <div className="portal-input-group">
          <label>Nombre Completo del Alumno</label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez Martínez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Preview simulado */}
        <div className="portal-preview-box">
          <div className="portal-preview-overlay"><span>Modo de Prueba</span></div>
          <div className="portal-preview-canvas">
            <div className="portal-preview-border">
              <p className="portal-preview-title">CERTIFICADO DE PARTICIPACION</p>
              <p className="portal-preview-sub">Se certifica que</p>
              <p className="portal-preview-name">
                {nombre.trim() || 'Nombre del Participante'}
              </p>
              <div className="portal-preview-line" />
              <p className="portal-preview-desc">ha participado exitosamente en el evento.</p>
              <p className="portal-preview-date">
                Fecha de emision: {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>
        </div>

        <div className="portal-btn-row">
          <button
            type="button"
            className="portal-btn portal-btn-green"
            onClick={generarPNG}
            disabled={generando !== null}
          >
            {generando === 'png' ? 'Generando...' : 'Descargar PNG'}
          </button>
          <button
            type="button"
            className="portal-btn portal-btn-blue"
            onClick={generarPDF}
            disabled={generando !== null}
          >
            {generando === 'pdf' ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 2: VERIFICACIÓN POR CORREO
   ═══════════════════════════════════════════════════ */
function EmailTab() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certs, setCerts] = useState<PublicCertificate[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo válido.');
      return;
    }
    setLoading(true);
    setError('');
    setCerts([]);
    try {
      const res = await certApi.publicLookup(email.trim());
      if (res.found && res.certificates) {
        setCerts(res.certificates);
      } else {
        setError(res.message || 'No se encontraron certificados para este email.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert: PublicCertificate) => {
    setDownloading(cert.id);
    const url = certApi.publicDownloadUrl(cert.id, email);
    // Abrir en nueva ventana para descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_${cert.nombre_completo.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(null), 2000);
  };

  const resetSearch = () => {
    setEmail('');
    setCerts([]);
    setError('');
  };

  // Vista: formulario de búsqueda
  if (certs.length === 0) {
    return (
      <div className="portal-section active">
        <p className="portal-instructions">
          Ingresa tu correo electrónico registrado para acceder a tus certificados oficiales.
        </p>
        <form onSubmit={handleLookup} className="portal-form">
          <div className="portal-input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="alumno@ejemplo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
            />
            {error && <span className="portal-error">{error}</span>}
          </div>
          <button
            type="submit"
            className="portal-btn portal-btn-primary"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Verificar Correo'}
          </button>
        </form>
      </div>
    );
  }

  // Vista: lista de certificados encontrados
  return (
    <div className="portal-section active">
      <div className="portal-alert portal-alert-success">
        <strong>Email validado:</strong> {email}
      </div>

      <div className="portal-alert portal-alert-warning">
        Se encontraron <strong>{certs.length}</strong> certificado(s) para tu correo.
        Haz clic en descargar para obtener tu PDF oficial.
      </div>

      <div className="portal-certs-list">
        {certs.map((cert) => (
          <div key={cert.id} className="portal-cert-card">
            <div className="portal-cert-info">
              <p className="portal-cert-name">{cert.nombre_completo}</p>
              <p className="portal-cert-event">
                {cert.evento_nombre || `Evento #${cert.evento_id}`}
              </p>
              <p className="portal-cert-date">{cert.fecha_emision}</p>
              {cert.descripcion && (
                <p className="portal-cert-desc">{cert.descripcion}</p>
              )}
            </div>
            <button
              className="portal-btn portal-btn-green portal-btn-sm"
              onClick={() => handleDownload(cert)}
              disabled={downloading === cert.id}
            >
              {downloading === cert.id ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        ))}
      </div>

      <button
        className="portal-btn-link"
        onClick={resetSearch}
      >
        Buscar otro correo
      </button>
    </div>
  );
}