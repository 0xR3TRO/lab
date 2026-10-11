/**
 * Any2Any Converter – Main Application Logic
 * Manages UI, events, routing to converter modules, file I/O.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */

/* ═══════════════════════════════════════════════════════════════════
   1. CONVERTER REGISTRY – add new converters here
   ═══════════════════════════════════════════════════════════════════ */
const CATEGORIES = [
    {
        id: "data-formats",
        label: "Data Formats",
        icon: "{ }",
        converters: [
            {
                id: "json-yaml",
                label: "JSON → YAML",
                inputLabel: "JSON",
                outputLabel: "YAML",
                inputExt: ".json",
                outputExt: ".yaml",
                placeholder:
                    '{\n  "name": "Any2Any",\n  "version": 1,\n  "features": ["convert", "validate"]\n}',
                convert: (i) => JsonYamlConverter.jsonToYaml(i),
                swapId: "yaml-json",
            },
            {
                id: "yaml-json",
                label: "YAML → JSON",
                inputLabel: "YAML",
                outputLabel: "JSON",
                inputExt: ".yaml",
                outputExt: ".json",
                placeholder:
                    "name: Any2Any\nversion: 1\nfeatures:\n  - convert\n  - validate",
                convert: (i) => JsonYamlConverter.yamlToJson(i),
                swapId: "json-yaml",
            },
            {
                id: "json-xml",
                label: "JSON → XML",
                inputLabel: "JSON",
                outputLabel: "XML",
                inputExt: ".json",
                outputExt: ".xml",
                placeholder:
                    '{\n  "user": {\n    "name": "Jan",\n    "age": 30\n  }\n}',
                convert: (i) => JsonXmlConverter.jsonToXml(i),
                swapId: "xml-json",
            },
            {
                id: "xml-json",
                label: "XML → JSON",
                inputLabel: "XML",
                outputLabel: "JSON",
                inputExt: ".xml",
                outputExt: ".json",
                placeholder:
                    '<?xml version="1.0"?>\n<root>\n  <user>\n    <name>Jan</name>\n    <age>30</age>\n  </user>\n</root>',
                convert: (i) => JsonXmlConverter.xmlToJson(i),
                swapId: "json-xml",
            },
            {
                id: "json-csv",
                label: "JSON → CSV",
                inputLabel: "JSON (array)",
                outputLabel: "CSV",
                inputExt: ".json",
                outputExt: ".csv",
                placeholder:
                    '[\n  {"name": "Alice", "age": 25},\n  {"name": "Bob", "age": 32}\n]',
                convert: (i) => CsvJsonConverter.jsonToCsv(i),
                swapId: "csv-json",
            },
            {
                id: "csv-json",
                label: "CSV → JSON",
                inputLabel: "CSV",
                outputLabel: "JSON",
                inputExt: ".csv",
                outputExt: ".json",
                placeholder: "name,age\nAlice,25\nBob,32",
                convert: (i) => CsvJsonConverter.csvToJson(i),
                swapId: "json-csv",
            },
        ],
    },
    {
        id: "text-tools",
        label: "Text Tools",
        icon: "Aa",
        converters: [
            {
                id: "base64-encode",
                label: "Base64 Encode",
                inputLabel: "Text",
                outputLabel: "Base64",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder: "Hello, World! 🌍",
                convert: (i) => Base64Converter.encode(i),
                swapId: "base64-decode",
            },
            {
                id: "base64-decode",
                label: "Base64 Decode",
                inputLabel: "Base64",
                outputLabel: "Text",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder: "SGVsbG8sIFdvcmxkISDwn4yN",
                convert: (i) => Base64Converter.decode(i),
                swapId: "base64-encode",
            },
            {
                id: "url-encode",
                label: "URL Encode",
                inputLabel: "Text",
                outputLabel: "URL Encoded",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder: "https://example.com/path?q=hello world&lang=pl",
                convert: (i) => UrlConverter.encode(i),
                swapId: "url-decode",
            },
            {
                id: "url-decode",
                label: "URL Decode",
                inputLabel: "URL Encoded",
                outputLabel: "Text",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder:
                    "https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world%26lang%3Dpl",
                convert: (i) => UrlConverter.decode(i),
                swapId: "url-encode",
            },
            {
                id: "html-encode",
                label: "HTML Encode",
                inputLabel: "Raw Text",
                outputLabel: "HTML Entities",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder: '<div class="test">Hello & welcome!</div>',
                convert: (i) => HtmlEntityConverter.encode(i),
                swapId: "html-decode",
            },
            {
                id: "html-decode",
                label: "HTML Decode",
                inputLabel: "HTML Entities",
                outputLabel: "Raw Text",
                inputExt: ".txt",
                outputExt: ".txt",
                placeholder:
                    "&lt;div class=&quot;test&quot;&gt;Hello &amp; welcome!&lt;/div&gt;",
                convert: (i) => HtmlEntityConverter.decode(i),
                swapId: "html-encode",
            },
            {
                id: "md-html",
                label: "Markdown → HTML",
                inputLabel: "Markdown",
                outputLabel: "HTML",
                inputExt: ".md",
                outputExt: ".html",
                placeholder:
                    "# Hello World\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n[Link](https://example.com)",
                convert: (i) => MarkdownHtmlConverter.markdownToHtml(i),
                swapId: "html-md",
            },
            {
                id: "html-md",
                label: "HTML → Markdown",
                inputLabel: "HTML",
                outputLabel: "Markdown",
                inputExt: ".html",
                outputExt: ".md",
                placeholder:
                    "<h1>Hello World</h1>\n<p>This is <strong>bold</strong> and <em>italic</em>.</p>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>",
                convert: (i) => MarkdownHtmlConverter.htmlToMarkdown(i),
                swapId: "md-html",
            },
        ],
    },
    {
        id: "images",
        label: "Images",
        icon: "🖼",
        converters: [
            {
                id: "img-png",
                label: "Image → PNG",
                inputLabel: "Upload Image",
                outputLabel: "PNG Result",
                type: "image",
                targetFormat: "png",
                outputExt: ".png",
            },
            {
                id: "img-jpg",
                label: "Image → JPG",
                inputLabel: "Upload Image",
                outputLabel: "JPG Result",
                type: "image",
                targetFormat: "jpeg",
                outputExt: ".jpg",
            },
            {
                id: "img-webp",
                label: "Image → WebP",
                inputLabel: "Upload Image",
                outputLabel: "WebP Result",
                type: "image",
                targetFormat: "webp",
                outputExt: ".webp",
            },
        ],
    },
];

