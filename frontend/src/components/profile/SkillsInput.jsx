import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../api/api';
import { LIMITS } from '../../utils/validation';

const SkillsInput = ({ value = [], onChange, error }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const q = input.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      apiFetch(`skills/search?q=${encodeURIComponent(q)}&limit=8`)
        .then((d) => {
          const existing = new Set(value.map((s) => s.toLowerCase()));
          setSuggestions((d.results || []).filter((s) => !existing.has(s.norm)));
          setOpen(true);
          setActiveIndex(0);
        })
        .catch(() => setSuggestions([]));
    }, 120);
    return () => clearTimeout(t);
  }, [input, value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const addSkill = (name) => {
    const clean = name.trim();
    if (!clean) return;
    if (clean.length > LIMITS.skill.max) return;
    if (value.length >= LIMITS.maxSkills) return;
    if (value.some((s) => s.toLowerCase() === clean.toLowerCase())) return;
    onChange([...value, clean]);
    setInput('');
    setSuggestions([]);
    setOpen(false);
  };

  const removeSkill = (skill) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (open && suggestions.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        addSkill(suggestions[activeIndex].name);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  const atCap = value.length >= LIMITS.maxSkills;

  return (
    <div className="skills-input-wrap" ref={wrapRef}>
      <div className="skills-display">
        {value.map((s) => (
          <span key={s} className="skill-tag">
            {s}
            <button
              type="button"
              className="skill-tag-remove"
              onClick={() => removeSkill(s)}
              aria-label={`Remove ${s}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, LIMITS.skill.max))}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length && setOpen(true)}
        placeholder={atCap ? `Max ${LIMITS.maxSkills} skills reached` : 'Type a skill…'}
        disabled={atCap}
      />
      {open && suggestions.length > 0 && (
        <ul className="skills-suggestion-list" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              role="option"
              aria-selected={i === activeIndex}
              className={i === activeIndex ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                addSkill(s.name);
              }}
            >
              <span>{s.name}</span>
              <span className="skills-suggestion-cat">{s.category_label}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="field-hint">
        {value.length} / {LIMITS.maxSkills} skills · Press Enter or comma to add
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SkillsInput;
