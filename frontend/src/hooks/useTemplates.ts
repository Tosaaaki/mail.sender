import { useEffect, useState } from 'react';

export interface TemplateResult {
  subject: string | null;
  body: string | null;
}

export function useTemplates(id: string, stage: number) {
  const [template, setTemplate] = useState<TemplateResult>({ subject: null, body: null });

  useEffect(() => {
    const load = async () => {
      const baseUrl = process.env.REACT_APP_FUNCTIONS_BASE_URL || '';
      if (!baseUrl) return;
      try {
        const res = await fetch(`${baseUrl}/templateLoader?id=${encodeURIComponent(id)}&stage=${stage}`);
        if (res.ok) {
          const data = await res.json();
          setTemplate({
            subject: data.subject ?? null,
            body: data.body ?? null,
          });
        }
      } catch (e) {
        console.warn('template fetch failed', e);
      }
    };
    load();
  }, [id, stage]);

  return template;
}
