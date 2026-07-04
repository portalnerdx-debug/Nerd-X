/* =====================================
   NERD X - MAIN.JS v1.0
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Nerd X carregado com sucesso!");

    // Header muda ao rolar a página
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 60) {
            header.style.background = "#0B0F16";
            header.style.boxShadow = "0 5px 20px rgba(0,0,0,.5)";
        } else {
            header.style.background = "#111827";
            header.style.boxShadow = "0 15px 40px rgba(0,0,0,.30)";
        }

    });

    // Efeito nos cards
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.boxShadow =
                "0 0 25px rgba(0,191,255,.45)";

        });

        card.addEventListener("mouseleave", () => {

            card.style.boxShadow =
                "0 15px 40px rgba(0,0,0,.30)";

        });

    });

    // Botão principal
    const button = document.querySelector(".btn");

    if (button) {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            alert("🚀 Em breve você será levado para o artigo em destaque!");

        });

    }
        // Data atual
    const date = document.getElementById("current-date");

    if (date) {

        const today = new Date();

        date.innerHTML = today.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }

});
