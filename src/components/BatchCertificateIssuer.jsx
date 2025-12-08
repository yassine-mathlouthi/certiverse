// src/components/BatchCertificateIssuer.jsx
import { useState, useCallback } from 'react';
import {
    X, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle,
    Loader2, Download, ChevronRight, Users, AlertTriangle, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { generateCertificateHTML } from '../utils/certificateTemplate';

// Upload to Pinata
const uploadToPinata = async (file) => {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;

    if (!jwt) throw new Error("VITE_PINATA_JWT manquant dans .env");
    if (!gateway) throw new Error("VITE_PINATA_GATEWAY manquant dans .env");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.reason || 'Erreur Pinata');

    return `ipfs://${data.IpfsHash}`;
};

// CSV Parser
const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [], error: 'CSV doit contenir au moins une ligne de données' };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx];
        });
        row._lineNumber = i + 1;
        rows.push(row);
    }

    return { headers, rows, error: null };
};

// Validation
const validateRow = (row) => {
    const errors = [];

    // Student address
    const addr = row.studentaddress || row.adresse || '';
    if (!addr) {
        errors.push('Adresse manquante');
    } else if (!addr.startsWith('0x') || addr.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        errors.push('Adresse invalide');
    }

    // Student name
    const name = row.studentname || row.nom || '';
    if (!name) errors.push('Nom manquant');

    // Email
    const email = row.studentemail || row.email || '';
    if (!email) {
        errors.push('Email manquant');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email invalide');
    }

    // Formation
    const formation = row.formationname || row.formation || row.skillname || row.skill || '';
    if (!formation) errors.push('Formation manquante');

    // Cert type
    const certType = row.certtype || row.type || 'Diplôme';
    const validTypes = ['diplôme', 'certification', 'formation', 'attestation'];
    if (!validTypes.includes(certType.toLowerCase())) {
        errors.push('Type invalide (Diplôme, Certification, Formation, Attestation)');
    }

    // Date (optional - defaults to today)
    const dateStr = row.obtaineddate || row.date || '';
    let obtainedDate = new Date();
    if (dateStr) {
        // Try parsing various formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            obtainedDate = parsed;
        } else {
            // Try DD/MM/YYYY format
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length === 3) {
                const [d, m, y] = parts;
                const tryDate = new Date(y, m - 1, d);
                if (!isNaN(tryDate.getTime())) {
                    obtainedDate = tryDate;
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        normalized: {
            studentAddress: addr,
            studentName: name,
            studentEmail: email,
            formationName: formation,
            certType: certType.charAt(0).toUpperCase() + certType.slice(1).toLowerCase(),
            obtainedDate: obtainedDate.toISOString().split('T')[0] // YYYY-MM-DD format
        }
    };
};

export default function BatchCertificateIssuer({
    isOpen,
    onClose,
    contract,
    orgName,
    orgAddress,
    onComplete
}) {
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Issuing, 4: Complete
    const [csvFile, setCsvFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [validationResults, setValidationResults] = useState([]);
    const [issuingProgress, setIssuingProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [editingCell, setEditingCell] = useState(null); // { rowIdx, field }

    const handleFileSelect = useCallback((file) => {
        if (!file || !file.name.endsWith('.csv')) {
            toast.error('Veuillez sélectionner un fichier CSV');
            return;
        }

        setCsvFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const { headers, rows, error } = parseCSV(e.target.result);
            if (error) {
                toast.error(error);
                return;
            }

            // Validate all rows
            const validated = rows.map(row => {
                const result = validateRow(row);
                return { ...row, ...result };
            });

            setParsedData(validated);
            setValidationResults(validated);
            setStep(2);
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const validCount = validationResults.filter(r => r.valid).length;
    const invalidCount = validationResults.filter(r => !r.valid).length;

    // Handle cell edit
    const handleCellEdit = (rowIdx, field, value) => {
        const updatedResults = [...validationResults];
        const row = updatedResults[rowIdx];

        // Update the normalized field
        if (row.normalized) {
            row.normalized[field] = value;
        }

        // Also update raw data for re-validation
        if (field === 'studentAddress') row.studentaddress = value;
        if (field === 'studentName') row.studentname = value;
        if (field === 'studentEmail') row.studentemail = value;
        if (field === 'formationName') {
            row.formationname = value;
            row.skillname = value;
        }
        if (field === 'certType') row.certtype = value;
        if (field === 'obtainedDate') row.obtaineddate = value;

        // Re-validate this row
        const validationResult = validateRow(row);
        updatedResults[rowIdx] = { ...row, ...validationResult };

        setValidationResults(updatedResults);
        setEditingCell(null);
    };

    // Editable cell component
    const EditableCell = ({ rowIdx, field, value, type = 'text' }) => {
        const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.field === field;
        const [tempValue, setTempValue] = useState(value);

        if (isEditing) {
            if (type === 'select') {
                return (
                    <select
                        value={tempValue}
                        onChange={(e) => handleCellEdit(rowIdx, field, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full px-2 py-1 border border-[var(--color-primary-400)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)] text-sm"
                    >
                        <option value="Diplôme">Diplôme</option>
                        <option value="Certification">Certification</option>
                        <option value="Formation">Formation</option>
                        <option value="Attestation">Attestation</option>
                    </select>
                );
            }
            return (
                <input
                    type={type === 'email' ? 'email' : type === 'date' ? 'date' : 'text'}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => handleCellEdit(rowIdx, field, tempValue)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCellEdit(rowIdx, field, tempValue);
                        if (e.key === 'Escape') setEditingCell(null);
                    }}
                    autoFocus
                    className="w-full px-2 py-1 border border-[var(--color-primary-400)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)] text-sm"
                />
            );
        }

        return (
            <div
                className="group flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -mx-1"
                onClick={() => {
                    setTempValue(value);
                    setEditingCell({ rowIdx, field });
                }}
            >
                <span className="truncate">{value || '-'}</span>
                <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
        );
    };

    const startBatchIssuance = async () => {
        const validRows = validationResults.filter(r => r.valid);
        if (validRows.length === 0) {
            toast.error('Aucun certificat valide à émettre');
            return;
        }

        setStep(3);
        setIssuingProgress({ current: 0, total: validRows.length });
        const issueResults = [];

        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];
            const { normalized } = row;

            setIssuingProgress({ current: i + 1, total: validRows.length });

            try {
                // Get the official cert ID like the single issuance does
                const counter = await contract.certificateCounter();
                const nextId = Number(counter) + 1;
                const year = new Date().getFullYear();
                const certId = `CERT-${year}-${String(nextId).padStart(4, '0')}`;

                // Generate certificate HTML
                const certData = {
                    certId,
                    studentName: normalized.studentName,
                    studentAddress: normalized.studentAddress,
                    formationName: normalized.formationName,
                    certType: normalized.certType,
                    orgName: orgName,  // Template expects 'orgName' not 'issuerName'
                    issuerName: orgName,
                    issuerAddress: orgAddress,
                    issuedAt: new Date(normalized.obtainedDate)
                };

                const html = generateCertificateHTML(certData);
                const blob = new Blob([html], { type: 'text/html' });
                const htmlFile = new File([blob], `certificate-${certId}.html`, { type: 'text/html' });

                // Upload to IPFS
                const ipfsHash = await uploadToPinata(htmlFile);

                // Use the obtainedDate from CSV (or default to today if not specified)
                const issuedAt = Math.floor(new Date(normalized.obtainedDate).getTime() / 1000) || Math.floor(Date.now() / 1000);

                // Issue on blockchain (contract auto-generates the cert ID)
                const tx = await contract.issueCertificate(
                    normalized.studentAddress,
                    normalized.studentName,
                    normalized.studentEmail,
                    normalized.formationName,
                    normalized.certType,
                    ipfsHash,
                    issuedAt
                );
                const receipt = await tx.wait();

                // Try to get the cert ID from the transaction events
                let issuedCertId = certId;
                if (receipt.logs && receipt.logs.length > 0) {
                    try {
                        // Parse the CertificateIssued event to get the actual cert ID
                        const event = receipt.logs[0];
                        if (event.args && event.args.certId !== undefined) {
                            const rawCertId = Number(event.args.certId);
                            issuedCertId = `CERT-${new Date().getFullYear()}-${String(rawCertId).padStart(4, '0')}`;
                        }
                    } catch (e) {
                        // If parsing fails, use the generated certId
                    }
                }

                issueResults.push({
                    ...normalized,
                    certId: issuedCertId,
                    status: 'success',
                    txHash: tx.hash
                });

            } catch (err) {
                console.error('Erreur émission:', err);
                issueResults.push({
                    ...normalized,
                    certId: '-',
                    status: 'error',
                    error: err.reason || err.message || 'Erreur inconnue'
                });
            }
        }

        setResults(issueResults);
        setStep(4);

        const successCount = issueResults.filter(r => r.status === 'success').length;
        if (successCount === issueResults.length) {
            toast.success(`${successCount} certificats émis avec succès !`);
        } else {
            toast.success(`${successCount}/${issueResults.length} certificats émis`);
        }
    };

    const downloadResultsCSV = () => {
        const headers = ['studentAddress', 'studentName', 'studentEmail', 'formationName', 'certType', 'certId', 'status', 'error'];
        const rows = results.map(r =>
            headers.map(h => r[h] || '').join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-issuance-results-${Date.now()}.csv`;
        a.click();
    };

    const handleClose = () => {
        setCsvFile(null);
        setParsedData([]);
        setValidationResults([]);
        setResults([]);
        setStep(1);
        setIssuingProgress({ current: 0, total: 0 });
        onClose();
        if (results.some(r => r.status === 'success')) {
            onComplete?.();
        }
    };

    const downloadTemplate = () => {
        const today = new Date().toISOString().split('T')[0];
        const template = `studentAddress,studentName,studentEmail,formationName,certType,obtainedDate
0x1234567890abcdef1234567890abcdef12345678,Jean Dupont,jean.dupont@email.com,Master Informatique,Diplôme,${today}
0xabcdef1234567890abcdef1234567890abcdef12,Marie Martin,marie.martin@email.com,AWS Solutions Architect,Certification,${today}`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-batch-certificates.csv';
        a.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0" onClick={step < 3 ? handleClose : undefined} />

            <motion.div
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                {/* Header */}
                <div className="bg-gradient-primary px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white font-display">Émission en Lot</h3>
                            <p className="text-white/80 text-xs sm:text-sm hidden sm:block">Importer un fichier CSV pour émettre plusieurs certificats</p>
                        </div>
                    </div>
                    {step < 3 && (
                        <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </button>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        {['Upload', 'Vérification', 'Émission', 'Terminé'].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${step > idx + 1 ? 'bg-emerald-500 text-white' :
                                    step === idx + 1 ? 'bg-[var(--color-primary-500)] text-white' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > idx + 1 ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                                </div>
                                <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${step === idx + 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                                {idx < 3 && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 mx-1 sm:mx-2 hidden sm:block" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-[var(--color-primary-500)]' : 'text-gray-400'}`} />
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                                        Glissez votre fichier CSV ici
                                    </h4>
                                    <p className="text-gray-500 mb-4">ou cliquez pour sélectionner un fichier</p>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Upload className="w-5 h-5" />
                                        <span>Sélectionner un fichier</span>
                                    </label>
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">Format CSV requis :</h5>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Le fichier doit contenir les colonnes : <code className="bg-gray-200 px-1 rounded">studentAddress</code>,
                                        <code className="bg-gray-200 px-1 rounded ml-1">studentName</code>,
                                        <code className="bg-gray-200 px-1 rounded ml-1">studentEmail</code>,
                                        <code className="bg-gray-200 px-1 rounded ml-1">formationName</code>,
                                        <code className="bg-gray-200 px-1 rounded ml-1">certType</code>
                                    </p>
                                    <button
                                        onClick={downloadTemplate}
                                        className="text-[var(--color-primary-600)] hover:underline text-sm font-medium flex items-center gap-1"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger un modèle CSV
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Preview */}
                        {step === 2 && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Summary */}
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <span className="font-bold text-emerald-800">{validCount} valides</span>
                                        </div>
                                    </div>
                                    {invalidCount > 0 && (
                                        <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="font-bold text-red-800">{invalidCount} invalides</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Edit hint */}
                                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                    <Pencil className="w-4 h-4" />
                                    <span>Cliquez sur une cellule pour la modifier</span>
                                </p>

                                {/* Table */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto max-h-[350px]">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600 w-12">Statut</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Adresse</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Nom</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Email</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Formation</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600 w-28">Type</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-gray-600 w-28">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {validationResults.map((row, idx) => (
                                                    <tr key={idx} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}>
                                                        <td className="px-3 py-2">
                                                            {row.valid ? (
                                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                            ) : (
                                                                <div className="group relative">
                                                                    <XCircle className="w-5 h-5 text-red-500 cursor-help" />
                                                                    <div className="absolute left-6 top-0 z-10 hidden group-hover:block bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                                                        {row.errors.join(', ')}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-xs text-gray-600 max-w-[120px]">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="studentAddress"
                                                                value={row.normalized?.studentAddress || ''}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 font-medium text-gray-900">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="studentName"
                                                                value={row.normalized?.studentName || ''}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-600">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="studentEmail"
                                                                value={row.normalized?.studentEmail || ''}
                                                                type="email"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-600">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="formationName"
                                                                value={row.normalized?.formationName || ''}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="certType"
                                                                value={row.normalized?.certType || 'Diplôme'}
                                                                type="select"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-600 text-xs">
                                                            <EditableCell
                                                                rowIdx={idx}
                                                                field="obtainedDate"
                                                                value={row.normalized?.obtainedDate || ''}
                                                                type="date"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {invalidCount > 0 && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800">
                                            Les {invalidCount} lignes invalides seront ignorées. Seuls les {validCount} certificats valides seront émis.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Issuing */}
                        {step === 3 && (
                            <motion.div
                                key="issuing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-12"
                            >
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary-500)] border-t-transparent mx-auto mb-6"></div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2 font-display">
                                    Émission en cours...
                                </h4>
                                <p className="text-gray-600 mb-6">
                                    Certificat {issuingProgress.current} sur {issuingProgress.total}
                                </p>
                                <div className="max-w-md mx-auto bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(issuingProgress.current / issuingProgress.total) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    Ne fermez pas cette fenêtre
                                </p>
                            </motion.div>
                        )}

                        {/* Step 4: Complete */}
                        {step === 4 && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 font-display">Émission terminée !</h4>
                                    <p className="text-gray-600">
                                        {results.filter(r => r.status === 'success').length} certificats émis avec succès
                                    </p>
                                </div>

                                {/* Results summary */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                                    <div className="overflow-x-auto max-h-[250px]">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Statut</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Nom</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">ID Certificat</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {results.map((row, idx) => (
                                                    <tr key={idx} className={row.status === 'success' ? '' : 'bg-red-50'}>
                                                        <td className="px-4 py-3">
                                                            {row.status === 'success' ? (
                                                                <span className="badge badge-success">Succès</span>
                                                            ) : (
                                                                <span className="badge badge-error">{row.error}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-900">{row.studentName}</td>
                                                        <td className="px-4 py-3 font-mono text-gray-600">{row.certId}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={downloadResultsCSV} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <Download className="w-5 h-5" />
                                        Télécharger le rapport
                                    </button>
                                    <button onClick={handleClose} className="btn-primary flex-1">
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions for Step 2 */}
                {step === 2 && (
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 flex gap-3 sm:gap-4">
                        <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                            Retour
                        </button>
                        <button
                            onClick={startBatchIssuance}
                            disabled={validCount === 0}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Upload className="w-5 h-5" />
                            Émettre {validCount} certificat{validCount > 1 ? 's' : ''}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