/* ═══════════════════════════════════════════════════════════════════
   2. APP STATE
   ═══════════════════════════════════════════════════════════════════ */
const state = {
    currentCategory: "data-formats",
    currentConverter: "json-yaml",
    darkMode: true,
    imageFile: null,
    imageResult: null,
};

/* ═══════════════════════════════════════════════════════════════════
   3. DOM REFERENCES
   ═══════════════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);

function getElements() {
    return {
        sidebar: $("sidebar"),
        sidebarCategories: $("sidebar-categories"),
        converterSelect: $("converter-select"),
        inputArea: $("input-area"),
        outputArea: $("output-area"),
        inputLabel: $("input-label"),
        outputLabel: $("output-label"),
        btnConvert: $("btn-convert"),
        btnClear: $("btn-clear"),
        btnCopy: $("btn-copy"),
        btnDownload: $("btn-download"),
        btnSwap: $("btn-swap"),
        btnUpload: $("btn-upload"),
        fileInput: $("file-input"),
        statusBar: $("status-bar"),
        themeToggle: $("theme-toggle"),
        textPanel: $("text-panel"),
        imagePanel: $("image-panel"),
        imageUploadArea: $("image-upload-area"),
        imageFileInput: $("image-file-input"),
        imagePreview: $("image-preview"),
        imageResult: $("image-result"),
        imgWidth: $("img-width"),
        imgHeight: $("img-height"),
        imgQuality: $("img-quality"),
        btnImgConvert: $("btn-img-convert"),
        btnImgDownload: $("btn-img-download"),
        menuToggle: $("menu-toggle"),
    };
}

/* ═══════════════════════════════════════════════════════════════════
   4. INITIALIZATION
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    const el = getElements();
    buildSidebar(el);
    bindEvents(el);
    applyTheme();
    selectCategory("data-formats", el);
});

/* ═══════════════════════════════════════════════════════════════════
   5. SIDEBAR & NAVIGATION
   ═══════════════════════════════════════════════════════════════════ */
