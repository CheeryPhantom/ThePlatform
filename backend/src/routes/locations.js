import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'nepal-admin.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

const byProvince = new Map(data.provinces.map((p) => [p.code, p]));
const byDistrict = new Map(data.districts.map((d) => [d.code, d]));
const byMunicipality = new Map(data.municipalities.map((m) => [m.code, m]));

const router = express.Router();

router.get('/provinces', (_req, res) => {
  res.json({ provinces: data.provinces });
});

router.get('/districts', (req, res) => {
  const provinceCode = req.query.province;
  if (provinceCode && !byProvince.has(provinceCode)) {
    return res.status(404).json({ error: 'Unknown province code' });
  }
  const list = provinceCode
    ? data.districts.filter((d) => d.province_code === provinceCode)
    : data.districts;
  res.json({ districts: list });
});

router.get('/municipalities', (req, res) => {
  const districtCode = req.query.district;
  if (districtCode && !byDistrict.has(districtCode)) {
    return res.status(404).json({ error: 'Unknown district code' });
  }
  const list = districtCode
    ? data.municipalities.filter((m) => m.district_code === districtCode)
    : data.municipalities;
  res.json({ municipalities: list });
});

export const resolveLocation = ({ province_code, district_code, municipality_code }) => {
  const province = province_code ? byProvince.get(province_code) : null;
  const district = district_code ? byDistrict.get(district_code) : null;
  const municipality = municipality_code ? byMunicipality.get(municipality_code) : null;
  if (province_code && !province) throw new Error('Invalid province_code');
  if (district_code && !district) throw new Error('Invalid district_code');
  if (municipality_code && !municipality) throw new Error('Invalid municipality_code');
  if (district && province && district.province_code !== province.code) {
    throw new Error('District does not belong to selected province');
  }
  if (municipality && district && municipality.district_code !== district.code) {
    throw new Error('Municipality does not belong to selected district');
  }
  return { province, district, municipality };
};

export default router;
