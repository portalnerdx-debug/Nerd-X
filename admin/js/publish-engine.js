/* =========================================================
   NERD X STUDIO — MOTOR DE PUBLICAÇÃO
   Gera os arquivos reais do site estático (HTML + JSON)
   para o autor baixar e subir no repositório do GitHub Pages.
   Não depende de token nem de backend.
   ========================================================= */

const NERDX_CATEGORIES = {
    "Notícias":            { slug: "noticias",   tag: "noticias", icon: "📰" },
    "Marvel":              { slug: "marvel",     tag: "marvel",   icon: "🕷️" },
    "DC":                  { slug: "dc",         tag: "dc",       icon: "🦇" },
    "Tecnologia":          { slug: "tecnologia", tag: "tech",     icon: "💻" },
    "Ficção Científica":   { slug: "ficcao",     tag: "scifi",    icon: "🚀" },
    "Reviews":             { slug: "reviews",    tag: "reviews",  icon: "⭐" }
};

const NerdxPublish = (() => {

    function slugify(text) {
        return (text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "-");
    }

    function escapeHtml(str) {
        return (str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Mini-formatação: linhas em branco separam parágrafos,
    // "## " vira H2, "- " vira item de lista, **texto** vira negrito.
    function contentToHtml(raw) {
        const blocks = (raw || "").replace(/\r\n/g, "\n").split(/\n\s*\n/);
        let html = "";
        blocks.forEach(block => {
            const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
            if (!lines.length) return;

            if (lines.every(l => l.startsWith("- "))) {
                html += "<ul>" + lines.map(l => `<li>${inline(l.slice(2))}</li>`).join("") + "</ul>\n";
                return;
            }
            if (lines[0].startsWith("## ")) {
                html += `<h2>${inline(lines[0].slice(3))}</h2>\n`;
                return;
            }
            if (lines[0].startsWith("### ")) {
                html += `<h3>${inline(lines[0].slice(4))}</h3>\n`;
                return;
            }
            html += `<p>${lines.map(inline).join("<br>")}</p>\n`;
        });
        return html || "<p></p>";

        function inline(text) {
            return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        }
    }

    function plainTextExcerpt(raw, max = 160) {
        const text = (raw || "").replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/[#*-]/g, "").trim();
        return text.length > max ? text.slice(0, max - 1).trim() + "…" : text;
    }

    async function readImageAsDataURL(file) {
        if (!file) return null;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function fetchExistingJSON(relativePath, fallback) {
        try {
            const res = await fetch(relativePath, { cache: "no-store" });
            if (!res.ok) return fallback;
            const text = await res.text();
            if (!text.trim()) return fallback;
            return JSON.parse(text);
        } catch (e) {
            return fallback;
        }
    }

    function todayISO() {
        return new Date().toISOString().slice(0, 10);
    }

    const SCRIPTS = [
        "analytics.js", "theme.js", "darkmode.js", "header.js", "menu.js",
        "scroll.js", "scrolltop.js", "newsletter.js", "lazyload.js", "main.js"
    ];

    function headBlock(post, depth) {
        const url = `https://nerdx.com.br/categorias/${post.categoriaSlug}/${post.slug}.html`;
        const metaTitle = post.seoTitle || `${post.titulo} | Nerd X`;
        const metaDesc = escapeHtml(post.seoDescription || post.resumo || plainTextExcerpt(post.conteudo));
        return `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${metaDesc}">
    <meta name="theme-color" content="#0D0F14">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Nerd X">
    <meta property="og:title" content="${escapeHtml(metaTitle)}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${url}">
    <meta property="og:locale" content="pt_BR">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(metaTitle)}">
    <meta name="twitter:description" content="${metaDesc}">
    <link rel="icon" href="${depth}favicon.ico">
    <link rel="stylesheet" href="${depth}assets/css/style.css">
    <script type="application/ld+json">
    ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.titulo,
        "description": post.resumo || plainTextExcerpt(post.conteudo),
        "author": { "@type": "Person", "name": post.autor || "Nerd-X" },
        "datePublished": post.data,
        "publisher": { "@type": "Organization", "name": "Nerd X" }
    }, null, 4)}
    </script>`;
    }

    function headerNavBlock(depth, activeSlug) {
        const link = (href, label, catSlug) =>
            `<li><a href="${depth}${href}"${catSlug === activeSlug ? ' aria-current="page"' : ""}>${label}</a></li>`;
        return `<a href="#conteudo" class="skip-link">Pular para o conteúdo</a>

<div class="top-bar">
    <div class="container top-bar-content">
        <div class="top-left">📰 Últimas: Bem-vindo ao novo Nerd X!</div>
        <div class="top-right"><span id="current-date"></span></div>
    </div>
</div>

<header>
    <div class="container">
        <div class="logo"><a href="${depth}index.html"><span class="logo-x">X</span><span class="logo-text">NERD</span></a></div>
        <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span></button>
        <nav id="main-nav">
            <ul>
                <li><a href="${depth}index.html">Home</a></li>
                ${link("categorias/noticias/index.html", "Notícias", "noticias")}
                ${link("categorias/marvel/index.html", "Marvel", "marvel")}
                ${link("categorias/dc/index.html", "DC", "dc")}
                ${link("categorias/tecnologia/index.html", "Tecnologia", "tecnologia")}
                ${link("categorias/ficcao/index.html", "Ficção", "ficcao")}
                ${link("categorias/reviews/index.html", "Reviews", "reviews")}
                <li><a href="${depth}contato.html">Contato</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <button class="theme-btn" aria-pressed="false" aria-label="Ativar modo claro">
                <span class="icon-sun">🌙</span><span class="icon-moon">☀️</span>
            </button>
        </div>
    </div>
</header>`;
    }

    function footerBlock(depth) {
        return `<footer>
    <div class="container">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="logo"><a href="${depth}index.html"><span class="logo-x">X</span><span class="logo-text">NERD</span></a></div>
                <p>Notícias, reviews e análises do universo geek — Marvel, DC, tecnologia e ficção científica, todos os dias.</p>
                <div class="footer-social">
                    <a href="#" aria-label="Nerd X no Instagram">📷</a>
                    <a href="#" aria-label="Nerd X no X (Twitter)">🐦</a>
                    <a href="#" aria-label="Nerd X no YouTube">▶️</a>
                    <a href="#" aria-label="Nerd X no Discord">🎮</a>
                </div>
            </div>
            <div class="footer-col">
                <h5>Categorias</h5>
                <ul>
                    <li><a href="${depth}categorias/marvel/index.html">Marvel</a></li>
                    <li><a href="${depth}categorias/dc/index.html">DC</a></li>
                    <li><a href="${depth}categorias/tecnologia/index.html">Tecnologia</a></li>
                    <li><a href="${depth}categorias/ficcao/index.html">Ficção Científica</a></li>
                    <li><a href="${depth}categorias/reviews/index.html">Reviews</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h5>Institucional</h5>
                <ul>
                    <li><a href="${depth}sobre.html">Sobre nós</a></li>
                    <li><a href="${depth}contato.html">Contato</a></li>
                    <li><a href="${depth}termos.html">Termos de uso</a></li>
                    <li><a href="${depth}privacidade.html">Privacidade</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h5>Comunidade</h5>
                <ul>
                    <li><a href="${depth}newsletter/index.html">Newsletter</a></li>
                    <li><a href="${depth}comentarios/index.html">Comentários</a></li>
                    <li><a href="${depth}pesquisa.html">Buscar</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <span>© 2026 Nerd X. Todos os direitos reservados.</span>
            <span>Feito com 🖤 para quem vive o universo geek.</span>
        </div>
    </div>
</footer>

<button class="scroll-top-btn" aria-label="Voltar ao topo">↑</button>

${SCRIPTS.map(s => `<script src="${depth}assets/js/${s}"></script>`).join("\n")}`;
    }

    function buildArticleHTML(post) {
        const depth = "../../";
        const coverBlock = post.imagemDataUrl
            ? `<div class="article-cover" style="background-image:url('${post.imagemDataUrl}');background-size:cover;background-position:center;"></div>`
            : `<div class="article-cover"></div>`;

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    ${headBlock(post, depth)}
</head>
<body>
${headerNavBlock(depth, post.categoriaSlug)}

<main id="conteudo">
    <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb" style="padding-top:var(--space-6);font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--color-dust);">
            <a href="${depth}index.html">Home</a> &raquo;
            <a href="${depth}categorias/${post.categoriaSlug}/index.html">${escapeHtml(post.categoria)}</a> &raquo;
            <span>${escapeHtml(post.titulo)}</span>
        </nav>

        <header class="article-header">
            <span class="tag ${post.categoriaTag}">${escapeHtml(post.categoria)}</span>
            <h1>${escapeHtml(post.titulo)}</h1>
            <div class="article-meta">
                <span>✍️ ${escapeHtml(post.autor || "Nerd-X")}</span>
                <span>📅 ${post.data}</span>
            </div>
        </header>

        ${coverBlock}

        <div class="article-body">
            ${post.conteudoHtml}
        </div>

        <div class="article-share">
            <a class="btn-outline" href="${depth}categorias/${post.categoriaSlug}/index.html">← Voltar para ${escapeHtml(post.categoria)}</a>
        </div>

        <section id="comments-mount" style="margin-block: var(--space-10);"></section>
    </div>
</main>

${footerBlock(depth)}
</body>
</html>
`;
    }

    function buildPostCardHTML(post) {
        const img = post.imagemDataUrl
            ? ` style="background-image:url('${post.imagemDataUrl}');background-size:cover;background-position:center;"`
            : "";
        return `<article class="post-card" data-animate>
                    <div class="news-image"${img}></div>
                    <div class="post-body">
                        <span class="tag ${post.categoriaTag}">${escapeHtml(post.categoria)}</span>
                        <h3><a href="${post.slug}.html">${escapeHtml(post.titulo)}</a></h3>
                        <p>${escapeHtml(post.resumo || plainTextExcerpt(post.conteudo))}</p>
                        <div class="post-meta"><span>✍️ ${escapeHtml(post.autor || "Nerd-X")}</span><span>📅 ${post.data}</span></div>
                    </div>
                </article>`;
    }

    // Recebe o HTML atual da página da categoria e devolve a versão atualizada
    // com o novo artigo inserido (cria o grid se a categoria ainda estiver vazia).
    function updateCategoryIndexHTML(currentHtml, post) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHtml, "text/html");
        const main = doc.querySelector("main#conteudo");
        if (!main) return null;

        let grid = main.querySelector(".post-grid");
        const emptyState = main.querySelector(".empty-state");

        if (!grid) {
            const section = doc.createElement("section");
            const container = doc.createElement("div");
            container.className = "container";
            grid = doc.createElement("div");
            grid.className = "post-grid";
            container.appendChild(grid);
            section.appendChild(container);

            if (emptyState) {
                emptyState.closest("section").replaceWith(section);
            } else {
                main.appendChild(section);
            }
        }

        const wrapper = doc.createElement("div");
        wrapper.innerHTML = buildPostCardHTML(post);
        grid.prepend(wrapper.firstElementChild);

        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    }

    function removeCategoryCard(currentHtml, slug) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHtml, "text/html");
        const link = doc.querySelector(`.post-grid a[href="${slug}.html"]`);
        if (link) {
            const card = link.closest(".post-card");
            if (card) card.remove();
        }
        const grid = doc.querySelector(".post-grid");
        if (grid && !grid.children.length) {
            const section = grid.closest("section");
            const container = doc.createElement("div");
            container.className = "container";
            container.innerHTML = `<div class="empty-state" data-animate>
                <div class="icon">📭</div>
                <h3>Nenhuma matéria por aqui ainda</h3>
                <p>Volte em breve para conferir novas publicações.</p>
            </div>`;
            if (section) section.replaceWith((() => {
                const s = doc.createElement("section");
                s.appendChild(container);
                return s;
            })());
        }
        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    }

    return {
        CATEGORIES: NERDX_CATEGORIES,
        slugify,
        contentToHtml,
        plainTextExcerpt,
        readImageAsDataURL,
        fetchExistingJSON,
        todayISO,
        buildArticleHTML,
        updateCategoryIndexHTML,
        removeCategoryCard
    };
})();
