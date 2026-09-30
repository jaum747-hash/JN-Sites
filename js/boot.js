/* Roda antes da primeira pintura. Com JS e sem "reduzir movimento", marca o
   documento com .movimento e o CSS esconde o que vai ser animado.
   Trava: se o main.js nao marcar .pronto em 3s (arquivo falhou, rede ruim),
   tira a marca e tudo aparece parado. */
(function () {
  var raiz = document.documentElement;
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  raiz.classList.add("movimento");
  setTimeout(function () {
    if (!raiz.classList.contains("pronto")) raiz.classList.remove("movimento");
  }, 3000);
})();
