/* Saphir M. Groupe SA — interactions */

(function () {
  'use strict';

  /* ---------------------------------------------------- Menu mobile -- */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* --------------------------------------------------------- Message -- */

  var toast = document.getElementById('toast');
  var toastTitle = document.getElementById('toastTitle');
  var toastText = document.getElementById('toastText');
  var toastTimer;

  function notify(title, text) {
    toastTitle.textContent = title;
    toastText.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  /* -------------------------------------------------------- Catalogue -- */

  var modal = document.getElementById('catalogue');
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-catalogue]').forEach(function (el) {
    el.addEventListener('click', openModal);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.modal-close')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  document.querySelectorAll('[data-product]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-product');
      closeModal();
      notify('Produit noté', name + ' — appelez-nous au 695 51 53 26 pour les tarifs et la disponibilité.');
    });
  });

  /* --------------------------------------- Dossier technique (PDF) -- */

  // Génère un PDF minimal côté navigateur. Le texte reste en ASCII :
  // la police Helvetica de base n'embarque pas les accents.
  function buildPdf(lines) {
    var body = 'BT\n';
    body += '/F1 22 Tf\n60 770 Td\n(SAPHIR M. GROUPE SA) Tj\n';
    body += '/F1 10 Tf\n0 -18 Td\n(Dossier technique - edition 2025) Tj\n';

    lines.forEach(function (line) {
      var size = line.heading ? 13 : 10.5;
      var gap = line.heading ? -30 : -16;
      var text = line.text.replace(/[\\()]/g, function (c) { return '\\' + c; });
      body += '/F1 ' + size + ' Tf\n0 ' + gap + ' Td\n(' + text + ') Tj\n';
    });

    body += 'ET';

    var objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
        '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      '<< /Length ' + body.length + ' >>\nstream\n' + body + '\nendstream',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
    ];

    var pdf = '%PDF-1.4\n';
    var offsets = [];

    objects.forEach(function (obj, i) {
      offsets.push(pdf.length);
      pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n';
    });

    var xref = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.forEach(function (offset) {
      pdf += ('0000000000' + offset).slice(-10) + ' 00000 n \n';
    });
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
    pdf += 'startxref\n' + xref + '\n%%EOF';

    return pdf;
  }

  var DOSSIER = [
    { text: 'Installations thermiques et energies renouvelables au Cameroun.' },
    { text: 'Plus de vingt ans d activite, environ 500 installations posees.' },
    { text: 'Nos metiers', heading: true },
    { text: '1. Solaire thermique - chauffe-eau de 100 a 500 litres,' },
    { text: '   capteurs plans et production d eau chaude sanitaire.' },
    { text: '2. Photovoltaique - modules monocristallins de 300 a 600 Wc,' },
    { text: '   onduleurs hybrides, batteries lithium, mise en service.' },
    { text: '3. Surpression d eau - pompes centrifuges, surpresseurs,' },
    { text: '   reservoirs a vessie et regulation automatique.' },
    { text: '4. Aeration forcee - extracteurs, ventilation mecanique,' },
    { text: '   gaines et equilibrage des debits.' },
    { text: 'Deroulement d un chantier', heading: true },
    { text: 'Visite et releve sur site, puis devis chiffre poste par poste.' },
    { text: 'Fourniture et pose par nos equipes, reception avec le client.' },
    { text: 'Contrat d entretien annuel et intervention en cas de panne.' },
    { text: 'Contact', heading: true },
    { text: 'Telephone : +237 695 51 53 26' },
    { text: 'Courriel  : contact@saphirmgroupe.cm' },
    { text: 'Saphir M. Groupe SA - Cameroun' }
  ];

  document.querySelectorAll('[data-download]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var blob = new Blob([buildPdf(DOSSIER)], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');

      a.href = url;
      a.download = 'Saphir-M-Groupe_Dossier-technique_2025.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

      notify('Téléchargement lancé', 'Le dossier technique est en cours de téléchargement.');
    });
  });

  /* ------------------------------------------------------------ Année -- */

  document.getElementById('year').textContent = new Date().getFullYear();
})();
