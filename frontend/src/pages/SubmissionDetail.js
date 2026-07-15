import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  XCircle,
  Brain,
  Target,
  Zap,
  Search,
  Lightbulb,
  CalendarDays,
  ListChecks,
  Layers,
  BookOpenCheck,
  Download
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const isLoadingStatus = (status) =>
  ['pending', 'processing', 'extracting', 'saved'].includes(status);

const getFeedbackData = (sub) => {
  return (
    sub?.result?.feedback_ai_complet ||
    sub?.result?.feedback?.feedback_ai_complet ||
    sub?.feedback_complet?.feedback_ai_complet ||
    sub?.feedback_ai_complet ||
    sub?.result?.feedback ||
    sub?.result ||
    {}
  );
};

const getFullPlan = (sub, feedback) => {
  return (
    sub?.result?.plan_complet?.plan_revision ||
    sub?.result?.feedback?.plan_complet?.plan_revision ||
    sub?.feedback_complet?.plan_complet?.plan_revision ||
    sub?.plan_complet?.plan_revision ||
    feedback?.plan_complet?.plan_revision ||
    null
  );
};

const getSimplePlan = (feedback) => {
  return feedback?.synthese?.plan_revision || feedback?.plan_revision || [];
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const FullPageFeedbackLoader = () => (
  <div className="card animate-fade-up p-8 text-center">
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
      <div className="spinner h-20 w-20 border-[6px]" />
      <Brain size={26} className="absolute text-aqua-600" />
    </div>
    <h2 className="mt-5 text-2xl font-extrabold text-ink">
      Feedback en cours de generation
    </h2>
    <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-7 text-slate-500">
      Le workflow analyse les reponses, calcule le score et prepare un feedback personnalise.
    </p>
  </div>
);

export default function SubmissionDetail() {
  const { id } = useParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const timer = setInterval(() => {
      load(false);
    }, 6000);

    return () => clearInterval(timer);
  }, [id]);

  const load = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get(`${API}/api/answers/${id}/feedback`);
      setSub(res.data.data);
    } catch (err) {
      console.error('Erreur feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildPdfHtml = ({ feedback, questions, simplePlan, phases, ressources, score, total, percent, mention, subject, concours }) => {
    const questionRows = questions.map((q) => {
      const ok = q.resultat?.includes('✅') || q.resultat?.toLowerCase?.().includes('correct');
      return `
        <div class="question ${ok ? 'ok' : 'ko'}">
          <div class="q-head">
            <strong>${escapeHtml(q.num)}</strong>
            <span>${ok ? 'Correct' : 'Incorrect'}</span>
            <em>${escapeHtml(q.theme || '')}</em>
          </div>
          <p>${escapeHtml(q.retour_personnalise || '')}</p>
          ${q.diagnostic_erreur && q.diagnostic_erreur !== ',' ? `<div class="note"><b>Diagnostic :</b> ${escapeHtml(q.diagnostic_erreur)}</div>` : ''}
          ${q.conseil_revision ? `<div class="tip"><b>Conseil :</b> ${escapeHtml(q.conseil_revision)}</div>` : ''}
        </div>
      `;
    }).join('');

    const simplePlanHtml = simplePlan.map((item, index) => `
      <div class="plan-item">
        <h3>Priorite ${index + 1}</h3>
        <p>${escapeHtml(item)}</p>
      </div>
    `).join('');

    const phasesHtml = phases.map((phase, index) => `
      <div class="phase">
        <h3>Phase ${index + 1} - ${escapeHtml(phase.nom || '')}</h3>
        ${phase.durée ? `<p class="muted">Duree : ${escapeHtml(phase.durée)}</p>` : ''}
        ${phase.objectifs?.length ? `
          <h4>Objectifs</h4>
          <ul>${phase.objectifs.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
        ` : ''}
        ${phase.chapitre_prioritaires?.length ? `
          <h4>Chapitres prioritaires</h4>
          ${phase.chapitre_prioritaires.map((chapitre) => `
            <div class="chapter">
              <b>${escapeHtml(chapitre.chapitre)}</b>
              ${chapitre.classification ? `<span>${escapeHtml(chapitre.classification)}</span>` : ''}
              ${chapitre.strategie?.exercices ? `
                <p>Exercices : ${escapeHtml(chapitre.strategie.exercices.quantité)} · Niveau : ${escapeHtml(chapitre.strategie.exercices.niveau)} · Focus : ${escapeHtml(chapitre.strategie.exercices.focus)}</p>
                ${chapitre.strategie.exercices.liste_exercices?.length ? `
                  <div class="exo-list">
                    <h5>Exercices détaillés</h5>
                    ${chapitre.strategie.exercices.liste_exercices.map((exo) => `
                      <div class="exo-card">
                        <b>${escapeHtml(exo.titre || '')}</b>
                        <p>${escapeHtml(exo.enonce || '')}</p>
                        ${exo.solution ? `<div class="sol"><b>Solution :</b> ${escapeHtml(exo.solution)}</div>` : ''}
                        ${exo.astuce ? `<div class="tip"><b>Astuce :</b> ${escapeHtml(exo.astuce)}</div>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              ` : ''}
              ${chapitre.strategie?.réflexes?.length ? `
                <ul>${chapitre.strategie.réflexes.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}
      </div>
    `).join('');

    const fichesHtml = ressources?.fiches_reflexes?.map((fiche) => `
      <div class="chapter">
        <b>${escapeHtml(fiche.nom)}</b>
        <ul>${fiche.contenu?.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || ''}</ul>
      </div>
    `).join('') || '';

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Feedback complet - ${escapeHtml(subject)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #101828;
              margin: 32px;
              line-height: 1.55;
            }
            h1, h2, h3, h4, h5 { margin: 0 0 10px; }
            h1 { font-size: 26px; }
            h2 {
              font-size: 18px;
              margin-top: 28px;
              border-bottom: 1px solid #d9e7ec;
              padding-bottom: 8px;
              color: #0e7490;
            }
            .meta {
              background: #ecfeff;
              border: 1px solid #cffafe;
              border-radius: 12px;
              padding: 16px;
              margin: 18px 0;
            }
            .score {
              font-size: 28px;
              font-weight: 800;
              color: #0891a3;
            }
            .muted { color: #667085; font-size: 13px; }
            .question, .plan-item, .phase, .chapter {
              border: 1px solid #d9e7ec;
              border-radius: 12px;
              padding: 14px;
              margin: 12px 0;
              break-inside: avoid;
            }
            .question.ok { background: #ecfdf5; }
            .question.ko { background: #fef2f2; }
            .q-head {
              display: flex;
              gap: 10px;
              align-items: center;
              margin-bottom: 8px;
            }
            .q-head span {
              font-size: 12px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 999px;
              background: white;
            }
            .q-head em { color: #667085; font-size: 13px; }
            .note, .tip {
              background: white;
              border-radius: 10px;
              padding: 10px;
              margin-top: 8px;
              font-size: 13px;
            }
            .plan-item { background: #ecfeff; }
            .phase { background: #ffffff; }
            .chapter { background: #f8fafc; }
            .chapter span {
              display: inline-block;
              margin-left: 8px;
              color: #92400e;
              font-size: 12px;
              font-weight: 700;
            }
            .exo-list {
              margin-top: 10px;
            }
            .exo-card {
              background: white;
              border: 1px solid #d9e7ec;
              border-radius: 8px;
              padding: 10px;
              margin: 8px 0;
            }
            .exo-card .sol {
              background: #ecfdf5;
              padding: 8px;
              border-radius: 6px;
              margin-top: 6px;
              font-size: 13px;
            }
            .exo-card .tip {
              background: #fffbeb;
              padding: 6px 10px;
              border-radius: 6px;
              margin-top: 4px;
              font-size: 12px;
            }
            @media print {
              body { margin: 18mm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Feedback complet</h1>
          <p class="muted">${escapeHtml(concours)} · ${escapeHtml(subject)}</p>

          <div class="meta">
            <div class="score">${escapeHtml(score)}/${escapeHtml(total)} ${percent !== null ? `· ${escapeHtml(percent)}%` : ''}</div>
            ${mention ? `<p><b>Mention :</b> ${escapeHtml(mention)}</p>` : ''}
          </div>

          ${feedback?.profil_erreurs?.analyse_profil ? `
            <h2>Profil des erreurs</h2>
            <p>${escapeHtml(feedback.profil_erreurs.analyse_profil)}</p>
          ` : ''}

          <h2>Analyse par question</h2>
          ${questionRows || '<p>Aucune question detaillee.</p>'}

          ${simplePlanHtml ? `<h2>Plan de revision prioritaire</h2>${simplePlanHtml}` : ''}

          ${phasesHtml ? `<h2>Plan complet personnalise</h2>${phasesHtml}` : ''}

          ${fichesHtml ? `<h2>Fiches reflexes</h2>${fichesHtml}` : ''}

          ${feedback?.synthese?.texte_global ? `
            <h2>Synthese globale</h2>
            <p>${escapeHtml(feedback.synthese.texte_global)}</p>
          ` : ''}

          ${feedback?.synthese?.message_motivation ? `
            <h2>Message de motivation</h2>
            <p>${escapeHtml(feedback.synthese.message_motivation)}</p>
          ` : ''}

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-loading">
          <span className="spinner spinner-lg" />
          <span>Chargement du feedback...</span>
        </div>
      </Layout>
    );
  }

  if (!sub) {
    return (
      <Layout>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={28} />
            </div>
            <h3>Soumission introuvable</h3>
            <Link to="/submissions" className="btn btn-primary mt-4">
              Retour
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoadingStatus(sub.status)) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl">
          <Link to="/submissions" className="btn btn-ghost btn-sm mb-4">
            <ArrowLeft size={14} /> Retour
          </Link>
          <FullPageFeedbackLoader />
        </div>
      </Layout>
    );
  }

  const feedback = getFeedbackData(sub);
  const questions = feedback.questions || [];

  const simplePlan = getSimplePlan(feedback);
  const fullPlan = getFullPlan(sub, feedback);
  const phases = fullPlan?.phases ? Object.values(fullPlan.phases) : [];
  const ressources = fullPlan?.ressources || null;

  const score = sub.result?.score ?? sub.score ?? feedback?.meta?.score;
  const total = sub.result?.nb_questions || feedback.meta?.nb_questions || questions.length || 20;

  const percent =
    typeof score === 'number'
      ? Math.round((score / total) * 100)
      : feedback?.meta?.score_pourcentage
        ? parseInt(feedback.meta.score_pourcentage, 10)
        : null;

  const mention = sub.result?.mention || sub.mention || feedback?.meta?.mention;
  const subject =
    sub.epreuve?.subject ||
    sub.epreuve_matiere ||
    feedback?.meta?.epreuve_matiere ||
    'Resultats';

  const concours =
    sub.concours?.title ||
    sub.concours ||
    feedback?.meta?.concours ||
    'Concours';

  const downloadFeedbackPdf = () => {
    const html = buildPdfHtml({
      feedback,
      questions,
      simplePlan,
      phases,
      ressources,
      score,
      total,
      percent,
      mention,
      subject,
      concours,
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/submissions" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> Retour
          </Link>

          <button className="btn btn-primary btn-sm" onClick={downloadFeedbackPdf} type="button">
            <Download size={14} />
            Telecharger PDF
          </button>
        </div>

        <div className="card mb-5 p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600">
                <BarChart3 size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold capitalize text-ink">
                  {subject}
                </h2>
                <p className="text-sm font-medium text-slate-400">{concours}</p>
              </div>
            </div>

            {score !== undefined && score !== null && (
              <div className="rounded-2xl border border-aqua-100 bg-aqua-50 px-5 py-3 text-right">
                <div className="font-mono text-4xl font-extrabold text-aqua-700">
                  {score}
                  <span className="text-lg text-slate-400">/{total}</span>
                </div>

                {percent !== null && (
                  <div className="text-sm font-extrabold text-slate-500">
                    {percent}%
                  </div>
                )}
              </div>
            )}
          </div>

          {mention && <span className="badge badge-info mt-5">{mention}</span>}

          {percent !== null && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-extrabold text-slate-400">
                <span>Score</span>
                <span>{percent}%</span>
              </div>
              <div className="progress h-3">
                <div className="progress-bar" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </div>

        {feedback?.profil_erreurs?.analyse_profil && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Target size={17} className="text-aqua-600" />
                Profil des erreurs
              </strong>
            </div>
            <div className="card-body">
              <p className="text-sm font-medium leading-8 text-slate-600">
                {feedback.profil_erreurs.analyse_profil}
              </p>
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Brain size={17} className="text-aqua-600" />
                Analyse par question
              </strong>
            </div>

            <div className="space-y-3 p-5">
              {questions.map((q, index) => {
                const ok =
                  q.resultat?.includes('✅') ||
                  q.resultat?.toLowerCase?.().includes('correct');

                return (
                  <div
                    key={q.num || index}
                    className={`rounded-2xl border p-4 ${
                      ok ? 'border-emerald-100 bg-emerald-50/70' : 'border-red-100 bg-red-50/60'
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <strong className="font-mono text-sm font-extrabold text-ink">
                        {q.num || `Q${index + 1}`}
                      </strong>

                      {ok ? (
                        <CheckCircle size={17} className="text-emerald-600" />
                      ) : (
                        <XCircle size={17} className="text-red-600" />
                      )}

                      <span className="text-sm font-bold text-slate-600">
                        {q.theme || 'Theme non precise'}
                      </span>

                      {q.type_piege && q.type_piege !== 'Clé' && (
                        <span className="badge badge-warning">{q.type_piege}</span>
                      )}
                    </div>

                    {q.retour_personnalise && (
                      <p className="text-sm font-medium leading-7 text-slate-600">
                        {q.retour_personnalise}
                      </p>
                    )}

                    {q.diagnostic_erreur && q.diagnostic_erreur !== ',' && (
                      <div className="mt-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                        <div className="mb-1 text-xs font-extrabold uppercase text-slate-400">
                          Diagnostic
                        </div>
                        <p className="text-xs font-medium leading-6 text-slate-600">
                          {q.diagnostic_erreur}
                        </p>
                      </div>
                    )}

                    {q.conseil_revision && (
                      <div className="mt-3 flex gap-2 rounded-xl border border-aqua-100 bg-white/80 px-3 py-2 text-xs font-bold leading-5 text-aqua-700">
                        <Lightbulb size={15} className="shrink-0" />
                        {q.conseil_revision}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {simplePlan.length > 0 && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <CalendarDays size={17} className="text-aqua-600" />
                Plan de revision prioritaire
              </strong>
            </div>

            <div className="card-body">
              <div className="space-y-3">
                {simplePlan.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-aqua-100 bg-aqua-50/60 px-4 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-aqua-800">
                      <ListChecks size={16} />
                      Priorite {index + 1}
                    </div>
                    <p className="whitespace-pre-line text-sm font-medium leading-7 text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phases.length > 0 && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Layers size={17} className="text-aqua-600" />
                Plan complet personnalise
              </strong>
            </div>

            <div className="card-body">
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div key={phase.nom || index} className="rounded-2xl border border-line bg-white px-4 py-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-ink">
                          {phase.nom || `Phase ${index + 1}`}
                        </h3>
                        {phase.durée && (
                          <p className="text-xs font-bold text-aqua-700">
                            Duree : {phase.durée}
                          </p>
                        )}
                      </div>
                      <span className="badge badge-info">Phase {index + 1}</span>
                    </div>

                    {phase.objectifs?.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-extrabold uppercase text-slate-400">
                          Objectifs
                        </div>
                        <ul className="space-y-2">
                          {phase.objectifs.map((objectif, i) => (
                            <li key={i} className="flex gap-2 text-sm font-medium leading-6 text-slate-600">
                              <CheckCircle size={15} className="mt-1 shrink-0 text-emerald-600" />
                              {objectif}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.chapitre_prioritaires?.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-extrabold uppercase text-slate-400">
                          Chapitres prioritaires
                        </div>

                        {phase.chapitre_prioritaires.map((chapitre, i) => (
                          <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <BookOpenCheck size={15} className="text-aqua-600" />
                              <span className="text-sm font-extrabold text-ink">
                                {chapitre.chapitre}
                              </span>
                              {chapitre.classification && (
                                <span className="badge badge-warning">{chapitre.classification}</span>
                              )}
                            </div>

                            {chapitre.sous_chapitres?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {chapitre.sous_chapitres.map((sousChapitre, s) => (
                                  <div key={s} className="rounded-lg bg-white px-3 py-2">
                                    <div className="text-xs font-extrabold text-slate-700">
                                      {sousChapitre.nom}
                                    </div>
                                    {sousChapitre.objectif && (
                                      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                        {sousChapitre.objectif}
                                      </p>
                                    )}
                                    {sousChapitre.questions_ciblées?.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {sousChapitre.questions_ciblées.map((q) => (
                                          <span key={q} className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                            {q}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {chapitre.strategie?.exercices && (
                              <div className="mt-3">
                                <p className="text-xs font-medium leading-6 text-slate-500">
                                  Exercices : {chapitre.strategie.exercices.quantité} · Niveau :{' '}
                                  {chapitre.strategie.exercices.niveau} · Focus :{' '}
                                  {chapitre.strategie.exercices.focus}
                                </p>

                                {/* AFFICHAGE DES EXERCICES DÉTAILLÉS */}
                                {chapitre.strategie.exercices.liste_exercices?.length > 0 && (
                                  <div className="mt-3 space-y-3">
                                    <div className="text-xs font-extrabold uppercase text-slate-400">
                                      📝 Exercices détaillés
                                    </div>
                                    {chapitre.strategie.exercices.liste_exercices.map((exo, idx) => (
                                      <div key={idx} className="rounded-xl border border-aqua-100 bg-white p-3">
                                        <div className="text-xs font-extrabold text-aqua-700">
                                          {exo.titre || `Exercice ${idx + 1}`}
                                        </div>
                                        <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                                          {exo.enonce}
                                        </p>
                                        {exo.solution && (
                                          <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2">
                                            <span className="text-xs font-extrabold text-emerald-700">✅ Solution :</span>
                                            <span className="ml-1 text-xs font-medium text-slate-600">
                                              {exo.solution}
                                            </span>
                                          </div>
                                        )}
                                        {exo.astuce && (
                                          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                                            <Lightbulb size={12} /> 💡 {exo.astuce}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {chapitre.strategie?.réflexes?.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {chapitre.strategie.réflexes.map((reflexe, r) => (
                                  <li key={r} className="text-xs font-medium leading-5 text-slate-500">
                                    - {reflexe}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {chapitre.strategie?.calcul_mental?.programme && (
                              <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                                <span className="text-xs font-extrabold text-amber-700">🧠 Calcul mental :</span>
                                <span className="ml-1 text-xs font-medium text-slate-600">
                                  {chapitre.strategie.calcul_mental.programme} · {chapitre.strategie.calcul_mental.seances} séances · {chapitre.strategie.calcul_mental.duree} min
                                </span>
                                {chapitre.strategie.calcul_mental.exercices?.length > 0 && (
                                  <ul className="mt-1 space-y-0.5">
                                    {chapitre.strategie.calcul_mental.exercices.map((ex, idx) => (
                                      <li key={idx} className="text-xs font-medium text-slate-500">
                                        - {ex}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {phase.strategie?.simulations?.length > 0 && (
                      <div className="mt-4 rounded-xl border border-aqua-100 bg-aqua-50 px-3 py-3">
                        <div className="mb-2 text-xs font-extrabold uppercase text-aqua-700">
                          Simulations
                        </div>
                        {phase.strategie.simulations.map((simulation, i) => (
                          <div key={i} className="text-xs font-medium leading-6 text-slate-600">
                            {simulation.nombre} simulation(s) · {simulation.durée} min · Objectif : {simulation.objectif}
                            {simulation.liste_exercices?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {simulation.liste_exercices.map((simExo, si) => (
                                  <div key={si} className="rounded-lg border border-aqua-200 bg-white p-2">
                                    <div className="text-xs font-extrabold text-aqua-700">{simExo.titre}</div>
                                    <p className="text-xs text-slate-600">{simExo.enonce}</p>
                                    {simExo.consigne && (
                                      <p className="mt-1 text-[10px] font-medium text-slate-400">📌 {simExo.consigne}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {ressources?.fiches_reflexes?.length > 0 && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <ListChecks size={17} className="text-aqua-600" />
                Fiches reflexes
              </strong>
            </div>

            <div className="card-body grid grid-cols-1 gap-3 md:grid-cols-2">
              {ressources.fiches_reflexes.map((fiche, index) => (
                <div key={index} className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
                  <h3 className="mb-2 text-sm font-extrabold text-ink">{fiche.nom}</h3>
                  <ul className="space-y-1">
                    {fiche.contenu?.map((item, i) => (
                      <li key={i} className="text-xs font-medium leading-5 text-slate-600">
                        - {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {ressources?.programmes_calcul_mental?.length > 0 && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Zap size={17} className="text-aqua-600" />
                Programmes de calcul mental
              </strong>
            </div>

            <div className="card-body grid grid-cols-1 gap-3 md:grid-cols-2">
              {ressources.programmes_calcul_mental.map((programme, index) => (
                <div key={index} className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <h3 className="mb-1 text-sm font-extrabold text-amber-800">{programme.nom}</h3>
                  <ul className="space-y-0.5">
                    {programme.objectifs?.map((obj, i) => (
                      <li key={i} className="text-xs font-medium text-slate-600">
                        ✓ {obj}
                      </li>
                    ))}
                  </ul>
                  {programme.exercices?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-[10px] font-extrabold uppercase text-amber-600">Exercices</div>
                      <ul className="space-y-0.5">
                        {programme.exercices.map((ex, i) => (
                          <li key={i} className="text-xs font-medium text-slate-500">
                            - {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback.synthese?.texte_global && (
          <div className="card mb-5">
            <div className="card-header">
              <strong className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Target size={17} className="text-aqua-600" />
                Synthese globale
              </strong>
            </div>

            <div className="card-body">
              <p className="text-sm font-medium leading-8 text-slate-600">
                {feedback.synthese.texte_global}
              </p>

              {feedback.synthese?.message_motivation && (
                <div className="mt-4 flex gap-2 rounded-2xl border border-aqua-100 bg-aqua-50 px-4 py-3 text-sm font-extrabold leading-6 text-aqua-700">
                  <Zap size={17} className="shrink-0" />
                  {feedback.synthese.message_motivation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}