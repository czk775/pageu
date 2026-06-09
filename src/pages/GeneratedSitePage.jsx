import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadSiteDraft } from '../lib/storage';
import { TemplateRenderer } from '../renderers/TemplateRenderer';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';

export function GeneratedSitePage() {
  const { id } = useParams();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const siteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);

  return (
    <TemplateRenderer
      as="main"
      className="generated-site-page"
      previewMode="desktop"
      siteDraft={{
        ...siteDraft,
        meta: {
          ...siteDraft.meta,
          siteId: id || 'demo',
        },
      }}
    />
  );
}
