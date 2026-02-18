#!/bin/bash
# Batch find images for ALL Italy destination highlights
cd /root/clawd/odyssey

DESTINATIONS=$(psql postgresql://postgres:postgres@localhost:5432/odyssey -t -A -c "
SELECT td.id FROM trip_destinations td 
JOIN destination_highlights dh ON dh.destination_id = td.id
WHERE td.trip_id = 'LMp0E_5U2QFsNL-MoGDHh'
AND (dh.image_url IS NULL OR dh.image_url LIKE '%unsplash%')
GROUP BY td.id
HAVING COUNT(*) > 0
ORDER BY td.name
")

for dest_id in $DESTINATIONS; do
  echo "=========================================="
  bun scripts/batch-highlight-images.ts "$dest_id"
  echo ""
done

echo "🎉 ALL DONE"
