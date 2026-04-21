const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'temporary', label: 'Temporary' }
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on_site', label: 'On-site' }
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1–10 (startup)' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-1000', label: '201–1000' },
  { value: '1000+', label: '1000+ (enterprise)' }
];

const AVAILABILITY = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'within_2_weeks', label: 'Within 2 weeks' },
  { value: 'within_1_month', label: 'Within 1 month' },
  { value: 'within_3_months', label: 'Within 3 months' },
  { value: 'not_looking', label: 'Not actively looking' }
];

const WORK_AUTH = [
  { value: 'np_citizen', label: 'Nepali citizen' },
  { value: 'np_permanent_resident', label: 'Nepal permanent resident' },
  { value: 'foreign_work_permit', label: 'Foreign work permit' },
  { value: 'student_visa', label: 'Student visa' },
  { value: 'other', label: 'Other' }
];

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const PreferencesSection = ({
  preferences,
  availability,
  workAuthorization,
  onPreferencesChange,
  onAvailabilityChange,
  onWorkAuthChange
}) => {
  const p = preferences || {};
  const set = (patch) => onPreferencesChange({ ...p, ...patch });
  const salary = p.expected_salary || { currency: 'NPR', min: '', max: '', period: 'month' };

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">Preferences</h2>
      <div className="profile-form">

        <div className="form-group">
          <label className="form-label">Employment type</label>
          <div className="chip-group">
            {EMPLOYMENT_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={`chip ${(p.employment_types || []).includes(t.value) ? 'active' : ''}`}
                onClick={() => set({ employment_types: toggle(p.employment_types || [], t.value) })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Work mode</label>
          <div className="chip-group">
            {WORK_MODES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={`chip ${(p.work_modes || []).includes(t.value) ? 'active' : ''}`}
                onClick={() => set({ work_modes: toggle(p.work_modes || [], t.value) })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expected salary (per {salary.period})</label>
            <div className="salary-inputs">
              <select
                className="form-input"
                value={salary.currency}
                onChange={(e) => set({ expected_salary: { ...salary, currency: e.target.value } })}
              >
                <option value="NPR">NPR</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
              <input
                type="number"
                className="form-input"
                placeholder="Min"
                value={salary.min ?? ''}
                min="0"
                onChange={(e) =>
                  set({
                    expected_salary: {
                      ...salary,
                      min: e.target.value === '' ? '' : Number(e.target.value)
                    }
                  })
                }
              />
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={salary.max ?? ''}
                min="0"
                onChange={(e) =>
                  set({
                    expected_salary: {
                      ...salary,
                      max: e.target.value === '' ? '' : Number(e.target.value)
                    }
                  })
                }
              />
              <select
                className="form-input"
                value={salary.period || 'month'}
                onChange={(e) => set({ expected_salary: { ...salary, period: e.target.value } })}
              >
                <option value="month">per month</option>
                <option value="year">per year</option>
              </select>
            </div>
            <div className="field-hint">Salary is private. Only you and matched employers see it.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice period (days)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="180"
              value={p.notice_period_days ?? ''}
              onChange={(e) =>
                set({
                  notice_period_days: e.target.value === '' ? null : Number(e.target.value)
                })
              }
              placeholder="e.g. 30"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Availability</label>
            <select
              className="form-input"
              value={availability || ''}
              onChange={(e) => onAvailabilityChange(e.target.value)}
            >
              <option value="">Select…</option>
              {AVAILABILITY.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Work authorization</label>
            <select
              className="form-input"
              value={workAuthorization || ''}
              onChange={(e) => onWorkAuthChange(e.target.value)}
            >
              <option value="">Select…</option>
              {WORK_AUTH.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred company size</label>
          <div className="chip-group">
            {COMPANY_SIZES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={`chip ${(p.preferred_company_sizes || []).includes(t.value) ? 'active' : ''}`}
                onClick={() =>
                  set({
                    preferred_company_sizes: toggle(p.preferred_company_sizes || [], t.value)
                  })
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="pref-relocate"
              className="checkbox-input"
              checked={!!p.willing_to_relocate}
              onChange={(e) => set({ willing_to_relocate: e.target.checked })}
            />
            <label htmlFor="pref-relocate" className="checkbox-label">
              Willing to relocate
            </label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="pref-otw"
              className="checkbox-input"
              checked={!!p.open_to_work}
              onChange={(e) => set({ open_to_work: e.target.checked })}
            />
            <label htmlFor="pref-otw" className="checkbox-label">
              Open to work (show a visible badge on your profile)
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreferencesSection;
