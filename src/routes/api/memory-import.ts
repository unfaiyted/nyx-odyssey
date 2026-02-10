import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/memory-import')({
  POST: async ({ request }) => {
    // Trigger a memory import by running the watcher in --once mode
    const proc = Bun.spawn(['bun', 'run', 'scripts/memory-watcher.ts', '--once'], {
      cwd: import.meta.dirname ? undefined : process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env },
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    return json({
      success: exitCode === 0,
      output: stdout,
      errors: stderr || undefined,
    });
  },
});
