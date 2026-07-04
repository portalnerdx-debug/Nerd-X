const list = document.getElementById("postList");
const status = document.getElementById("status");

function showStatus(type, html) {
    status.className = "status-box " + type;
    status.innerHTML = html;
    status.style.display = "block";
}

function downloadBlob(filename, blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function loadPosts() {
    const posts = await NerdxPublish.fetchExistingJSON("../api/posts.json", []);
    if (!Array.isArray(posts) || !posts.length) {
        list.innerHTML = `<p style="color:var(--text2);">Nenhum artigo encontrado em <code>api/posts.json</code>. Publique um artigo em "Novo Artigo" primeiro.</p>`;
        return;
    }

    list.innerHTML = "";
    const sortedPosts = posts
        .map((post, originalIndex) => ({ post, originalIndex }))
        .sort((a, b) => (Date.parse(b.post.data) || 0) - (Date.parse(a.post.data) || 0));

    sortedPosts.forEach(({ post, originalIndex: index }) => {
        const row = document.createElement("div");
        row.className = "recent-post post-row";
        row.innerHTML = `
            <div>
                <h3>${post.titulo}</h3>
                <small>${post.categoria} • ${post.data} • ${post.autor || "Nerd-X"}</small>
            </div>
            <div class="post-row-actions">
                <a class="button secondary" href="../${post.url}" target="_blank" rel="noopener">Ver</a>
                <button class="button danger" data-index="${index}">Excluir</button>
            </div>
        `;
        list.appendChild(row);
    });

    list.querySelectorAll("button[data-index]").forEach(btn => {
        btn.addEventListener("click", () => removePost(posts, Number(btn.dataset.index)));
    });
}

async function removePost(posts, index) {
    const post = posts[index];
    if (!post) return;
    if (!confirm(`Remover "${post.titulo}" da lista e do arquivo da categoria? (isso não apaga o arquivo .html do artigo, só o listing)`)) return;

    const updatedPosts = posts.slice();
    updatedPosts.splice(index, 1);

    const categoryPath = `../categorias/${post.categoriaSlug}/index.html`;
    const currentCategoryHtml = await fetch(`${categoryPath}?v=${Date.now()}`, { cache: "no-store" })
        .then(r => (r.ok ? r.text() : null))
        .catch(() => null);
    const updatedCategoryHtml = currentCategoryHtml
        ? NerdxPublish.removeCategoryCard(currentCategoryHtml, post.slug)
        : null;

    const zip = new JSZip();
    zip.file("api/posts.json", JSON.stringify(updatedPosts, null, 2));
    if (updatedCategoryHtml) {
        zip.file(`categorias/${post.categoriaSlug}/index.html`, updatedCategoryHtml);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(`nerdx-remover-${post.slug}.zip`, blob);

    showStatus("success", `
        <strong>Pronto.</strong> Baixei <code>nerdx-remover-${post.slug}.zip</code> com o <code>api/posts.json</code>
        ${updatedCategoryHtml ? `e a página da categoria` : ""} atualizados. Suba esses arquivos pro repositório (substituindo os existentes) e faça commit.
        Se quiser apagar o arquivo do artigo também, delete manualmente <code>categorias/${post.categoriaSlug}/${post.slug}.html</code> no GitHub.
    `);

    loadPosts();
}

loadPosts();
