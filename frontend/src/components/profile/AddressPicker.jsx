import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/api';
import { LIMITS } from '../../utils/validation';

/**
 * Cascading Province → District → Municipality picker for Nepal.
 * Falls back gracefully if the locations API is unreachable.
 */
const AddressPicker = ({ value, onChange, errors = {} }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('locations/provinces')
      .then((data) => {
        if (!cancelled) setProvinces(data.provinces || []);
      })
      .catch((err) => !cancelled && setLoadError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!value.province_code) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    apiFetch(`locations/districts?province=${encodeURIComponent(value.province_code)}`)
      .then((d) => !cancelled && setDistricts(d.districts || []))
      .catch(() => !cancelled && setDistricts([]));
    return () => {
      cancelled = true;
    };
  }, [value.province_code]);

  useEffect(() => {
    if (!value.district_code) {
      setMunicipalities([]);
      return;
    }
    let cancelled = false;
    apiFetch(`locations/municipalities?district=${encodeURIComponent(value.district_code)}`)
      .then((m) => !cancelled && setMunicipalities(m.municipalities || []))
      .catch(() => !cancelled && setMunicipalities([]));
    return () => {
      cancelled = true;
    };
  }, [value.district_code]);

  const handle = (field) => (e) => {
    const next = { ...value, [field]: e.target.value };
    if (field === 'province_code') {
      next.district_code = '';
      next.municipality_code = '';
    } else if (field === 'district_code') {
      next.municipality_code = '';
    }
    onChange(next);
  };

  const municipalityOptions = useMemo(
    () => [...municipalities].sort((a, b) => a.name.localeCompare(b.name)),
    [municipalities]
  );

  return (
    <div className="address-picker">
      {loadError && (
        <div className="error-message" role="alert">
          Couldn't load Nepal location data: {loadError}
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Province (Pradesh)</label>
          <select
            className="form-input"
            value={value.province_code || ''}
            onChange={handle('province_code')}
            disabled={loading}
          >
            <option value="">Select province…</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">District</label>
          <select
            className="form-input"
            value={value.district_code || ''}
            onChange={handle('district_code')}
            disabled={!value.province_code}
          >
            <option value="">
              {value.province_code ? 'Select district…' : 'Select province first'}
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Municipality / Metropolitan City</label>
          <select
            className="form-input"
            value={value.municipality_code || ''}
            onChange={handle('municipality_code')}
            disabled={!value.district_code}
          >
            <option value="">
              {value.district_code ? 'Select municipality…' : 'Select district first'}
            </option>
            {municipalityOptions.map((m) => (
              <option key={m.code} value={m.code}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ward Number</label>
          <input
            type="number"
            className="form-input"
            min={LIMITS.wardMin}
            max={LIMITS.wardMax}
            value={value.ward_number ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                ward_number: e.target.value === '' ? '' : Number(e.target.value)
              })
            }
            placeholder="e.g. 3"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Street / Tole (Optional)</label>
        <input
          type="text"
          className="form-input"
          maxLength={LIMITS.addressLine.max}
          value={value.address_line || ''}
          onChange={(e) => onChange({ ...value, address_line: e.target.value })}
          placeholder="e.g. Baluwatar, near Bhatbhateni"
        />
        <div className="field-hint">
          {(value.address_line || '').length}/{LIMITS.addressLine.max}
        </div>
        {errors.address_line && <div className="error-message">{errors.address_line}</div>}
      </div>
    </div>
  );
};

export default AddressPicker;
