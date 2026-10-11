/**
 * Markdown ↔ HTML Converter
 * Lightweight Markdown parser – supports headings, bold, italic, code,
 * links, images, unordered/ordered lists, blockquotes, horizontal rules,
 * and code blocks.
 *
 * @author  0xR3TRO <https://github.com/0xR3TRO>
 * @license MIT – Copyright (c) 2026 0xR3TRO
 */
const MarkdownHtmlConverter = (() => {
    /** Convert Markdown → HTML */
    function markdownToHtml(input) {
        if (!input) throw new Error("No input provided");
        let html = input;

        // Code blocks (``` ... ```)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            const escaped = _esc(code.trimEnd());
            return `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escaped}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

        // Images (before links)
        html = html.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1">',
        );

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Headings
        html = html.replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>");
        html = html.replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>");
        html = html.replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>");
        html = html.replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>");
        html = html.replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>");
        html = html.replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>");

        // Horizontal rule
        html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>");

        // Blockquotes
        html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
        // Merge consecutive blockquotes
        html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

        // Bold + Italic
        html = html.replace(
            /\*\*\*(.+?)\*\*\*/g,
            "<strong><em>$1</em></strong>",
        );
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
        html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
        html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
        html = html.replace(/_(.+?)_/g, "<em>$1</em>");
        html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

        // Unordered lists
        html = html.replace(/^[\*\-\+]\s+(.+)$/gm, "<li>$1</li>");
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>\n${m}</ul>\n`);

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
        // Wrap adjacent <li> that are not in <ul>
        html = html.replace(/(?:^(<li>.*<\/li>)\n?)+/gm, (m) => {
            if (m.includes("<ul>")) return m;
            return `<ol>\n${m}</ol>\n`;
        });

        // Paragraphs – wrap remaining lines
        const lines = html.split("\n");
        const result = [];
        let inBlock = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                if (inBlock) {
                    result.push("");
                    inBlock = false;
                }
                continue;
            }
            if (
                /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|div|table|p)/.test(
                    trimmed,
                ) ||
                /^<\/(ul|ol|pre|blockquote|div|table)>/.test(trimmed)
            ) {
                result.push(line);
                inBlock = false;
            } else {
                result.push(`<p>${trimmed}</p>`);
            }
        }

        return result
            .join("\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    /** Convert HTML → Markdown (basic) */
    function htmlToMarkdown(input) {
        if (!input) throw new Error("No input provided");
        let md = input;

        // Code blocks
        md = md.replace(
            /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
            (_, code) => `\`\`\`\n${_unesc(code)}\n\`\`\``,
        );

        // Inline code
        md = md.replace(/<code>([^<]+)<\/code>/gi, "`$1`");

        // Headings
        md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1");
        md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1");
        md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1");
        md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1");
        md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1");
        md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1");

        // Bold / Italic
        md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
        md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
        md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
        md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
        md = md.replace(/<del>(.*?)<\/del>/gi, "~~$1~~");
        md = md.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");

        // Links
        md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

        // Images
        md = md.replace(
            /<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
            "![$2]($1)",
        );
        md = md.replace(/<img[^>]+src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

        // Lists
        md = md.replace(/<li>(.*?)<\/li>/gi, "- $1");
        md = md.replace(/<\/?[uo]l[^>]*>/gi, "");

        // Blockquote
        md = md.replace(
            /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
            (_, content) => {
                return content
                    .trim()
                    .split("\n")
                    .map((l) => `> ${l.trim()}`)
                    .join("\n");
            },
        );

        // Horizontal rule
        md = md.replace(/<hr\s*\/?>/gi, "---");

        // Paragraphs & line breaks
        md = md.replace(/<br\s*\/?>/gi, "\n");
        md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n");

        // Strip remaining tags
        md = md.replace(/<[^>]+>/g, "");

        // Unescape HTML entities
        md = _unesc(md);

        return md.replace(/\n{3,}/g, "\n\n").trim();
    }

    function _esc(s) {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function _unesc(s) {
        return s
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    }

    return { markdownToHtml, htmlToMarkdown };
})();
