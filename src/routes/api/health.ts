import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async () => {
    return json({ status: 'ok', service: 'odyssey', timestamp: new Date().toISOString() });
  },
});
