/* ================= SCROLL SUAVE + REVEAL ================= */
document.addEventListener("DOMContentLoaded", () => {
    // Links âncora internos
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
        link.addEventListener("click", (e) => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Reveal de elementos marcados com [data-animate]
    const items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    items.forEach((el) => observer.observe(el));
});