function buildSidebar(el) {
    el.sidebarCategories.innerHTML = "";
    for (const cat of CATEGORIES) {
        const btn = document.createElement("button");
        btn.className = "sidebar-btn";
        btn.dataset.catId = cat.id;
        btn.innerHTML = `<span class="sidebar-icon">${cat.icon}</span><span class="sidebar-label">${cat.label}</span>`;
        btn.addEventListener("click", () => {
            selectCategory(cat.id, el);
            // Close mobile menu
            el.sidebar.classList.remove("open");
        });
        el.sidebarCategories.appendChild(btn);
    }
}

function selectCategory(catId, el) {
    state.currentCategory = catId;
    // Highlight sidebar
    el.sidebarCategories.querySelectorAll(".sidebar-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.catId === catId);
    });
    const cat = CATEGORIES.find((c) => c.id === catId);
    populateConverterSelect(cat, el);
    // Auto-select first converter
    if (cat.converters.length) {
        selectConverter(cat.converters[0].id, el);
    }
}

function populateConverterSelect(cat, el) {
    el.converterSelect.innerHTML = "";
    for (const conv of cat.converters) {
        const opt = document.createElement("option");
        opt.value = conv.id;
        opt.textContent = conv.label;
        el.converterSelect.appendChild(opt);
    }
}

function selectConverter(convId, el) {
    state.currentConverter = convId;
    el.converterSelect.value = convId;

    const conv = findConverter(convId);
    if (!conv) return;

    // Text vs Image mode
    const isImage = conv.type === "image";
    el.textPanel.style.display = isImage ? "none" : "";
    el.imagePanel.style.display = isImage ? "" : "none";

    if (!isImage) {
        el.inputLabel.textContent = conv.inputLabel || "Input";
        el.outputLabel.textContent = conv.outputLabel || "Output";
        el.inputArea.placeholder = conv.placeholder || "";
        el.outputArea.value = "";
        el.btnSwap.style.display = conv.swapId ? "" : "none";
    } else {
        // Reset image state
        state.imageFile = null;
        state.imageResult = null;
        el.imagePreview.innerHTML =
            '<span class="placeholder-text">No image loaded</span>';
        el.imageResult.innerHTML =
            '<span class="placeholder-text">Result will appear here</span>';
        el.btnImgDownload.disabled = true;
        el.imgWidth.value = "";
        el.imgHeight.value = "";
        el.imgQuality.value = "92";
    }
    clearStatus(el);
}

function findConverter(id) {
    for (const cat of CATEGORIES) {
        const found = cat.converters.find((c) => c.id === id);
        if (found) return found;
    }
    return null;
}

/* ═══════════════════════════════════════════════════════════════════
   6. EVENT BINDINGS
   ═══════════════════════════════════════════════════════════════════ */
