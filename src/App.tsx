import {useEffect, useMemo, useState} from 'react'
import {ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, FlaskConical, LayoutGrid, Lightbulb, Menu, Plus, RotateCcw, SlidersHorizontal, Sparkles, X} from 'lucide-react'
import {type Criterion, type Decision, type Option, sampleDecision, weightedScore} from './data'
import {getDecisions, isSanityConfigured} from './sanity'

const uid = () => Math.random().toString(36).slice(2, 10)

function App() {
  const [decisions, setDecisions] = useState<Decision[]>([sampleDecision])
  const [selectedId, setSelectedId] = useState('sample')
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [view, setView] = useState<'overview' | 'compare'>('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('decision-lab-drafts') || '[]') as Decision[]
      if (Array.isArray(saved)) setDecisions([sampleDecision, ...saved])
    } catch { /* Ignore invalid local data. */ }
    if (isSanityConfigured) getDecisions().then((remote) => {
      if (remote.length) setDecisions((current) => [...remote, ...current.filter((item) => !remote.some((published) => published._id === item._id))])
    }).catch(() => setNotice('Could not load Sanity content. Showing local decisions.'))
  }, [])

  const decision = decisions.find((item) => item._id === selectedId) || decisions[0]
  const criteria = useMemo(() => decision.criteria.map((item) => ({...item, weight: weights[item._key] ?? item.weight})), [decision, weights])
  const ranking = useMemo(() => decision.options.map((option) => ({option, score: weightedScore(option, criteria)})).sort((a, b) => b.score - a.score), [decision, criteria])
  const winner = ranking[0]
  const defaultWinner = useMemo(() => decision.options.map((option) => ({option, score: weightedScore(option, decision.criteria)})).sort((a, b) => b.score - a.score)[0], [decision])
  const changedWinner = winner && defaultWinner?.option._key !== winner.option._key
  const readyToCompare = decision.criteria.length > 0 && decision.options.length > 0 && decision.options.every((option) => decision.criteria.every((criterion) => option.scores.some((score) => score.criterionKey === criterion._key || score.criterionKey === criterion.name)))
  const isSample = decision._id === 'sample'
  const isDraft = decision._id.startsWith('draft-')

  function selectDecision(id: string) { setSelectedId(id); setWeights({}); setView('overview'); setMobileMenu(false) }
  function addDecision(newDecision: Decision) {
    const drafts = [newDecision, ...decisions.filter((item) => item._id.startsWith('draft-'))]
    localStorage.setItem('decision-lab-drafts', JSON.stringify(drafts))
    setDecisions((current) => [newDecision, ...current])
    selectDecision(newDecision._id)
    setShowCreate(false)
    setNotice('Decision saved in this browser. Add it to Sanity Studio to publish it.')
  }
  function updateScore(optionKey: string, criterionKey: string, value: number) {
    const updated = decisions.map((item) => item._id !== decision._id ? item : {
      ...item,
      options: item.options.map((option) => option._key !== optionKey ? option : {
        ...option,
        scores: option.scores.map((score) => score.criterionKey !== criterionKey ? score : {...score, value}),
      }),
    })
    setDecisions(updated)
    localStorage.setItem('decision-lab-drafts', JSON.stringify(updated.filter((item) => item._id.startsWith('draft-'))))
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><FlaskConical size={20} strokeWidth={2.5}/></div><div className="brand-name">decision<span>lab.</span></div><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={20}/></button></div>
      <div className="workspace-label">WORKSPACE <ChevronDown size={13}/></div>
      <button className={`side-link ${view === 'overview' ? 'side-active' : ''}`} onClick={() => setView('overview')}><LayoutGrid size={18}/> Overview</button>
      <button className={`side-link ${view === 'compare' ? 'side-active' : ''}`} onClick={() => setView('compare')}><SlidersHorizontal size={18}/> Compare options</button>
      <div className="side-section"><span>YOUR DECISIONS</span><button onClick={() => setShowCreate(true)} aria-label="New decision"><Plus size={17}/></button></div>
      <div className="decision-list">{decisions.map((item) => <button key={item._id} className={`decision-link ${item._id === decision._id ? 'decision-active' : ''}`} onClick={() => selectDecision(item._id)}><span className="decision-dot"/><span>{item.title}</span></button>)}</div>
      <button className="new-side" onClick={() => setShowCreate(true)}><Plus size={17}/> New decision</button>
      <div className="side-bottom"><div className="hint-icon"><Lightbulb size={18}/></div><strong>Clarity is a superpower.</strong><p>Make the tradeoffs visible, then make your move.</p></div>
      <div className="profile"><div className="avatar">DL</div><div><strong>Your workspace</strong><span>{isSanityConfigured ? 'Sanity connected' : 'Local demo mode'}</span></div><span className="profile-more">•••</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="hamburger" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={22}/></button><div className="breadcrumbs">Workspace <span>/</span> Decisions <span>/</span> <strong>{decision.title}</strong></div><div className="topbar-right"><span className="live-pill"><span/> {isSanityConfigured ? 'SANITY CONNECTED' : 'DEMO WORKSPACE'}</span><button className="help-button" title="How it works" onClick={() => setNotice('Scores are a weighted average. Change the importance sliders to test different priorities.')}><CircleHelp size={20}/></button></div></header>
      <div className="page-content">
        {notice && <div className="notice">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
        <div className="eyebrow"><span className="eyebrow-line"/> DECISION WORKSPACE <span className="eyebrow-separator">/</span> {decision.category.toUpperCase()}</div>
        <div className="hero-row"><div><h1>{decision.title}</h1><p className="subtitle">{decision.description}</p></div><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={18}/> New decision</button></div>
        <div className="hero-meta"><span className="meta-avatar">✦</span><span>{isSample ? 'Example decision' : isDraft ? 'Saved locally' : 'Published in Sanity'}</span><span className="meta-divider">·</span><span>{decision.options.length} options</span><span className="meta-divider">·</span><span>{decision.criteria.length} criteria</span></div>
        <div className="tabs"><button className={view === 'overview' ? 'tab-active' : ''} onClick={() => setView('overview')}>Overview</button><button className={view === 'compare' ? 'tab-active' : ''} onClick={() => setView('compare')}>Compare options <span>{decision.options.length}</span></button></div>
        {view === 'overview' ? <>
          <section className="insight-card"><div className="insight-icon"><Sparkles size={23}/></div><div className="insight-copy"><div className="insight-label">{readyToCompare ? 'THE CURRENT FRONT RUNNER' : 'ONE MORE STEP'}</div><h2>{readyToCompare ? winner?.option.name : 'Add scores to compare'} {readyToCompare && <span className="insight-score">{winner?.score || 0}% match</span>}</h2><p>{!readyToCompare ? 'Give every option a score for each criterion in Sanity Studio, then refresh this page.' : changedWinner ? 'Your new priorities changed the front runner. Compare the details before deciding.' : 'Based on the priorities below, this option has the strongest overall fit.'}</p></div><button className="insight-link" onClick={() => setView('compare')}>See breakdown <ArrowRight size={17}/></button></section>
          <div className="section-heading"><div><h2>At a glance</h2><p>How each option stacks up against what matters to you.</p></div><button className="text-link" onClick={() => setView('compare')}>Full comparison <ArrowUpRight size={16}/></button></div>
          <div className="option-grid">{ranking.map(({option, score}, index) => <div className="option-card" key={option._key}><div className="card-head"><div className={`option-mark ${option.color}`}>{option.name.slice(0, 1)}</div>{readyToCompare && index === 0 && <span className="best-tag"><Check size={13}/> BEST MATCH</span>}</div><h3>{option.name}</h3><p>{option.summary}</p><div className="score-row"><strong>{readyToCompare ? score : '—'}{readyToCompare && <small>%</small>}</strong><span>overall fit</span></div><div className="progress-track"><div className={`progress-fill ${option.color}`} style={{width: `${readyToCompare ? score : 0}%`}}/></div><button className="card-link" onClick={() => setView('compare')}>View breakdown <ArrowRight size={15}/></button></div>)}</div>
        </> : <section className="comparison-section"><div className="section-heading"><div><h2>Side by side</h2><p>{isDraft ? 'Choose scores from 1 to 5. Changes are saved in this browser.' : 'Scores reflect your current importance settings.'}</p></div></div><div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>CRITERION</th>{ranking.map(({option, score}) => <th key={option._key}><span className={`table-mark ${option.color}`}>{option.name.slice(0, 1)}</span><strong>{option.name}</strong><span className="table-total">{readyToCompare ? `${score}% fit` : 'Add scores'}</span></th>)}</tr></thead><tbody>{criteria.map((criterion) => <tr key={criterion._key}><th>{criterion.name}<small>Weight {criterion.weight}/5</small></th>{ranking.map(({option}) => {const entry = option.scores.find((score) => score.criterionKey === criterion._key || score.criterionKey === criterion.name);return <td key={option._key}>{isDraft ? <select className="score-select" aria-label={`Score for ${option.name} on ${criterion.name}`} value={entry?.value ?? 3} onChange={(event) => updateScore(option._key, criterion._key, Number(event.target.value))}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}</select> : <strong className="cell-score">{entry?.value ?? '—'}<small>/5</small></strong>}<span>{entry?.note || (isDraft ? 'Score this option against the criterion' : 'No reasoning added yet')}</span></td>})}</tr>)}</tbody></table></div></section>}
        <section className="priorities-section"><div className="section-heading"><div><h2>Your priorities <span className="section-badge">INTERACTIVE</span></h2><p>Move the sliders to see how the ranking changes in real time.</p></div><button className="reset-button" onClick={() => setWeights({})}><RotateCcw size={15}/> Reset weights</button></div><div className="priority-card">{criteria.map((criterion) => <div className="priority-row" key={criterion._key}><div className="priority-text"><strong>{criterion.name}</strong><span>{criterion.description || 'A factor in this decision'}</span></div><div className="slider-group"><input aria-label={`Importance of ${criterion.name}`} type="range" min="1" max="5" value={criterion.weight} onChange={(event) => setWeights((current) => ({...current, [criterion._key]: Number(event.target.value)}))}/><span className="weight-value">{criterion.weight}<small>/5</small></span></div></div>)}</div></section>
        <div className="bottom-note"><span><Lightbulb size={16}/> A score is a starting point, not the final answer.</span><span>Built for clearer thinking.</span></div>
      </div>
    </main>
    {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={addDecision}/>}
  </div>
}

