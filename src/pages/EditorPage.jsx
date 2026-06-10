import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, EyeOff, Monitor, Palette, Smartphone } from 'lucide-react';
import { DynamicBackground } from '../components/DynamicBackground';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { FormField } from '../components/FormField';
import { StatusToast } from '../components/StatusToast';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadSiteDraft, saveSiteDraft } from '../lib/storage';
import { TemplateRenderer } from '../renderers/TemplateRenderer';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';
import { sectionLabels } from '../types/siteDraft';

export function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const shouldRegenerateDraft = location.state?.regenerateSiteDraft === true;
  const [siteDraft, setSiteDraft] = useState(() => (shouldRegenerateDraft ? generatedDraft : loadSiteDraft(generatedDraft)));
  const [selectedSectionId, setSelectedSectionId] = useState('section-intro');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [saveStatus, setSaveStatus] = useState('已保存');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setSaveStatus('正在保存');
    setToastMessage('');
    const timer = window.setTimeout(() => {
      const nextDraft = {
        ...siteDraft,
        meta: {
          ...siteDraft.meta,
          updatedAt: new Date().toISOString(),
        },
      };
      saveSiteDraft(nextDraft);
      setSaveStatus('已保存');
      setToastMessage('保存成功');
    }, 350);

    return () => window.clearTimeout(timer);
  }, [siteDraft]);

  const selectedSection = siteDraft.sections.find((section) => section.id === selectedSectionId) || siteDraft.sections[0];

  const updateProfile = (field, value) => {
    setSiteDraft((draft) => ({
      ...draft,
      profile: {
        ...draft.profile,
        [field]: value,
      },
      hero: field === 'headline' ? { ...draft.hero, subtitle: value } : draft.hero,
    }));
  };

  const updateTheme = (field, value) => {
    setSiteDraft((draft) => ({
      ...draft,
      theme: {
        ...draft.theme,
        [field]: value,
      },
    }));
  };

  const updateSection = (sectionId, updater) => {
    setSiteDraft((draft) => ({
      ...draft,
      sections: draft.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  };

  const moveSection = (sectionId, direction) => {
    setSiteDraft((draft) => {
      const index = draft.sections.findIndex((section) => section.id === sectionId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= draft.sections.length) {
        return draft;
      }

      const nextSections = [...draft.sections];
      const [section] = nextSections.splice(index, 1);
      nextSections.splice(nextIndex, 0, section);

      return {
        ...draft,
        sections: nextSections,
      };
    });
  };

  const handleRegenerate = () => {
    setSiteDraft(generatedDraft);
    setSelectedSectionId('section-intro');
  };

  const handlePublish = () => {
    saveSiteDraft(siteDraft);
    navigate('/publish');
  };

  return (
    <main className="editor-page">
      <DynamicBackground />
      <section className="editor-shell" aria-labelledby="editor-title">
        <header className="editor-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <div className="editor-top-actions">
            <Link className="return-action" to="/analyze">
              返回分析
            </Link>
            <button className="adjust-action" type="button" onClick={handleRegenerate}>
              重新生成
            </button>
            <button className="generate-action compact-generate" type="button" onClick={handlePublish}>
              发布网站
            </button>
          </div>
          <h1 id="editor-title">再调整一下，让它更像你</h1>
          <p className="save-status" aria-live="polite">
            {saveStatus}
          </p>
        </header>

        <div className="editor-grid">
          <aside className="editor-panel module-panel" aria-label="模块区">
            <h2>模块区</h2>
            <div className="module-list">
              {siteDraft.sections.map((section, index) => (
                <div className={`module-item ${section.id === selectedSectionId ? 'active' : ''}`} key={section.id}>
                  <button className="module-select" type="button" onClick={() => setSelectedSectionId(section.id)}>
                    选择{section.title}
                  </button>
                  <div className="module-controls">
                    <button type="button" aria-label={`上移${section.title}`} onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`下移${section.title}`}
                      onClick={() => moveSection(section.id, 1)}
                      disabled={index === siteDraft.sections.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={section.visible ? `隐藏${section.title}` : `显示${section.title}`}
                      onClick={() => updateSection(section.id, (item) => ({ ...item, visible: !item.visible }))}
                    >
                      {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      type="button"
                      aria-label={section.collapsed ? `展开${section.title}` : `折叠${section.title}`}
                      onClick={() => updateSection(section.id, (item) => ({ ...item, collapsed: !item.collapsed }))}
                    >
                      {section.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="editor-preview-wrap" aria-label="实时预览">
            <div className="preview-toolbar">
              <span>{siteDraft.template}</span>
              <div className="preview-mode-switch" aria-label="预览模式">
                <button
                  type="button"
                  className={previewMode === 'desktop' ? 'active' : ''}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor size={17} />
                  电脑
                </button>
                <button
                  type="button"
                  className={previewMode === 'mobile' ? 'active' : ''}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone size={17} />
                  手机
                </button>
              </div>
            </div>

            <TemplateRenderer siteDraft={siteDraft} mode="preview" previewMode={previewMode} className="editor-render-preview" />
          </section>

          <aside className="editor-panel edit-panel" aria-label="编辑区">
            <h2>编辑区</h2>
            <FormField id="editor-title-input" label="标题">
              <input
                id="editor-title-input"
                type="text"
                value={siteDraft.profile.headline}
                onChange={(event) => updateProfile('headline', event.target.value)}
              />
            </FormField>
            <FormField id="editor-text-input" label="文字">
              <textarea
                id="editor-text-input"
                rows={5}
                value={selectedSection?.content || siteDraft.profile.intro}
                onChange={(event) => {
                  if (selectedSection) {
                    updateSection(selectedSection.id, (section) => ({ ...section, content: event.target.value }));
                  }
                  updateProfile('intro', event.target.value);
                }}
              />
            </FormField>
            <FormField id="editor-color-input" label="颜色">
              <input
                id="editor-color-input"
                type="color"
                value={siteDraft.theme.primaryColor}
                onChange={(event) => updateTheme('primaryColor', event.target.value)}
              />
            </FormField>
            <FormField id="editor-background-input" label="背景">
              <input
                id="editor-background-input"
                type="color"
                value={siteDraft.theme.background}
                onChange={(event) => updateTheme('background', event.target.value)}
              />
            </FormField>
            <label className="module-visible-toggle">
              <input
                checked={selectedSection?.visible ?? true}
                onChange={(event) =>
                  selectedSection ? updateSection(selectedSection.id, (section) => ({ ...section, visible: event.target.checked })) : null
                }
                type="checkbox"
              />
              模块显示
            </label>
            <div className="edit-selected-note">
              <Palette size={18} />
              当前编辑：{selectedSection ? sectionLabels[selectedSection.type] : '个人介绍'}
            </div>
          </aside>
        </div>
      </section>
      <StatusToast message={toastMessage} />
      <FloatingAssistant />
    </main>
  );
}
