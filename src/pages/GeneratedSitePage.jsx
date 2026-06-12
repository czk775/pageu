import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadSiteDraft } from '../lib/storage';
import { TemplateRenderer } from '../renderers/TemplateRenderer';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';

export function GeneratedSitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const siteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);

  const handleCreateNewSite = () => {
    // Demo stage: keep current inputs and published draft so presenters can return without re-entering content.
    // The retained resetPageUState/resetDraft utilities can be restored for a production "fresh start" action.
    navigate('/create');
  };

  return (
    <>
      <TemplateRenderer
        as="main"
        className="generated-site-page"
        mode="site"
        previewMode="desktop"
        siteDraft={{
          ...siteDraft,
          meta: {
            ...siteDraft.meta,
            siteId: id || 'demo',
          },
        }}
      />
      <button className="generated-new-site-action" type="button" onClick={handleCreateNewSite}>
        创建新的个人网站
      </button>
    </>
  );
}
