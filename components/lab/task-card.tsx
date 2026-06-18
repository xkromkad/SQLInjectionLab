'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Circle, Loader2, Play, AlertTriangle } from 'lucide-react';
import type { TaskDef } from '@/lib/schemas/task-set';
import type { RunResult } from '@/lib/sql/engine';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResultsTable } from '@/components/lab/results-table';

function initialInputs(task: TaskDef): Record<string, string> {
  const values: Record<string, string> = {};
  for (const input of task.inputs) {
    values[input.name] =
      input.type === 'dropdown' ? (input.options?.[0] ?? '') : '';
  }
  return values;
}

export function TaskCard({
  task,
  index,
  solved,
  result,
  busy,
  onRun,
}: {
  task: TaskDef;
  index: number;
  solved: boolean;
  result?: RunResult;
  busy: boolean;
  onRun: (task: TaskDef, inputs: Record<string, string>) => void;
}) {
  const t = useTranslations('Lab');
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialInputs(task)
  );

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Card className={solved ? 'border-primary/50' : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground">#{index + 1}</span>
            {task.caption}
          </CardTitle>
          {solved ? (
            <Badge className="gap-1 shrink-0">
              <CheckCircle2 className="size-3.5" />
              {t('solved')}
            </Badge>
          ) : (
            <Circle className="size-5 shrink-0 text-muted-foreground/40" />
          )}
        </div>
        <CardDescription className="whitespace-pre-line leading-relaxed">
          {task.task}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {task.inputs.map((input) => (
            <div key={input.name} className="space-y-1.5">
              <Label htmlFor={`${task.id}-${input.name}`}>{input.label}</Label>
              {input.type === 'dropdown' ? (
                <Select
                  value={values[input.name]}
                  onValueChange={(v) => setValue(input.name, v)}
                >
                  <SelectTrigger id={`${task.id}-${input.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(input.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`${task.id}-${input.name}`}
                  type={input.type === 'number' ? 'number' : 'text'}
                  value={values[input.name]}
                  onChange={(e) => setValue(input.name, e.target.value)}
                  className="font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </div>
          ))}
        </div>

        <Button onClick={() => onRun(task, values)} disabled={busy}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {busy ? t('running') : t('submit')}
        </Button>

        {result && (
          <div className="space-y-3 pt-2">
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t('executedQuery')}
              </p>
              <code className="block break-all text-xs">
                {result.finalQuery}
              </code>
            </div>

            {result.errored ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    {t('errorTitle')}
                  </p>
                  <code className="text-xs break-all">
                    {result.errorMessage}
                  </code>
                </div>
              </div>
            ) : result.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noResults')}</p>
            ) : (
              <div className="space-y-3">
                {result.results.map((r, i) => (
                  <ResultsTable key={i} result={r} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
