const titulo = document.getElementById("titulo");
const slug = document.getElementById("slug");

titulo.addEventListener("input", () => {

slug.value = titulo.value

.toLowerCase()

.normalize("NFD")

.replace(/[\u0300-\u036f]/g,"")

.replace(/[^a-z0-9 ]/g,"")

.trim()

.replace(/\s+/g,"-");

});

document.getElementById("postForm")

.addEventListener("submit",(e)=>{

e.preventDefault();

alert("Na próxima etapa o artigo será gerado automaticamente.");

});
