/* ==========================================================================
   joaoneto.sites - movimento da pagina
   Tudo aqui e enfeite: sem este arquivo o site continua completo e legivel.
   GSAP + ScrollTrigger + SplitText ficam em js/vendor (a CSP so aceita 'self').
   ========================================================================== */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ------------------------------------------------------------------------
     Antes e depois: funciona com ou sem movimento
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".comparar__controle").forEach(function (controle) {
    var celular = controle.closest(".comparar__celular");
    var aplica = function () { celular.style.setProperty("--pos", controle.value + "%"); };
    controle.addEventListener("input", aplica);
    aplica();
  });

  /* Topo ganha sombra depois que a pagina rola */
  var topo = document.querySelector(".topo");
  var marcaTopo = function () { topo.classList.toggle("rolou", window.scrollY > 8); };
  window.addEventListener("scroll", marcaTopo, { passive: true });
  marcaTopo();

  /* Sem movimento (preferencia do usuario ou GSAP nao carregou): para aqui */
  if (!raiz.classList.contains("movimento") || !window.gsap || !window.ScrollTrigger || !window.SplitText) {
    raiz.classList.remove("movimento");
    raiz.classList.add("pronto");
    return;
  }
  raiz.classList.add("pronto");

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ------------------------------------------------------------------------
     1. Cabecalho: titulo por linha, traco ambar, 1 -> 7
     ------------------------------------------------------------------------ */
  var titulo = document.getElementById("capa-titulo");
  gsap.set(titulo, { visibility: "visible" });
  SplitText.create(titulo, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: function (self) {
      return gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out", delay: 0.1 });
    }
  });

  gsap.fromTo(".destaque__traco",
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut", delay: 0.9 });

  /* o SplitText refaz o titulo quando as fontes chegam, entao o numero e
     buscado de novo a cada quadro em vez de guardado */
  if (titulo.querySelector(".destaque__num")) {
    var contagem = { v: 1 };
    gsap.to(contagem, {
      v: 7, duration: 1.1, delay: 0.45, ease: "power1.out",
      onUpdate: function () {
        var numero = titulo.querySelector(".destaque__num");
        if (numero) numero.textContent = Math.round(contagem.v);
      }
    });
  }

  gsap.to(".capa [data-surge]", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.3 });

  /* ------------------------------------------------------------------------
     2. Palco (so na home): o site se monta, depois troca de profissao em ciclo
     ------------------------------------------------------------------------ */
  var palco = document.querySelector(".palco");
  var rolaTela = null;
  if (palco) (function () {
    var navegador = palco.querySelector(".navegador");
    var celular = palco.querySelector(".celular--palco");
    var rolagem = palco.querySelector('[data-demo="rolagem"]');
    var tela = rolagem.parentElement;
    var pecas = palco.querySelectorAll("[data-monta]");

    var temas = [
      /* titulos iguais aos das capas dos sites-modelo: mudou la, muda aqui */
      { tema: "dentista", dominio: "drahelenamarques.com.br", nome: "Dra. Helena Marques", rotulo: "Cirurgiã-dentista · Ourinhos",
        titulo: "Dentista em Ourinhos para toda a família.", foto: "assets/demo-dentista.webp", rolagem: "assets/rolagem-dentista.webp" },
      { tema: "advocacia", dominio: "vieiraalves.adv.br", nome: "Vieira & Alves", rotulo: "Advocacia · Ourinhos",
        titulo: "Advocacia em Ourinhos com atendimento direto dos sócios.", foto: "assets/demo-advocacia.webp", rolagem: "assets/rolagem-advocacia.webp" },
      { tema: "estetica", dominio: "studiolia.com.br", nome: "Studio Lia", rotulo: "Estética facial e corporal",
        titulo: "Uma hora só sua.", foto: "assets/demo-estetica.webp", rolagem: "assets/rolagem-estetica.webp" }
    ];
    /* deixa as fotos dos outros temas no cache pra troca nao piscar */
    temas.slice(1).forEach(function (t) { new Image().src = t.foto; new Image().src = t.rolagem; });

    /* tela do celular do palco rola sozinha, ida e volta */
    rolaTela = gsap.to(rolagem, {
      y: function () { return -(rolagem.offsetHeight - tela.clientHeight); },
      duration: 12, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 0.8, paused: true
    });

    gsap.timeline({ delay: 0.25, onComplete: function () { rolaTela.play(); gsap.delayedCall(4, trocaTema); } })
      .fromTo(navegador, { autoAlpha: 0, y: 48, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" })
      .fromTo(pecas, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out" }, "-=0.45")
      .fromTo(celular, { autoAlpha: 0, x: 60, rotate: 5 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 1, ease: "power3.out" }, "-=0.7")
      .fromTo(".etiqueta", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.55, stagger: 0.3, ease: "back.out(1.8)" }, "-=0.4");

    var palcoVisivel = true;
    new IntersectionObserver(function (e) {
      palcoVisivel = e[0].isIntersecting;
      palcoVisivel ? rolaTela.resume() : rolaTela.pause();
    }).observe(palco);

    /* cada troca so agenda a proxima quando termina: nunca duas ao mesmo tempo */
    var atual = 0;
    function trocaTema() {
      if (document.hidden || !palcoVisivel) { gsap.delayedCall(1, trocaTema); return; }
      atual = (atual + 1) % temas.length;
      var t = temas[atual];
      var saem = Array.prototype.slice.call(pecas).concat(rolagem);
      gsap.timeline({ onComplete: function () { gsap.delayedCall(4.5, trocaTema); } })
        .to(saem, { autoAlpha: 0, y: -10, duration: 0.3, stagger: 0.03, ease: "power1.in" })
        .add(function () {
          navegador.dataset.tema = t.tema;
          palco.querySelectorAll("[data-demo]").forEach(function (el) {
            var chave = el.dataset.demo;
            if (el.tagName === "IMG") el.src = t[chave];
            else el.textContent = t[chave];
          });
          rolaTela.invalidate().restart();
        })
        .to(saem, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, "+=0.2");
    }
  })();

  /* ------------------------------------------------------------------------
     2b. Leque do portfolio: celulares entram em cascata e cada tela rola
         sozinha, num ritmo proprio; param quando o leque sai da tela
     ------------------------------------------------------------------------ */
  var leque = document.querySelector(".leque");
  if (leque) {
    var celularesLeque = leque.querySelectorAll(".celular");
    gsap.fromTo(celularesLeque, { autoAlpha: 0, y: 80 },
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.35 });
    gsap.fromTo(".etiqueta--leque", { autoAlpha: 0, scale: 0.8 },
      { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)", delay: 1.2 });

    var rolagensLeque = Array.prototype.map.call(leque.querySelectorAll(".celular__tela img"), function (img, k) {
      return gsap.to(img, {
        y: function () { return -(img.offsetHeight - img.parentElement.clientHeight); },
        duration: 11 + k * 2, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 1, delay: 1.4 + k * 0.6
      });
    });
    new IntersectionObserver(function (e) {
      rolagensLeque.forEach(function (t) { e[0].isIntersecting ? t.resume() : t.pause(); });
    }).observe(leque);
    window.addEventListener("load", function () { rolagensLeque.forEach(function (t) { t.invalidate(); }); });
  }

  /* ------------------------------------------------------------------------
     3. Titulos de secao entram linha por linha; blocos sobem em sequencia
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-linhas]").forEach(function (el) {
    gsap.set(el, { visibility: "visible" });
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.lines, {
          yPercent: 105, duration: 0.95, stagger: 0.1, ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
      }
    });
  });

  ScrollTrigger.batch("main > section:not(.capa) [data-surge]", {
    start: "top 88%",
    once: true,
    onEnter: function (lote) {
      gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", overwrite: true });
    }
  });

  /* barra de progresso no topo */
  gsap.to(".progresso", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ------------------------------------------------------------------------
     4. Demos dos recursos: so rodam quando estao na tela
     ------------------------------------------------------------------------ */
  function digita(demo) {
    var alvo = demo.querySelector("[data-digita]");
    var texto = alvo.dataset.digita;
    demo.rodando = true;
    (async function () {
      while (demo.classList.contains("visivel")) {
        demo.classList.remove("mostra");
        alvo.textContent = "";
        await espera(600);
        for (var i = 0; i < texto.length && demo.classList.contains("visivel"); i++) {
          alvo.textContent += texto[i];
          await espera(45 + Math.random() * 70);
        }
        await espera(300);
        demo.classList.add("mostra");
        await espera(4500);
      }
      /* saiu da tela: deixa o estado final pronto */
      alvo.textContent = texto;
      demo.classList.add("mostra");
      demo.rodando = false;
    })();
  }

  var observaDemo = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      var el = e.target;
      el.classList.toggle("visivel", e.isIntersecting);
      if (e.isIntersecting && el.querySelector("[data-digita]") && !el.rodando) digita(el);
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".demo").forEach(function (d) { observaDemo.observe(d); });

  /* Notas do Lighthouse: arco fecha e o numero conta ate 100, uma vez */
  var notas = document.querySelector(".notas");
  if (notas) {
    var valores = notas.querySelectorAll(".nota__valor");
    valores.forEach(function (v) { v.textContent = "0"; });
    new IntersectionObserver(function (e, obs) {
      if (!e[0].isIntersecting) return;
      obs.disconnect();
      notas.classList.add("visivel");
      var n = { v: 0 };
      gsap.to(n, {
        v: 100, duration: 1.6, ease: "power2.out",
        onUpdate: function () { valores.forEach(function (v) { v.textContent = Math.round(n.v); }); }
      });
    }, { threshold: 0.5 }).observe(notas);
  }

  /* ------------------------------------------------------------------------
     5. Retrato com leve paralaxe; telas da galeria e dos casos rolam com a pagina
     ------------------------------------------------------------------------ */
  if (document.querySelector(".retrato")) {
    gsap.fromTo(".retrato img",
      { scale: 1.14, yPercent: -5 },
      { scale: 1.14, yPercent: 5, ease: "none", scrollTrigger: { trigger: ".retrato", scrub: true } });
  }

  document.querySelectorAll(".caso").forEach(function (caso) {
    var img = caso.querySelector(".celular__tela img");
    gsap.to(img, {
      y: function () { return -(img.offsetHeight - img.parentElement.clientHeight); },
      ease: "none",
      scrollTrigger: { trigger: caso, start: "top 85%", end: "bottom 15%", scrub: 0.8, invalidateOnRefresh: true }
    });
  });

  document.querySelectorAll(".galeria .celular__tela img").forEach(function (img, k) {
    var telaModelo = img.parentElement;
    gsap.to(img, {
      y: function () { return -(img.offsetHeight - telaModelo.clientHeight); },
      ease: "none",
      scrollTrigger: {
        trigger: ".galeria",
        start: "top 80%",
        end: "bottom 10%",
        scrub: 0.6 + k * 0.2,
        invalidateOnRefresh: true
      }
    });
  });

  /* ------------------------------------------------------------------------
     6. Como funciona: circulo aparece, fio cresce ate o proximo
     ------------------------------------------------------------------------ */
  var passos = gsap.utils.toArray(".passo");
  gsap.set(passos, { "--s": 0, "--p": 0 });
  var linhaPassos = gsap.timeline({
    scrollTrigger: { trigger: ".passos", start: "top 80%", end: "bottom 55%", scrub: 0.5 }
  });
  passos.forEach(function (p) {
    linhaPassos.to(p, { "--s": 1, duration: 0.3, ease: "back.out(2)" });
    linhaPassos.to(p, { "--p": 1, duration: 0.7, ease: "none" });
  });

  /* ------------------------------------------------------------------------
     7. Botoes com ima: seguem o cursor de leve (so com mouse)
     ------------------------------------------------------------------------ */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".botao--ima").forEach(function (b) {
      var xPara = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" });
      var yPara = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        xPara((e.clientX - r.left - r.width / 2) * 0.3);
        yPara((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener("pointerleave", function () { xPara(0); yPara(0); });
    });
  }

  /* recalcula as medidas depois que as imagens e fontes chegam */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); if (rolaTela) rolaTela.invalidate(); });
})();
