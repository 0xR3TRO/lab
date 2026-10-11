/**
 * Image Converter
 * Uses <canvas> to convert between PNG, JPG, WebP and resize images.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const ImageConverter = (() => {
    /**
     * Load a File/Blob as an HTMLImageElement.
     * Returns a Promise<HTMLImageElement>.
     */
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = reader.result;
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Convert an image File to target format.
     * @param {File} file - source image
     * @param {string} targetFormat - 'png' | 'jpeg' | 'webp'
     * @param {number} quality - 0..1, used for jpeg/webp
     * @param {number|null} maxWidth - optional resize width (keeps aspect ratio)
     * @param {number|null} maxHeight - optional resize height
     * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number}>}
     */
    async function convert(
        file,
        targetFormat = "png",
        quality = 0.92,
        maxWidth = null,
        maxHeight = null,
    ) {
        const img = await loadImage(file);
        let { width, height } = img;

        // Resize logic
        if (maxWidth || maxHeight) {
            const wr = maxWidth ? maxWidth / width : Infinity;
            const hr = maxHeight ? maxHeight / height : Infinity;
            const ratio = Math.min(wr, hr, 1); // don't upscale
            if (ratio < 1) {
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            // Allow explicit set even if bigger
            if (maxWidth && !maxHeight) {
                const r = maxWidth / img.width;
                width = maxWidth;
                height = Math.round(img.height * r);
            } else if (maxHeight && !maxWidth) {
                const r = maxHeight / img.height;
                height = maxHeight;
                width = Math.round(img.width * r);
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // For JPEG, fill white background (no alpha)
        if (targetFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = `image/${targetFormat}`;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve({ blob, dataUrl, width, height });
                },
                mimeType,
                quality,
            );
        });
    }

    /**
     * Helper: get mime extension for filename
     */
    function getExtension(format) {
        if (format === "jpeg") return "jpg";
        return format;
    }

    return { convert, loadImage, getExtension };
})();
