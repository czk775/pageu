const DEFAULT_MAX_DATA_URL_LENGTH = 420_000;

export const compressImageDataUrl = (
  dataUrl,
  { maxWidth = 1400, maxHeight = 1000, mimeType = 'image/jpeg', quality = 0.82, maxDataUrlLength = DEFAULT_MAX_DATA_URL_LENGTH } = {},
) =>
  new Promise((resolve) => {
    if (!dataUrl || typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(dataUrl || '');
      return;
    }

    const image = new Image();
    image.onload = () => {
      try {
        const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) {
          resolve(dataUrl);
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        let compressed = canvas.toDataURL(mimeType, quality);
        let nextQuality = quality;
        while (compressed.length > maxDataUrlLength && nextQuality > 0.52) {
          nextQuality -= 0.08;
          compressed = canvas.toDataURL(mimeType, nextQuality);
        }

        resolve(compressed || dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });

export const readImagePreview = (file, onLoad, options) => {
  if (!file) {
    onLoad('');
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    const rawPreview = typeof reader.result === 'string' ? reader.result : '';
    const previewUrl = rawPreview.length > DEFAULT_MAX_DATA_URL_LENGTH ? await compressImageDataUrl(rawPreview, options) : rawPreview;
    onLoad(previewUrl);
  };
  reader.onerror = () => onLoad('');
  reader.readAsDataURL(file);
};