function CreateModal({onClose, onCreate}: {onClose: () => void; onCreate: (decision: Decision) => void}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [criteria, setCriteria] = useState([{name: '', weight: 3}, {name: '', weight: 3}])
  const canCreate = title.trim() && options.filter((name) => name.trim()).length >= 2 && criteria.filter((item) => item.name.trim()).length >= 2
  function create() {
    if (!canCreate) return
    const mappedCriteria: Criterion[] = criteria.filter((item) => item.name.trim()).map((item) => ({_key: uid(), name: item.name.trim(), weight: item.weight}))
    const colors: Option['color'][] = ['coral', 'blue', 'green', 'purple']
    const mappedOptions: Option[] = options.filter((name) => name.trim()).map((name, index) => ({_key: uid(), name: name.trim(), summary: 'Add your reasoning as you explore', color: colors[index % colors.length], scores: mappedCriteria.map((item) => ({criterionKey: item._key, value: 3}))}))
    onCreate({_id: `draft-${uid()}`, title: title.trim(), description: description.trim() || 'A new decision worth thinking through.', category: 'Personal', criteria: mappedCriteria, options: mappedOptions, updatedAt: new Date().toISOString()})
  }
  return <div className="modal-backdrop" onMouseDown={(event) => {if (event.target === event.currentTarget) onClose()}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-head"><div><span className="modal-eyebrow">START WITH A QUESTION</span><h2 id="create-title">New decision</h2></div><button onClick={onClose} aria-label="Close"><X size={20}/></button></div><div className="modal-body"><label>What are you deciding?<input autoFocus placeholder="e.g. Which project should we build?" value={title} onChange={(event) => setTitle(event.target.value)}/></label><label>A little context <span>(optional)</span><textarea placeholder="What makes this decision important?" value={description} onChange={(event) => setDescription(event.target.value)}/></label><div className="modal-field-title">Options <span>At least two</span></div>{options.map((name, index) => <div className="inline-input" key={index}><span>{String(index + 1).padStart(2, '0')}</span><input placeholder={`Option ${index + 1}`} value={name} onChange={(event) => setOptions((current) => current.map((value, i) => i === index ? event.target.value : value))}/>{options.length > 2 && <button onClick={() => setOptions((current) => current.filter((_, i) => i !== index))} aria-label="Remove option"><X size={16}/></button>}</div>)}<button className="add-line" onClick={() => setOptions((current) => [...current, ''])}><Plus size={15}/> Add option</button><div className="modal-field-title">Criteria <span>What matters to you?</span></div>{criteria.map((item, index) => <div className="inline-input criterion-input" key={index}><span>{String(index + 1).padStart(2, '0')}</span><input placeholder={`Criterion ${index + 1}`} value={item.name} onChange={(event) => setCriteria((current) => current.map((value, i) => i === index ? {...value, name: event.target.value} : value))}/><select aria-label={`Importance of criterion ${index + 1}`} value={item.weight} onChange={(event) => setCriteria((current) => current.map((value, i) => i === index ? {...value, weight: Number(event.target.value)} : value))}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}</select>{criteria.length > 2 && <button onClick={() => setCriteria((current) => current.filter((_, i) => i !== index))} aria-label="Remove criterion"><X size={16}/></button>}</div>)}<button className="add-line" onClick={() => setCriteria((current) => [...current, {name: '', weight: 3}])}><Plus size={15}/> Add criterion</button><p className="modal-tip">New decisions are saved in this browser. Publish them through Sanity Studio when your project is connected.</p></div><div className="modal-footer"><button className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!canCreate} onClick={create}>Create decision <ArrowRight size={17}/></button></div></div></div>
}

export default App
