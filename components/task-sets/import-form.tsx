'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { upload } from '@vercel/blob/client';
import { Download, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { taskListSchema } from '@/lib/schemas/task-set';
import { createTaskSet } from '@/app/actions/task-sets';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ImportForm() {
  const t = useTranslations('Import');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'sk' | 'en'>('sk');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [tasksText, setTasksText] = useState('');
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const dbFileRef = useRef<HTMLInputElement>(null);

  function validateJson(text: string) {
    setTasksText(text);
    if (!text.trim()) {
      setTaskCount(null);
      setJsonError(null);
      return;
    }
    try {
      const parsed = taskListSchema.safeParse(JSON.parse(text));
      if (parsed.success) {
        setTaskCount(parsed.data.length);
        setJsonError(null);
      } else {
        setTaskCount(null);
        setJsonError(t('validationError'));
      }
    } catch {
      setTaskCount(null);
      setJsonError(t('invalidJson'));
    }
  }

  async function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    validateJson(await file.text());
  }

  function handleSubmit() {
    let tasks;
    try {
      tasks = taskListSchema.parse(JSON.parse(tasksText));
    } catch {
      toast.error(jsonError ?? t('invalidJson'));
      return;
    }

    startTransition(async () => {
      try {
        let dbBlobUrl: string | null = null;
        const dbFile = dbFileRef.current?.files?.[0];
        if (dbFile) {
          const blob = await upload(dbFile.name, dbFile, {
            access: 'public',
            handleUploadUrl: '/api/task-sets/upload',
          });
          dbBlobUrl = blob.url;
        }
        await createTaskSet(
          { title, description, language, visibility, tasks },
          dbBlobUrl
        );
        toast.success(t('success'));
        router.push('/task-sets');
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || t('uploadError'));
      }
    });
  }

  const canSubmit =
    title.trim().length > 0 && taskCount !== null && taskCount > 0 && !pending;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ts-title">{t('titleField')}</Label>
          <Input
            id="ts-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-lang">{t('language')}</Label>
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as 'sk' | 'en')}
          >
            <SelectTrigger id="ts-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sk">Slovenčina</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-desc">{t('description')}</Label>
        <Textarea
          id="ts-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-visibility">{t('visibility')}</Label>
        <Select
          value={visibility}
          onValueChange={(v) => setVisibility(v as 'private' | 'public')}
        >
          <SelectTrigger id="ts-visibility" className="sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">{t('private')}</SelectItem>
            <SelectItem value="public">{t('public')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="ts-json">{t('tasksJson')}</Label>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/examples/task-set.example.json" download>
                <Download className="size-4" />
                {t('downloadExample')}
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <label className="cursor-pointer">
                <Upload className="size-4" />
                {t('loadFile')}
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleLoadFile}
                />
              </label>
            </Button>
          </div>
        </div>
        <Textarea
          id="ts-json"
          value={tasksText}
          onChange={(e) => validateJson(e.target.value)}
          rows={12}
          className="font-mono text-xs"
          placeholder='[{ "id": 1, "caption": "…", "task": "…", "query": "…", "correctAnswer": "…", "inputs": [] }]'
        />
        <p className="text-xs text-muted-foreground">{t('tasksJsonHint')}</p>
        {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        {taskCount !== null && (
          <p className="text-xs text-primary">
            {t('tasksCount', { count: taskCount })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-db">{t('dbFile')}</Label>
        <Input id="ts-db" ref={dbFileRef} type="file" accept=".db,.sqlite,.sqlite3,application/octet-stream" />
        <p className="text-xs text-muted-foreground">{t('dbFileHint')}</p>
      </div>

      <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? t('submitting') : t('submit')}
      </Button>
    </div>
  );
}
