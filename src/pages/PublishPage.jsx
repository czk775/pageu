import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Download, ExternalLink, Globe2, LockKeyhole, Monitor, QrCode, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { DynamicBackground } from '../components/DynamicBackground';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusToast } from '../components/StatusToast';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadPublishDraft, loadSiteDraft, PUBLIC_SITE_PATH, resetPageUState, savePublishDraft, toSvgDataUrl } from '../lib/storage';
import { TemplateRenderer } from '../renderers/TemplateRenderer';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';
import { createPublishDraft, PUBLISH_STORAGE_KEY } from '../types/publishDraft';

export function PublishPage() {
  const navigate = useNavigate();
  const { createDraft, resetDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const siteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [publishDraft, setPublishDraft] = useState(() => loadPublishDraft());
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const siteUrl = PUBLIC_SITE_PATH;

  useEffect(() => {
    savePublishDraft(publishDraft);
  }, [publishDraft]);

  useEffect(() => {
    let active = true;
    const absoluteUrl = `${window.location.origin}${PUBLIC_SITE_PATH}`;

    QRCode.toString(absoluteUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      type: 'svg',
      width: 220,
      color: {
        dark: '#12384c',
        light: '#f7feff',
      },
    }).then((svg) => {
      if (active) {
        setQrCodeUrl(toSvgDataUrl(svg));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const showToast = (message) => {
    setToastMessage('');
    window.setTimeout(() => setToastMessage(message), 0);
  };

  const handleVisibilityChange = (visibility) => {
    setPublishDraft((draft) =>
      createPublishDraft({
        ...draft,
        visibility,
        publishedAt: new Date().toISOString(),
      }),
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(siteUrl);
    } finally {
      showToast('已复制链接');
    }
  };

  const handleDownloadQr = () => {
    showToast('二维码已下载');
  };

  const handleVisit = () => {
    window.localStorage.setItem(
      PUBLISH_STORAGE_KEY,
      JSON.stringify(
        createPublishDraft({
          ...publishDraft,
          siteId: 'demo',
          published: true,
          publishedAt: new Date().toISOString(),
        }),
      ),
    );
    navigate(PUBLIC_SITE_PATH);
  };

  const handleCreateNewSite = () => {
    resetPageUState();
    resetDraft();
    navigate('/create');
  };

  return (
    <main className="publish-page">
      <DynamicBackground />
      <section className="publish-shell" aria-labelledby="publish-title">
        <header className="publish-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <h1 id="publish-title">你的个人网站准备好了</h1>
        </header>

        <GlassCard as="section" className="publish-card publish-preview-card" aria-label="网站预览">
          <div className="publish-card-title">
            <div>
              <span>区域1</span>
              <h2>网站预览</h2>
            </div>
            <div className="preview-mode-switch" aria-label="发布预览模式">
              <button type="button" className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>
                <Monitor size={17} aria-hidden="true" />
                电脑
              </button>
              <button type="button" className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>
                <Smartphone size={17} aria-hidden="true" />
                手机
              </button>
            </div>
          </div>
          <div className="publish-preview-frame">
            <TemplateRenderer siteDraft={siteDraft} mode="preview" previewMode={previewMode} className="publish-render-preview" />
          </div>
        </GlassCard>

        <div className="publish-grid">
          <GlassCard as="section" className="publish-card" aria-label="网站地址">
            <div className="publish-card-title">
              <span className="publish-icon">
                <Globe2 size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域2</span>
                <h2>网站地址</h2>
              </div>
            </div>
            <Link className="site-link-box" to={siteUrl}>
              {siteUrl}
            </Link>
            <button className="secondary-action publish-copy-action" type="button" onClick={handleCopy}>
              <Copy size={17} aria-hidden="true" />
              复制
            </button>
          </GlassCard>

          <GlassCard as="section" className="publish-card" aria-label="二维码">
            <div className="publish-card-title">
              <span className="publish-icon">
                <QrCode size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域3</span>
                <h2>二维码</h2>
              </div>
            </div>
            <div className="qr-box">
              {qrCodeUrl ? <img alt="当前网站二维码" src={qrCodeUrl} /> : <span>生成中</span>}
            </div>
            <a
              aria-label="下载当前二维码"
              className="secondary-action qr-download-action"
              href={qrCodeUrl || '#'}
              download="pageu-site-qr.svg"
              onClick={handleDownloadQr}
            >
              <Download size={17} aria-hidden="true" />
              下载二维码
            </a>
          </GlassCard>

          <GlassCard as="section" className="publish-card" aria-label="访问权限">
            <div className="publish-card-title">
              <span className="publish-icon">
                <LockKeyhole size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域4</span>
                <h2>访问权限</h2>
              </div>
            </div>
            <div className="visibility-options">
              {[
                ['public', '公开'],
                ['private', '私密'],
                ['password', '密码访问'],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    checked={publishDraft.visibility === value}
                    name="visibility"
                    onChange={() => handleVisibilityChange(value)}
                    type="radio"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="publish-actions">
          <PrimaryButton icon={ExternalLink} onClick={handleVisit}>
            访问网站
          </PrimaryButton>
          <button className="adjust-action" type="button" onClick={handleCopy}>
            <Copy size={17} aria-hidden="true" />
            复制链接
          </button>
          <button className="adjust-action qr-action-link" type="button" onClick={handleDownloadQr}>
            <Download size={17} aria-hidden="true" />
            下载二维码
          </button>
          <Link className="return-action" to="/editor">
            继续编辑
          </Link>
          <button className="return-action" type="button" onClick={handleCreateNewSite}>
            创建新的个人网站
          </button>
        </div>
      </section>
      <StatusToast message={toastMessage} />
      <FloatingAssistant />
    </main>
  );
}
