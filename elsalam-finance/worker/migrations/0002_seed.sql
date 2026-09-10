-- Default settings
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('building_name', 'Elsalam'),
  ('monthly_contribution', '100'),
  ('currency', 'DH'),
  ('address', ''),
  ('city', 'Maroc');

-- Default categories
INSERT INTO categories (name, name_ar, sort_order) VALUES
  ('Femme de ménage', 'عاملة النظافة', 1),
  ('Électricité', 'الكهرباء', 2),
  ('Eau', 'الماء', 3),
  ('Entretien', 'الصيانة', 4),
  ('Réparation', 'الإصلاح', 5),
  ('Ascenseur', 'المصعد', 6),
  ('Parties communes', 'المرافق المشتركة', 7),
  ('Autres', 'أخرى', 99);

-- No residents are seeded: the admin creates them through the UI.
