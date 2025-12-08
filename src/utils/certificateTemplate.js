// src/utils/certificateTemplate.js

/**
 * Generate professional landscape certificate HTML
 * @param {Object} certData - Certificate data
 * @returns {string} HTML string for the certificate
 */
export const generateCertificateHTML = (certData) => {
  const {
    studentName,
    formationName,
    certType,
    issuerName,
    issuedAt,
    certId,
    orgName
  } = certData;

  const formattedDate = new Date(issuedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Extract just the numeric ID for the QR code (e.g., "CERT-2024-1234" -> "1234")
  const numericId = certId.includes('-') ? certId.split('-').pop() : certId;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${certId} - ${orgName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      background:#0f172a;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      font-family:'Inter', sans-serif;
    }
    .certificate {
      width:297mm;
      height:210mm;
      background:#ffffff;
      padding:50px 60px;
      position:relative;
      box-shadow:0 30px 100px rgba(0,0,0,0.6);
      color:#0f172a;
      overflow:hidden;
      display:flex;
      flex-direction:column;
    }
    .header {
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      margin-bottom:25px;
    }
    .org-info { flex:1; }
    .org-name {
      font-family:'Playfair Display', serif;
      font-size:30px;
      font-weight:900;
      color:#1e40af;
      margin-bottom:3px;
    }
    .org-subtitle {
      font-size:10px;
      color:#64748b;
      text-transform:uppercase;
      letter-spacing:3px;
      font-weight:600;
    }
    .header-right {
      text-align:center;
    }
    .cert-id-top {
      font-family:'Courier New', monospace;
      font-size:14px;
      color:#1e40af;
      font-weight:700;
      margin-bottom:8px;
    }
    .qr-code-header {
      width:75px;
      height:75px;
      padding:5px;
      background:white;
      border-radius:10px;
      box-shadow:0 3px 10px rgba(0,0,0,0.1);
      margin:0 auto;
    }
    .qr-code-header img {
      width:100%;
      height:100%;
    }
    .main-content {
      flex:1;
      display:flex;
      flex-direction:column;
      justify-content:center;
      text-align:center;
    }
    .title {
      font-size:40px;
      font-weight:900;
      color:#0f172a;
      margin-bottom:6px;
      word-spacing: 0.35em;
      letter-spacing: 0.05em;
    }
    .cert-type {
      font-size:26px;
      color:#1e40af;
      font-weight:600;
      margin-bottom:20px;
    }
    .awarded {
      font-size:17px;
      color:#475569;
      margin-bottom:12px;
    }
    .student-name {
      font-family:'Playfair Display', serif;
      font-size:48px;
      font-weight:900;
      color:#1e40af;
      line-height:1.1;
      margin:12px 0 20px;
    }
    .description {
      font-size:19px;
      line-height:1.5;
      color:#334155;
      margin-bottom:15px;
    }
    .formation-name {
      font-size:24px;
      font-weight:700;
      color:#0f172a;
      margin:8px 0;
    }
    .footer {
      display:flex;
      justify-content:space-between;
      align-items:flex-end;
      padding-top:25px;
      border-top:2px solid #e2e8f0;
    }
    .left-section {
      flex:1;
      display:flex;
      gap:35px;
    }
    .info-block strong {
      display:block;
      font-size:10px;
      color:#64748b;
      text-transform:uppercase;
      letter-spacing:1.2px;
      font-weight:600;
      margin-bottom:4px;
    }
    .info-block span {
      font-size:15px;
      color:#0f172a;
      font-weight:500;
    }
    .signature-block {
      text-align:right;
    }
    .signature-line {
      width:190px;
      height:2px;
      background:#1e40af;
      margin:0 0 5px auto;
    }
    .signature-name {
      font-family:'Playfair Display', serif;
      font-size:19px;
      font-weight:700;
      color:#1e40af;
    }
    .signature-title {
      font-size:11px;
      color:#64748b;
    }
    @media print {
      body { background:none; padding:0; }
      .certificate { box-shadow:none; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="org-info">
        <div class="org-name">${orgName}</div>
        <div class="org-subtitle">Organisme de formation certifié</div>
      </div>
      <div class="header-right">
        <div class="cert-id-top">ID: ${certId}</div>
        <div class="qr-code-header">
          <img src="${import.meta.env.VITE_QR_API_URL}/?size=150x150&data=${import.meta.env.VITE_APP_BASE_URL}/verify/${numericId}" alt="QR Code">
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="title">Certificat Officiel</div>
      <div class="cert-type">${certType}</div>
      
      <div class="awarded">Est décerné à</div>
      <div class="student-name">${studentName}</div>
      
      <div class="description">
        pour avoir suivi et validé avec succès la formation
      </div>
      <div class="formation-name">${formationName}</div>
    </div>

    <div class="footer">
      <div class="left-section">
        <div class="info-block">
          <strong>Date d'obtention</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="info-block">
          <strong>Blockchain</strong>
          <span>Ethereum Sepolia</span>
        </div>
      </div>

      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${orgName}</div>
        <div class="signature-title">Signature autorisée</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export default generateCertificateHTML;
