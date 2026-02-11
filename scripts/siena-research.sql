-- Deep Research: Siena & Il Palio — Medieval Tuscany
-- Destination ID: wzfDqK3Kg8jHIsFWF8Yhf

-- Update destination_research with comprehensive data
UPDATE destination_research SET
  country = 'Italy',
  region = 'Tuscany',
  timezone = 'Europe/Rome (CET/CEST, UTC+1/+2)',
  language = 'Italian',
  local_currency = 'EUR',
  population = '~54,000 (historic center much smaller)',
  elevation = '322m (1,056 ft)',
  best_time_to_visit = 'Late June - early July (Il Palio on July 2!), or September-October for fewer crowds and harvest season',
  avg_temp_high_c = 31,
  avg_temp_low_c = 17,
  rainy_days_per_month = 4,
  weather_notes = 'July is hot and dry — expect 30-33°C daytime. Evenings cool to ~17°C. Pack sunscreen, hat, and comfortable shoes for cobblestones. If it rains on Palio day, the race postpones to the next day.',
  daily_budget_low = 80.00,
  daily_budget_mid = 150.00,
  daily_budget_high = 300.00,
  budget_currency = 'EUR',
  cost_notes = 'Siena is moderately priced for Tuscany. Budget €15-25 for a trattoria lunch, €30-50 for dinner. Wine is excellent and affordable — €4-8/glass at enotecas. Palio grandstand tickets: €300-800+. Standing in the Campo center is FREE but requires arriving 4-6 hours early.',
  transport_notes = 'No train station in the center — Siena train station is 2km out (bus or taxi). Better to arrive by bus from Florence (SITA/Tiemme, ~75min, €8). By car: 1hr from Florence via raccordo Firenze-Siena (free highway). Parking outside walls at Stadio or Fortezza lots. Historic center is ZTL (restricted traffic zone) — do NOT drive in. Everything walkable within walls but very hilly.',
  nearest_airport = 'Florence (FLR) - 75km / Pisa (PSA) - 130km',
  safety_rating = 4,
  safety_notes = 'Siena is very safe. During Il Palio, the Campo gets extremely crowded (60,000+ people). The crowd can be intense — stay hydrated, watch for pickpockets, avoid bringing small children into the center. No glass bottles or umbrellas allowed. Contrada rivalries are passionate but violence toward tourists is essentially unheard of. Follow police instructions and don''t get near the horses.',
  cultural_notes = 'Siena is divided into 17 contrade (neighborhoods), each with its own identity, church, fountain, museum, and fierce pride. The Palio is NOT a tourist event — it''s a deeply authentic community tradition dating to 1644 (and earlier forms to the 1200s). Contrada members are born into their allegiance. Respect the tension and emotion — don''t make sarcastic comments, don''t touch the horses, and if contrada members ask you to move, comply immediately. The city is a UNESCO World Heritage Site with remarkably preserved medieval architecture.',
  summary = 'Siena is a medieval jewel in the heart of Tuscany — a UNESCO World Heritage city centered on the magnificent shell-shaped Piazza del Campo. Its 17 contrade (neighborhoods) maintain fierce rivalries dating back centuries, culminating in the legendary Palio horse race on July 2 and August 16. The Duomo di Siena is one of Italy''s greatest cathedrals with its striking black-and-white marble striping. Beyond the Palio, Siena offers world-class Tuscan cuisine, proximity to Chianti wine country, and easy day trips to San Gimignano and the Val d''Orcia. The city''s remarkably preserved Gothic architecture makes it feel like stepping into the 13th century.',
  travel_tips = '["IL PALIO (July 2): Standing in the Piazza del Campo center is FREE but arrive by 2-3 PM (race starts ~7:30 PM). Once you enter the center, you CANNOT leave until after the race. Bring: water, snacks, hat, sunscreen, comfortable shoes. NO glass bottles, NO umbrellas, NO large bags.", "PALIO GRANDSTAND TICKETS: Bleacher seats around the track cost €300-800+ and sell out months in advance. Book through paliodisiena.tickets or intuscany.net. Balcony seats from €500-2000+ via private apartment owners.", "PALIO PRE-RACE EVENTS: June 29 = horse selection trials (tratta) at 9 AM + horse lottery at ~1 PM + first trial at 7:45 PM. June 30-July 1 = more trials morning and evening. July 1 evening = Prova Generale (dress rehearsal) followed by Cena della Prova Generale (contrada dinners — tourists can attend with advance reservation at contrada clubhouses, ~€30-50).", "ARRIVE EARLY for trials too — 8:30 AM for morning trials, 6:00 PM for evening trials. You get locked inside the Campo center for 1.5-2 hours during trials. No restrooms in the center.", "PALIO DAY (July 2): Morning ''Provaccia'' trial at 9 AM. The historic pageant (Corteo Storico) begins ~5 PM with 600+ participants in medieval costume. Race starts ~7:30 PM and lasts about 90 seconds. The winning contrada celebrates for DAYS.", "CONTRADA DINNERS: The Cena della Prova Generale on July 1 evening is the most accessible to visitors. Contact the contrada society/clubhouse days in advance to reserve. Expect long communal tables, Tuscan food, and incredible atmosphere.", "SIENA CATHEDRAL (Duomo): Don''t miss the Piccolomini Library (stunning frescoes), the marble floor mosaics (only fully uncovered Aug-Oct), and climb the Facciatone for panoramic views. Buy the OPA SI Pass for all cathedral complex sites (~€15).", "CHIANTI WINE: Siena is the southern gateway to Chianti Classico. Rent a car and drive the SR222 (Chiantigiana) through Castellina, Radda, and Greve in Chianti. Stop at estates like Castello di Brolio, Badia a Coltibuono, or Fontodi for tastings (book ahead).", "SAN GIMIGNANO DAY TRIP: Only 40km northwest (~45min drive). Famous for its medieval towers — 14 survive of the original 72. Visit Piazza della Cisterna, try Gelateria Dondoli (world champion gelato), and taste Vernaccia di San Gimignano wine. Can easily combine with Chianti stops.", "TUSCAN COUNTRYSIDE DRIVES: Val d''Orcia (south of Siena) is UNESCO-listed — the iconic cypress-lined roads and rolling hills you see on postcards. Visit Pienza (pecorino cheese), Montalcino (Brunello wine), and Montepulciano (Vino Nobile). Full day needed.", "PARKING: Use Parcheggio Il Campo (underground, closest to center), Fortezza Medicea (large, free-ish), or Stadio. During Palio days parking is extremely limited — arrive very early or use park-and-ride from outside.", "WATER FOUNTAINS: Siena has fonti (historic fountains) everywhere — Fonte Gaia in the Campo is decorative, but there are drinkable fountains throughout the city. Bring a refillable bottle."]',
  updated_at = NOW()
