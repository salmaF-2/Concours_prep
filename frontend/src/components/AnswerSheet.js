import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Save,
  Sparkles,
  X,
  User,
  Keyboard,
  Camera,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { getSubjectMeta } from '../utils/subjectMeta';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ManualTab({ nbQ, answers, startQ, meta, onChange }) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-400">
        Selectionnez la reponse pour chaque question.
      </p>

      <div className="answer-grid">
        {answers.map((value, index) => (
          <div key={index} className="answer-cell">
            <label style={{ color: value ? meta.color : undefined }}>
              Q{startQ + index}
            </label>

            <select
              value={value}
              onChange={(event) => onChange(index, event.target.value)}
            >
              <option value="">-</option>
              {['A', 'B', 'C', 'D', 'E'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadTab({ startQ, nbQ, onExtracted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setExtracted(null);
    setError(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
      handleFile(droppedFile);
    }
  };

  const extract = async () => {
    if (!file) return;

    setExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('startQ', startQ);
      formData.append('nbQuestions', nbQ);

      const res = await axios.post(`${API}/api/answers/extract-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (res.data.success && res.data.answers) {
        setExtracted(res.data.answers);
        onExtracted(res.data.answers);
      } else {
        setError("Extraction impossible. Verifiez la qualite de l'image.");
      }
    } catch (event) {
      setError(event.response?.data?.message || "Erreur lors de l'extraction IA.");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-xs font-medium leading-6 text-slate-400">
        Photographiez ou scannez votre grille de reponses. L'IA extraira les reponses automatiquement.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`file-drop ${file ? 'has-file' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => handleFile(event.target.files[0])}
        />

        {file ? (
          <>
            <CheckCircle className="file-drop-icon text-emerald-600" size={24} />
            <div className="file-drop-text text-emerald-700">{file.name}</div>
            <div className="file-drop-hint">Cliquez pour changer</div>
          </>
        ) : (
          <>
            <Upload className="file-drop-icon" size={24} />
            <div className="file-drop-text">Glissez-deposez ou cliquez</div>
            <div className="file-drop-hint">JPG, PNG, PDF · max 10 Mo</div>
          </>
        )}
      </div>

      {preview && (
        <div className="my-4 text-center">
          <img
            src={preview}
            alt="Apercu grille"
            className="mx-auto max-h-48 max-w-full rounded-2xl border border-line object-contain"
          />
        </div>
      )}

      <button
        className="btn btn-primary btn-full mt-4"
        onClick={extract}
        disabled={!file || extracting}
        type="button"
      >
        {extracting ? (
          <>
            <Loader2 size={15} className="spin" />
            Extraction en cours...
          </>
        ) : (
          <>
            <Camera size={15} />
            Extraire les reponses par IA
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {extracted && (
        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-emerald-700">
            <CheckCircle size={16} />
            Extraction reussie. Verifiez dans l'onglet saisie.
          </div>

          <div className="flex flex-wrap gap-1">
            {Object.entries(extracted).map(([key, value]) => (
              <span
                key={key}
                className="rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-extrabold text-emerald-700"
              >
                {key}:{value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnswerSheet({ epreuve, concours, onClose, onSuccess }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('manual');
  const [answers, setAnswers] = useState([]);
  const [answerId, setAnswerId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [codeCandidat, setCodeCandidat] = useState('');

  const nbQ = epreuve?.nbQuestionsParBloc || 20;
  const order = epreuve?.realOrder ?? epreuve?.order ?? 0;
  const startQ = order * nbQ + 1;
  const blocIndex = order + 1;
  const meta = getSubjectMeta(epreuve?.subject);
  const SubjectIcon = meta.Icon;

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setPrenom(parts[0] || '');
      setNom(parts.slice(1).join(' ') || '');
    }

    setAnswers(Array(nbQ).fill(''));
    loadExisting();
  }, [epreuve._id, nbQ]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadExisting = async () => {
    try {
      const res = await axios.get(`${API}/api/answers`, {
        params: { concoursId: concours._id },
      });

      const found = res.data.data?.find((answer) => answer.epreuve?._id === epreuve._id);

      if (found) {
        setAnswerId(found._id);
        if (found.nom) setNom(found.nom);
        if (found.prenom) setPrenom(found.prenom);
        if (found.code_candidat) setCodeCandidat(found.code_candidat);

        if (found.answers && typeof found.answers === 'object') {
          const nextAnswers = Array(nbQ).fill('');
          for (let index = 0; index < nbQ; index += 1) {
            nextAnswers[index] = found.answers[`Q${startQ + index}`] || '';
          }
          setAnswers(nextAnswers);
        }
      }
    } catch (_) {
    }
  };

  const handleExtracted = (extractedObj) => {
    const nextAnswers = Array(nbQ).fill('');

    for (let index = 0; index < nbQ; index += 1) {
      const key = `Q${startQ + index}`;
      nextAnswers[index] = extractedObj[key] || extractedObj[`Q${index + 1}`] || '';
    }

    setAnswers(nextAnswers);
    setTab('manual');
    showToast('Reponses extraites. Verifiez puis sauvegardez.');
  };

  const saveAnswers = async () => {
    if (!prenom.trim() || !nom.trim()) {
      showToast('Veuillez entrer votre nom et prenom', 'error');
      return;
    }

    setStatus('saving');

    try {
      const answerObject = {};
      answers.forEach((value, index) => {
        answerObject[`Q${startQ + index}`] = value || '';
      });

      const res = await axios.post(`${API}/api/answers`, {
        concoursId: concours._id,
        epreuveId: epreuve._id,
        answers: answerObject,
        nom,
        prenom,
        code_candidat: codeCandidat || `CAND${Date.now()}`,
      });

      setAnswerId(res.data.answer._id);
      showToast('Reponses sauvegardees');
    } catch (_) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setStatus('idle');
    }
  };

  const triggerFeedback = async () => {
    if (!answerId) {
      showToast("Sauvegardez d'abord vos reponses", 'error');
      return;
    }

    setStatus('triggering');

    try {
      await axios.post(`${API}/api/answers/${answerId}/trigger`);
      showToast('Feedback en cours de generation');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1800);
    } catch (_) {
      showToast('Erreur lors du declenchement', 'error');
    } finally {
      setStatus('idle');
    }
  };

  const handleChange = (index, value) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = value.toUpperCase();
    setAnswers(nextAnswers);
  };

  const answered = answers.filter(Boolean).length;
  const pct = nbQ > 0 ? Math.round((answered / nbQ) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-lg animate-slide-up flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: meta.bg }}
            >
              <SubjectIcon size={20} style={{ color: meta.color }} />
            </div>

            <div>
              <h3 className="capitalize">{meta.label}</h3>
              <p className="text-xs font-medium text-slate-400">
                {concours.title} · Bloc {blocIndex} · Q{startQ} a Q{startQ + nbQ - 1}
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="shrink-0 border-b border-line bg-slate-50/80 px-5 py-3">
          <div className="mb-2 flex justify-between text-xs font-extrabold text-slate-400">
            <span>{answered}/{nbQ} reponses</span>
            <span>{pct}%</span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex shrink-0 border-b border-line bg-white px-4">
          <button
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition ${
              tab === 'manual'
                ? 'border-aqua-500 text-aqua-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setTab('manual')}
            type="button"
          >
            <Keyboard size={15} />
            Saisie
          </button>

          <button
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition ${
              tab === 'upload'
                ? 'border-aqua-500 text-aqua-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setTab('upload')}
            type="button"
          >
            <Camera size={15} />
            Upload IA
          </button>
        </div>

        <div className="modal-body flex-1 overflow-y-auto">
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-normal text-slate-400">
              <User size={14} />
              Informations candidat
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="form-group m-0">
                <label className="form-label">Prenom *</label>
                <input
                  className="form-input"
                  value={prenom}
                  onChange={(event) => setPrenom(event.target.value)}
                />
              </div>

              <div className="form-group m-0">
                <label className="form-label">Nom *</label>
                <input
                  className="form-input"
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                />
              </div>

              <div className="form-group m-0">
                <label className="form-label">Code candidat</label>
                <input
                  className="form-input"
                  value={codeCandidat}
                  onChange={(event) => setCodeCandidat(event.target.value)}
                />
              </div>
            </div>
          </div>

          {tab === 'manual' ? (
            <ManualTab
              nbQ={nbQ}
              answers={answers}
              startQ={startQ}
              meta={meta}
              onChange={handleChange}
            />
          ) : (
            <UploadTab startQ={startQ} nbQ={nbQ} onExtracted={handleExtracted} />
          )}
        </div>

        <div className="modal-footer shrink-0">
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Fermer
          </button>

          <div className="flex-1" />

          <button
            className="btn btn-success"
            onClick={saveAnswers}
            disabled={status === 'saving'}
            type="button"
          >
            {status === 'saving' ? (
              <>
                <Loader2 size={14} className="spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={14} />
                Sauvegarder
              </>
            )}
          </button>

          <button
            className="btn btn-primary"
            onClick={triggerFeedback}
            disabled={status === 'triggering' || !answerId}
            type="button"
          >
            {status === 'triggering' ? (
              <>
                <Loader2 size={14} className="spin" />
                Envoi...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Feedback
              </>
            )}
          </button>
        </div>

        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}