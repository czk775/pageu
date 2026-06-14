import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Download, Rocket } from 'lucide-react';
import QRCode from 'qrcode';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadSiteDraft, resetPageUState, savePublishDraft, toSvgDataUrl } from '../lib/storage';
import { TemplateRenderer } from '../renderers/TemplateRenderer';
import { loadPublishedSiteDraft, publishSiteDraft } from '../services/publish/sitePublisher';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';
import { normalizeSiteDraft } from '../types/siteDraft';
import { StatusToast } from '../components/StatusToast';

export function GeneratedSitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createDraft, resetDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const fallbackSiteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);
  const [siteDraft, setSiteDraft] = useState(fallbackSiteDraft);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const isDemoSite = !id || id === 'demo';

  useEffect(() => {
    setSiteDraft(fallbackSiteDraft);
  }, [fallbackSiteDraft]);

  useEffect(() => {
    if (isDemoSite) {
      return undefined;
    }

    let active = true;

    loadPublishedSiteDraft(id)
      .then((remoteDraft) => {
        const normalizedDraft = normalizeSiteDraft(remoteDraft);

        if (active && normalizedDraft) {
          setSiteDraft(normalizedDraft);
        }
      })
      .catch(() => {
        if (active) {
          setToastMessage('暂时无法读取线上网站，已显示本地版本');
        }
      });

    return () => {
      active = false;
    };
  }, [id, isDemoSite]);

  useEffect(() => {
    if (!publishResult?.siteUrl) {
      setQrCodeUrl('');
      return undefined;
    }

    let active = true;

    QRCode.toString(publishResult.siteUrl, {
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
  }, [publishResult]);

  const handleCreateNewSite = () => {
    resetPageUState();
    resetDraft();
    navigate('/create');
  };

  const showToast = (message) => {
    setToastMessage('');
    window.setTimeout(() => setToastMessage(message), 0);
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const result = await publishSiteDraft({
        ...siteDraft,
        meta: {
          ...siteDraft.meta,
          siteId: id || 'demo',
        },
      });

      setPublishResult(result);
      savePublishDraft({
        published: true,
        siteId: result.siteId,
        siteUrl: result.siteUrl,
        publishedAt: result.publishedAt,
      });
      showToast('发布成功');
    } catch {
      showToast('发布失败，请稍后重试');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishResult?.siteUrl) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(publishResult.siteUrl);
    } finally {
      showToast('复制成功');
    }
  };

  const handleDownloadQr = () => {
    showToast('二维码已下载');
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
      {isDemoSite ? (
        <div className="generated-site-floating-actions" aria-label="个人网站操作">
          <button className="generated-publish-action" type="button" disabled={isPublishing} onClick={handlePublish}>
            <Rocket size={18} aria-hidden="true" />
            {isPublishing ? '发布中...' : '上线发布'}
          </button>
          <button className="generated-new-site-action" type="button" onClick={handleCreateNewSite}>
            创建新的个人网站
          </button>
        </div>
      ) : null}
      {isDemoSite && publishResult ? (
        <section className="generated-publish-panel" role="dialog" aria-label="发布成功">
          <div>
            <span>发布成功</span>
            <h2>你的个人网站已经上线</h2>
          </div>
          <a className="generated-publish-link" href={publishResult.siteUrl} target="_blank" rel="noreferrer">
            {publishResult.siteUrl}
          </a>
          <div className="generated-publish-share">
            <div className="generated-publish-qr">
              {qrCodeUrl ? <img alt="上线网站二维码" src={qrCodeUrl} /> : <span>二维码生成中</span>}
            </div>
            <div className="generated-publish-buttons">
              <button type="button" onClick={handleCopyLink}>
                <Copy size={16} aria-hidden="true" />
                复制链接
              </button>
              <a href={qrCodeUrl || '#'} download="pageu-published-site-qr.svg" onClick={handleDownloadQr}>
                <Download size={16} aria-hidden="true" />
                下载二维码
              </a>
            </div>
          </div>
        </section>
      ) : null}
      <StatusToast message={toastMessage} />
    </>
  );
}
