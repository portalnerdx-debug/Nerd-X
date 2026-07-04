/* =========================================================
   HOME FEED — puxa os artigos publicados (api/posts.json)
   e preenche a home SEMPRE com os 8 artigos mais recentes,
   de qualquer categoria, ordenados por data (mais novo primeiro).
   Se não houver nenhum post publicado ainda, a home mantém o
   conteúdo estático de exemplo.
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
    let posts;
    try {
        const res = await fetch(`api/posts.json?v=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();
        if (!text.trim()) return;
        posts = JSON.parse(text);
    } catch (e) {
        return;
    }
    if (!Array.isArray(posts) || !posts.length) return;

    const TAG_CLASS = {
        "Notícias": "noticias", "Marvel": "marvel", "DC": "dc",
        "Tecnologia": "tech", "Ficção Científica": "scifi", "Reviews": "reviews"
    };

    function escapeHtml(str) {
        return (str || "")
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function parseDate(d) {
        const t = Date.parse(d);
        return isNaN(t) ? 0 : t;
    }

    function postCard(post) {
        const tag = TAG_CLASS[post.categoria] || "noticias";
        return `<article class="post-card" data-animate>
            <div class="news-image"></div>
            <div class="post-body">
                <span class="tag ${tag}">${escapeHtml(post.categoria)}</span>
                <h3><a href="${post.url}">${escapeHtml(post.titulo)}</a></h3>
                <p>${escapeHtml(post.resumo)}</p>
                <div class="post-meta"><span>✍️ ${escapeHtml(post.autor || "Nerd-X")}</span><span>📅 ${post.data}</span></div>
            </div>
        </article>`;
    }

    // Ordena TODOS os posts (de qualquer categoria) do mais recente para o mais antigo.
    const sorted = posts.slice().sort((a, b) => parseDate(b.data) - parseDate(a.data));

    // Os 8 artigos mais recentes do site inteiro substituem o bloco estático da home.
    const latest = sorted.slice(0, 8);

    const newsGrid = document.getElementById("home-news-grid");
    const latestGrid = document.getElementById("home-latest-grid");

    if (newsGrid && latest.length) {
        const [feature, ...rest] = latest;
        const sideItems = rest.slice(0, 3);
        const gridItems = rest.slice(3, 7); // até 4 artigos extras => total de 8

        const tag = TAG_CLASS[feature.categoria] || "noticias";
        newsGrid.innerHTML = `
            <article class="news-feature" data-animate>
                <div class="news-image"></div>
                <div class="news-content">
                    <span class="tag ${tag}">${escapeHtml(feature.categoria)}</span>
                    <h3>${escapeHtml(feature.titulo)}</h3>
                    <p>${escapeHtml(feature.resumo)}</p>
                    <a href="${feature.url}" class="read-more">Leia mais →</a>
                </div>
            </article>
            <div class="news-side">
                ${sideItems.map(p => `<article class="mini-card" data-animate>
                    <span class="tag ${TAG_CLASS[p.categoria] || "noticias"}">${escapeHtml(p.categoria)}</span>
                    <h4><a href="${p.url}">${escapeHtml(p.titulo)}</a></h4>
                </article>`).join("")}
            </div>
        `;

        if (latestGrid) {
            if (gridItems.length) {
                latestGrid.innerHTML = gridItems.map(postCard).join("");
                latestGrid.style.display = "";
            } else {
                latestGrid.innerHTML = "";
                latestGrid.style.display = "none";
            }
        }
    }

    // Últimas de Ficção Científica e Reviews (seções ficam ocultas se vazias)
    function fillCategorySection(categoriaLabel, sectionId, gridId) {
        const items = sorted.filter(p => p.categoria === categoriaLabel).slice(0, 3);
        if (!items.length) return;
        const section = document.getElementById(sectionId);
        const grid = document.getElementById(gridId);
        if (!section || !grid) return;
        grid.innerHTML = items.map(postCard).join("");
        section.style.display = "";
    }

    fillCategorySection("Ficção Científica", "home-ficcao-section", "home-ficcao-grid");
    fillCategorySection("Reviews", "home-reviews-section", "home-reviews-grid");
});
