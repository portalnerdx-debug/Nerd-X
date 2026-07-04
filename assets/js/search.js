/* =========================================================
   BUSCA — abre um overlay simples e leva o usuário para a
   página de pesquisa com o termo digitado.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.querySelector(".search-btn");
    if (!openBtn) return;

    let overlay = document.querySelector(".search-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "search-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Buscar no Nerd X");
        overlay.hidden = true;
        overlay.innerHTML = `
            <div class="search-overlay-inner">
                <form action="/pesquisa.html" method="get">
                    <input type="search" name="q" placeholder="Buscar matérias, Marvel, DC, tecnologia..." autocomplete="off">
                    <button type="submit" class="btn">Buscar</button>
                </form>
                <button type="button" class="search-overlay-close" aria-label="Fechar busca">✕</button>
            </div>`;
        document.body.appendChild(overlay);

        const style = document.createElement("style");
        style.textContent = `
            .search-overlay{position:fixed;inset:0;background:rgba(13,15,20,.86);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:14vh}
            .search-overlay-inner{width:min(560px,90vw);display:flex;gap:.75rem;align-items:center}
            .search-overlay-inner form{flex:1;display:flex;gap:.5rem}
            .search-overlay-inner input{flex:1;background:var(--color-panel);border:1px solid var(--color-border);border-radius:6px;padding:.85rem 1rem;color:var(--color-paper);font-size:1.05rem}
            .search-overlay-close{color:var(--color-dust);font-size:1.3rem;padding:.5rem}
        `;
        document.head.appendChild(style);
    }

    const close = () => { overlay.hidden = true; };
    const open = () => {
        overlay.hidden = false;
        overlay.querySelector("input").focus();
    };

    openBtn.addEventListener("click", open);
    overlay.querySelector(".search-overlay-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
});
