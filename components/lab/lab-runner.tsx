'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle2, ListChecks } from 'lucide-react';
import type { TaskDef } from '@/lib/schemas/task-set';
import { loadDbBytes, runTask, type RunResult } from '@/lib/sql/engine';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/lab/task-card';

export type LabRunnerProps = {
  sessionId: string;
  title: string;
  tasks: TaskDef[];
  dbUrl: string;
  solvedTaskIds: string[];
};

async function persistSubmission(
  sessionId: string,
  task: TaskDef,
  inputs: Record<string, string>,
  result: RunResult
) {
  try {
    await fetch(`/api/sessions/${sessionId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: task.id,
        inputs,
        finalQuery: result.finalQuery,
        result: result.errored
          ? { error: result.errorMessage }
          : { results: result.results },
        isCorrect: result.isCorrect,
      }),
    });
  } catch {
    // Best-effort; the lab still works locally if persistence fails.
  }
}

export function LabRunner({
  sessionId,
  title,
  tasks,
  dbUrl,
  solvedTaskIds,
}: LabRunnerProps) {
  const t = useTranslations('Lab');
  const [dbBytes, setDbBytes] = useState<Uint8Array | null>(null);
  const [solved, setSolved] = useState<Set<string>>(
    () => new Set(solvedTaskIds)
  );
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadDbBytes(dbUrl)
      .then((bytes) => {
        if (active) setDbBytes(bytes);
      })
      .catch(() => {
        if (active) toast.error(t('errorTitle'));
      });
    return () => {
      active = false;
    };
  }, [dbUrl, t]);

  const handleRun = useCallback(
    async (task: TaskDef, inputs: Record<string, string>) => {
      if (!dbBytes) return;
      setBusy(task.id);
      try {
        const result = await runTask(dbBytes, task, inputs);
        setResults((prev) => ({ ...prev, [task.id]: result }));
        if (result.isCorrect) {
          setSolved((prev) => {
            if (prev.has(task.id)) return prev;
            const next = new Set(prev);
            next.add(task.id);
            return next;
          });
          toast.success(t('solved'));
        }
        void persistSubmission(sessionId, task, inputs, result);
      } finally {
        setBusy(null);
      }
    },
    [dbBytes, sessionId, t]
  );

  const solvedCount = useMemo(
    () => tasks.filter((task) => solved.has(task.id)).length,
    [tasks, solved]
  );
  const progress = tasks.length ? (solvedCount / tasks.length) * 100 : 0;
  const allSolved = solvedCount === tasks.length && tasks.length > 0;

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('tasksSolved', { solved: solvedCount, total: tasks.length })}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/lab/${sessionId}/attempts`}>
              <ListChecks className="size-4" />
              {t('viewAttempts')}
            </Link>
          </Button>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      {allSolved && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm font-medium">
          <CheckCircle2 className="size-5 text-primary" />
          {t('allSolved')}
        </div>
      )}

      {!dbBytes ? (
        <div className="space-y-4">
          {tasks.slice(0, 3).map((task) => (
            <Skeleton key={task.id} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              solved={solved.has(task.id)}
              result={results[task.id]}
              busy={busy === task.id}
              onRun={handleRun}
            />
          ))}
        </div>
      )}
    </div>
  );
}