function bindEvents(el) {
    // Converter select change
    el.converterSelect.addEventListener("change", () => {
        selectConverter(el.converterSelect.value, el);
    });

    // Convert
    el.btnConvert.addEventListener("click", () => handleConvert(el));

    // Clear
    el.btnClear.addEventListener("click", () => {
        el.inputArea.value = "";
        el.outputArea.value = "";
        clearStatus(el);
    });

    // Copy
    el.btnCopy.addEventListener("click", () => handleCopy(el));

    // Download
    el.btnDownload.addEventListener("click", () => handleDownload(el));

    // Swap
    el.btnSwap.addEventListener("click", () => handleSwap(el));

    // Upload text file
    el.btnUpload.addEventListener("click", () => el.fileInput.click());
    el.fileInput.addEventListener("change", () => handleFileUpload(el));

    // Theme
    el.themeToggle.addEventListener("click", () => {
        state.darkMode = !state.darkMode;
        applyTheme();
    });

    // Image upload
    el.imageUploadArea.addEventListener("click", () =>
        el.imageFileInput.click(),
    );
    el.imageUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.imageUploadArea.classList.add("dragover");
    });
    el.imageUploadArea.addEventListener("dragleave", () =>
        el.imageUploadArea.classList.remove("dragover"),
    );
    el.imageUploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        el.imageUploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length)
            handleImageFile(e.dataTransfer.files[0], el);
    });
    el.imageFileInput.addEventListener("change", () => {
        if (el.imageFileInput.files.length)
            handleImageFile(el.imageFileInput.files[0], el);
    });

    // Image convert
    el.btnImgConvert.addEventListener("click", () => handleImageConvert(el));
    el.btnImgDownload.addEventListener("click", () => handleImageDownload(el));

    // Mobile menu toggle
    el.menuToggle.addEventListener("click", () => {
        el.sidebar.classList.toggle("open");
    });

    // Keyboard shortcut: Ctrl/Cmd + Enter to convert
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleConvert(el);
        }
    });
}

/* ═══════════════════════════════════════════════════════════════════
   7. TEXT CONVERSION HANDLERS
   ═══════════════════════════════════════════════════════════════════ */
function handleConvert(el) {
    const conv = findConverter(state.currentConverter);
    if (!conv || conv.type === "image") return;

    const input = el.inputArea.value;
    if (!input.trim()) {
        showStatus(el, "Please enter some input data.", "warning");
        return;
    }

    try {
        const result = conv.convert(input);
        el.outputArea.value = result;
        showStatus(el, `Conversion successful — ${conv.label}`, "success");
    } catch (err) {
        el.outputArea.value = "";
        showStatus(el, err.message, "error");
    }
}

function handleCopy(el) {
    const text = el.outputArea.value;
    if (!text) {
        showStatus(el, "Nothing to copy.", "warning");
        return;
    }
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showStatus(el, "Copied to clipboard!", "success");
        })
        .catch(() => {
            // Fallback
            el.outputArea.select();
            document.execCommand("copy");
            showStatus(el, "Copied to clipboard!", "success");
        });
}

function handleDownload(el) {
    const text = el.outputArea.value;
    if (!text) {
        showStatus(el, "Nothing to download.", "warning");
        return;
    }
    const conv = findConverter(state.currentConverter);
    const ext = conv ? conv.outputExt : ".txt";
    const filename = `converted${ext}`;
    downloadBlob(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
        filename,
    );
    showStatus(el, `Downloaded as ${filename}`, "success");
}

function handleSwap(el) {
    const conv = findConverter(state.currentConverter);
    if (!conv || !conv.swapId) return;

    const currentInput = el.inputArea.value;
    const currentOutput = el.outputArea.value;

    selectConverter(conv.swapId, el);
    el.converterSelect.value = conv.swapId;

    // Put previous output as new input
    if (currentOutput) {
        el.inputArea.value = currentOutput;
    } else if (currentInput) {
        el.inputArea.value = currentInput;
    }
    el.outputArea.value = "";
    clearStatus(el);
}

