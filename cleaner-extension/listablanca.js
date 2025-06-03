const ul = document.getElementById("lista");

chrome.storage.local.get(["listaBlanca"], (result) => {
  const lista = result.listaBlanca || [];
  lista.forEach((dominio, index) => {
    const li = document.createElement("li");
    li.textContent = dominio;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => {
      lista.splice(index, 1);
      chrome.storage.local.set({ listaBlanca: lista }, () => location.reload());
    };

    li.appendChild(btn);
    ul.appendChild(li);
  });
});