WHERE destination_id = 'wzfDqK3Kg8jHIsFWF8Yhf';

-- Delete existing highlights to replace with comprehensive ones
DELETE FROM destination_highlights WHERE destination_id = 'wzfDqK3Kg8jHIsFWF8Yhf';

-- Insert comprehensive highlights
-- ATTRACTIONS
INSERT INTO destination_highlights (id, destination_id, title, description, category, rating, price_level, address, duration, order_index, created_at) VALUES
('siena-h-01', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Piazza del Campo', 'One of Europe''s greatest medieval squares — a stunning shell-shaped piazza that serves as Siena''s living room. This is where Il Palio takes place. The sloping brick surface is divided into 9 segments representing the medieval Council of Nine. Surrounded by Gothic palazzi, cafes, and the soaring Torre del Mangia. Come early morning or evening for the best experience — or on July 2 for the Palio.', 'attraction', 4.9, 1, 'Piazza del Campo, Siena', '1-2 hours (or all day during Palio)', 0, NOW()),

('siena-h-02', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Duomo di Siena (Cathedral)', 'A masterpiece of Italian Gothic architecture with its dramatic black-and-white marble striping. Interior highlights: the Piccolomini Library with Pinturicchio frescoes, the extraordinary marble floor (56 panels, fully uncovered Aug-Oct), Nicola Pisano''s pulpit, and works by Donatello and Bernini. Climb the unfinished nave wall (Facciatone) for breathtaking panoramic views of the city.', 'cultural', 4.9, 2, 'Piazza del Duomo, Siena', '2-3 hours', 1, NOW()),

('siena-h-03', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Torre del Mangia', 'The 102-meter bell tower of Palazzo Pubblico — one of the tallest medieval towers in Italy. Climb 400+ steps for 360° views over Siena''s terracotta rooftops and the Tuscan countryside. Named after its first bell-ringer, Giovanni di Balduccio, nicknamed "Mangiaguadagni" (profit-eater) for his spendthrift ways.', 'attraction', 4.7, 2, 'Piazza del Campo, Palazzo Pubblico', '1 hour', 2, NOW()),

('siena-h-04', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Il Palio (July 2)', 'The legendary bareback horse race around Piazza del Campo — 90 seconds of pure adrenaline preceded by days of medieval pageantry. Ten of the 17 contrade compete. The elaborate Corteo Storico (historical procession) with 600+ participants in medieval costume begins at ~5 PM. The race itself starts around 7:30 PM. Standing in the center is FREE but requires arriving by 2-3 PM. An absolutely unforgettable, authentically Italian experience.', 'activity', 5.0, 1, 'Piazza del Campo, Siena', 'Full day event (arrive by 2-3 PM, race at 7:30 PM)', 3, NOW()),

('siena-h-05', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Contrade Neighborhoods', 'Siena''s 17 contrade are living medieval neighborhoods, each with its own church, fountain, museum, flag, and fierce identity. Wander the streets and spot contrada flags, plaques, and ceramic street signs. Notable contrade: Oca (Goose), Lupa (She-Wolf), Torre (Tower), Drago (Dragon). Some contrada museums are open to visitors — ask at the local society clubhouse. During Palio days, the streets come alive with contrada flags, songs, and processions.', 'cultural', 4.6, 1, 'Throughout Siena historic center', '2-4 hours to explore', 4, NOW()),

('siena-h-06', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Palazzo Pubblico & Museo Civico', 'Siena''s Gothic town hall houses the Museo Civico with stunning frescoes including Ambrogio Lorenzetti''s "Allegory of Good and Bad Government" (1338-39) — one of the most important secular paintings of the Middle Ages. Also see Simone Martini''s "Maestà" in the Sala del Mappamondo.', 'cultural', 4.7, 2, 'Piazza del Campo 1, Siena', '1.5-2 hours', 5, NOW()),

('siena-h-07', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Basilica di San Domenico', 'A massive Gothic church associated with St. Catherine of Siena, who had her mystical visions here. Contains her preserved head (yes, really) in a marble tabernacle and Andrea Vanni''s portrait of her — the only one painted during her lifetime. Great views of the Duomo from outside.', 'cultural', 4.4, 1, 'Piazza San Domenico, Siena', '30-45 min', 6, NOW()),

('siena-h-08', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Santa Maria della Scala', 'One of Europe''s oldest hospitals (founded ~1090), now a vast museum complex beneath the Duomo. Highlights: the Pellegrinaio frescoes depicting medieval hospital life, archaeological museum, and rotating contemporary art exhibitions. An underrated gem that most tourists skip.', 'cultural', 4.5, 2, 'Piazza Duomo 1, Siena', '1.5-2 hours', 7, NOW()),

-- DAY TRIPS
('siena-h-09', 'wzfDqK3Kg8jHIsFWF8Yhf', 'San Gimignano Day Trip', 'The "Medieval Manhattan" — famous for its 14 surviving tower-houses (of an original 72). Only 40km from Siena (~45min drive). Don''t miss: Piazza della Cisterna, the Collegiate Church frescoes, climbing Torre Grossa for views, and Gelateria Dondoli (world champion gelato). Taste Vernaccia di San Gimignano, the area''s crisp white wine. Can combine with Chianti wine stops en route. Best to visit early morning or late afternoon to avoid tour bus crowds.', 'activity', 4.7, 2, 'San Gimignano (40km NW of Siena)', 'Half to full day', 8, NOW()),

('siena-h-10', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Chianti Wine Country Drive', 'The SR222 "Chiantigiana" road from Siena north through the Chianti Classico wine region is one of Italy''s great drives. Stop at: Castello di Brolio (birthplace of modern Chianti), Badia a Coltibuono (monastery-turned-winery), Castellina in Chianti (charming hilltop town). Book tastings in advance — most estates offer tours + tasting for €20-40. The landscape of vineyards, olive groves, and cypress trees is pure Tuscan poetry.', 'activity', 4.8, 2, 'Chianti region (north of Siena along SR222)', 'Half to full day', 9, NOW()),

('siena-h-11', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Val d''Orcia Drive', 'UNESCO World Heritage landscape south of Siena — the iconic Tuscan postcard scenery. Visit Pienza (Renaissance "ideal city" + pecorino cheese), Montalcino (home of Brunello, one of Italy''s greatest wines), and Montepulciano (Vino Nobile + stunning hilltop setting). The cypress-lined road near Monticchiello is the most photographed road in Tuscany.', 'activity', 4.8, 2, 'Val d''Orcia (south of Siena, ~45min drive)', 'Full day', 10, NOW()),

-- FOOD & DRINK
('siena-h-12', 'wzfDqK3Kg8jHIsFWF8Yhf', 'La Taverna di San Giuseppe', 'Widely considered Siena''s best restaurant. Set in an Etruscan cellar, serving refined Tuscan cuisine: pici (thick hand-rolled pasta) with wild boar ragù, ribollita, and exceptional local wines. Reserve well in advance, especially during Palio week.', 'food', 4.8, 3, 'Via Giovanni Dupré 132, Siena', '2 hours', 11, NOW()),

('siena-h-13', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Osteria Le Logge', 'Elegant osteria in a former pharmacy near the Campo. Creative Tuscan dishes with seasonal ingredients. Try the tagliatelle with truffles or the Chianina beef tagliata. Beautiful interior with original pharmacy cabinets. One of Siena''s most atmospheric dining rooms.', 'food', 4.7, 3, 'Via del Porrione 33, Siena', '2 hours', 12, NOW()),

('siena-h-14', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Trattoria Papei', 'Beloved local trattoria near Piazza del Mercato. No-frills, generous portions of classic Sienese food at honest prices. Outdoor terrace in summer. Perfect for ribollita, pici all''aglione, and bistecca. Popular with locals — a good sign.', 'food', 4.5, 2, 'Piazza del Mercato 6, Siena', '1.5 hours', 13, NOW()),

('siena-h-15', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Antica Osteria da Divo', 'Romantic restaurant built into Etruscan-era caves beneath the Duomo. Innovative Tuscan cuisine — try the pici with cheese and pepper or the guinea fowl. The underground dining rooms carved from tufa rock are extraordinary. Book ahead.', 'food', 4.6, 3, 'Via Franciosa 25, Siena', '2 hours', 14, NOW()),

('siena-h-16', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Enoteca Italiana (Fortezza Medicea)', 'Italy''s national wine collection, housed in the vaults of the Medici Fortress. Taste wines from every Italian region. During summer, the fortress terrace hosts wine events with views over the city. Perfect for a sunset aperitivo.', 'nightlife', 4.6, 2, 'Fortezza Medicea, Siena', '1-2 hours', 15, NOW()),

('siena-h-17', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Wine Cellar by Sapordivino', 'Top-rated wine bar in the center. Excellent selection of Tuscan wines by the glass, paired with local cheeses and salumi. Knowledgeable staff who can guide you through Chianti Classico, Brunello, and Super Tuscans. Intimate atmosphere.', 'nightlife', 4.7, 2, 'Via Pantaneto 16, Siena', '1-2 hours', 16, NOW()),

('siena-h-18', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Pasticceria Nannini', 'Siena''s most famous pastry shop, open since 1867. Try the local specialties: panforte (dense spiced fruit cake — Siena''s signature), ricciarelli (almond cookies), and cavallucci. Perfect for breakfast cornetto and espresso. Multiple locations but the Via Banchi di Sopra shop is the original.', 'food', 4.5, 1, 'Via Banchi di Sopra 24, Siena', '30 min', 17, NOW()),

('siena-h-19', 'wzfDqK3Kg8jHIsFWF8Yhf', 'Cena della Prova Generale (Contrada Dinner)', 'On the evening of July 1, all ten contrade racing in the Palio hold massive outdoor dinners in their neighborhoods. Tourists can attend with advance reservation at the contrada''s clubhouse (società). Expect communal tables, classic Tuscan food, flowing wine, contrada songs, and an electric atmosphere. ~€30-50 per person. Contact contrada societies days in advance. An unmissable cultural experience.', 'activity', 4.9, 2, 'Various contrada neighborhoods, Siena', '3-4 hours', 18, NOW());

-- Update weather monthly data for July
DELETE FROM destination_weather_monthly WHERE destination_id = 'wzfDqK3Kg8jHIsFWF8Yhf';
INSERT INTO destination_weather_monthly (id, destination_id, month, avg_high_c, avg_low_c, rainy_days, sunshine_hours) VALUES
('siena-w-01', 'wzfDqK3Kg8jHIsFWF8Yhf', 1, 8, 1, 7, 4),
('siena-w-02', 'wzfDqK3Kg8jHIsFWF8Yhf', 2, 10, 2, 6, 5),
('siena-w-03', 'wzfDqK3Kg8jHIsFWF8Yhf', 3, 13, 4, 7, 5),
('siena-w-04', 'wzfDqK3Kg8jHIsFWF8Yhf', 4, 17, 7, 8, 7),
('siena-w-05', 'wzfDqK3Kg8jHIsFWF8Yhf', 5, 22, 11, 7, 8),
('siena-w-06', 'wzfDqK3Kg8jHIsFWF8Yhf', 6, 27, 15, 5, 10),
('siena-w-07', 'wzfDqK3Kg8jHIsFWF8Yhf', 7, 31, 17, 3, 11),
('siena-w-08', 'wzfDqK3Kg8jHIsFWF8Yhf', 8, 31, 17, 4, 10),
('siena-w-09', 'wzfDqK3Kg8jHIsFWF8Yhf', 9, 26, 14, 6, 8),
('siena-w-10', 'wzfDqK3Kg8jHIsFWF8Yhf', 10, 20, 10, 8, 6),
('siena-w-11', 'wzfDqK3Kg8jHIsFWF8Yhf', 11, 13, 5, 9, 4),
('siena-w-12', 'wzfDqK3Kg8jHIsFWF8Yhf', 12, 9, 2, 7, 3);

-- Update destination status
UPDATE trip_destinations SET
  research_status = 'fully_researched',
  last_researched_at = NOW()
WHERE id = 'wzfDqK3Kg8jHIsFWF8Yhf';
