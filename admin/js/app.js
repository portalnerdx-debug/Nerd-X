document.addEventListener("DOMContentLoaded", async () => {

    const totalPosts = document.getElementById("totalPosts");
    const totalCategorias = document.getElementById("totalCategorias");
    const totalAutores = document.getElementById("totalAutores");
    const recentPosts = document.getElementById("recentPosts");

    try {

        const response = await fetch("../data/posts.json");

        if (!response.ok) {
            throw new Error("posts.json não encontrado");
        }

        const posts = await response.json();

        totalPosts.textContent = posts.length;

        const categorias = [...new Set(posts.map(post => post.categoria))];
        totalCategorias.textContent = categorias.length;

        const autores = [...new Set(posts.map(post => post.autor))];
        totalAutores.textContent = autores.length;

        recentPosts.innerHTML = "";

        posts
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5)
            .forEach(post => {

                const artigo = document.createElement("div");

                artigo.className = "recent-post";

                artigo.innerHTML = `
                    <h3>${post.titulo}</h3>
                    <small>${post.categoria} • ${post.data}</small>
                `;

                recentPosts.appendChild(artigo);

            });

    }

    catch(error){

        console.error(error);

        recentPosts.innerHTML = `
            <p style="color:#ef4444;">
                Nenhum artigo encontrado.
            </p>
        `;

    }

});