function handleFileUpload(el) {
    const file = el.fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        el.inputArea.value = reader.result;
        showStatus(
            el,
            `Loaded file: ${file.name} (${formatBytes(file.size)})`,
            "success",
        );
    };
    reader.onerror = () => showStatus(el, "Failed to read file.", "error");
    reader.readAsText(file);
    el.fileInput.value = "";
}

/* ═══════════════════════════════════════════════════════════════════
   8. IMAGE CONVERSION HANDLERS
   ═══════════════════════════════════════════════════════════════════ */
function handleImageFile(file, el) {
    if (!file.type.startsWith("image/")) {
        showStatus(el, "Please select a valid image file.", "error");
        return;
    }
    state.imageFile = file;
    const url = URL.createObjectURL(file);
    el.imagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
    // Read dimensions
    const img = new Image();
    img.onload = () => {
        el.imgWidth.placeholder = img.width;
        el.imgHeight.placeholder = img.height;
    };
    img.src = url;
    showStatus(
        el,
        `Image loaded: ${file.name} (${formatBytes(file.size)})`,
        "success",
    );
    el.btnImgDownload.disabled = true;
    el.imageResult.innerHTML =
        '<span class="placeholder-text">Click "Convert" to process</span>';
}

async function handleImageConvert(el) {
    if (!state.imageFile) {
        showStatus(el, "Please upload an image first.", "warning");
        return;
    }
    const conv = findConverter(state.currentConverter);
    if (!conv || conv.type !== "image") return;

    const w = el.imgWidth.value ? parseInt(el.imgWidth.value) : null;
    const h = el.imgHeight.value ? parseInt(el.imgHeight.value) : null;
    const q = (parseInt(el.imgQuality.value) || 92) / 100;

    try {
        showStatus(el, "Converting…", "info");
        const result = await ImageConverter.convert(
            state.imageFile,
            conv.targetFormat,
            q,
            w,
            h,
        );
        state.imageResult = result;
        el.imageResult.innerHTML = `<img src="${result.dataUrl}" alt="Result">`;
        el.btnImgDownload.disabled = false;
        showStatus(
            el,
            `Converted to ${conv.targetFormat.toUpperCase()} — ${result.width}×${result.height} (${formatBytes(result.blob.size)})`,
            "success",
        );
    } catch (err) {
        showStatus(el, `Image conversion failed: ${err.message}`, "error");
    }
}

function handleImageDownload(el) {
    if (!state.imageResult) return;
    const conv = findConverter(state.currentConverter);
    const ext = conv ? conv.outputExt : ".png";
    const filename = `converted${ext}`;
    downloadBlob(state.imageResult.blob, filename);
    showStatus(el, `Downloaded as ${filename}`, "success");
}

/* ═══════════════════════════════════════════════════════════════════
   9. STATUS BAR
   ═══════════════════════════════════════════════════════════════════ */
function showStatus(el, message, type = "info") {
    const bar = el.statusBar;
    bar.textContent = message;
    bar.className = `status-bar status-${type}`;
    bar.style.opacity = "1";
    // Auto-hide after 6s
    clearTimeout(bar._timeout);
    bar._timeout = setTimeout(() => {
        bar.style.opacity = "0";
    }, 6000);
}

function clearStatus(el) {
    el.statusBar.textContent = "";
    el.statusBar.className = "status-bar";
    el.statusBar.style.opacity = "0";
}

/* ═══════════════════════════════════════════════════════════════════
   10. THEME
   ═══════════════════════════════════════════════════════════════════ */
function applyTheme() {
    document.documentElement.setAttribute(
        "data-theme",
        state.darkMode ? "dark" : "light",
    );
    const toggle = $("theme-toggle");
    if (toggle) toggle.textContent = state.darkMode ? "☀️" : "🌙";
}

/* ═══════════════════════════════════════════════════════════════════
   11. UTILITIES
   ═══════════════════════════════════════════════════════════════════ */
function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}
