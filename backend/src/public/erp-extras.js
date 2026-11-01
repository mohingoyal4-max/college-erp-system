/* Adds Fees / Timetable / Reports links to the AcademiaPro sidebar.
   Include once in index.html:  <script src="/erp-static/erp-extras.js"></script> */
(function () {
  var ICONS = {
    fees: '<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line>',
    timetable: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>',
    reports: '<path d="M3 3v18h18"></path><path d="M7 16v-5M12 16V8M17 16v-3"></path>',
  };

  function currentUser() {
    try { return JSON.parse(localStorage.getItem('erp_user') || 'null'); } catch (e) { return null; }
  }
  function wanted(u) {
    var perms = u.permissions || [], admin = u.role === 'ADMIN', out = [];
    if (u.role === 'STUDENT') return [['fees', 'My Fees', '/fees'], ['timetable', 'My Timetable', '/timetable']];
    if (admin || perms.indexOf('fees.manage') > -1) out.push(['fees', 'Fees', '/fees']);
    if (admin || perms.indexOf('timetable.manage') > -1 || u.role === 'FACULTY') out.push(['timetable', 'Timetable', '/timetable']);
    if (admin || perms.indexOf('reports.view') > -1) out.push(['reports', 'Reports', '/reports']);
    return out;
  }
  function setLabel(a, text) {
    var w = document.createTreeWalker(a, NodeFilter.SHOW_TEXT), n, done = false;
    while ((n = w.nextNode())) {
      if (n.nodeValue.trim()) { if (!done) { n.nodeValue = text; done = true; } else n.nodeValue = ''; }
    }
  }
  function inject() {
    var u = currentUser();
    if (!u) return;
    var anchors = Array.prototype.filter.call(document.querySelectorAll('a[href]'), function (a) {
      return /^\/(admin|faculty|student|portal)(\/|$)/.test(a.getAttribute('href')) && !a.dataset.erpExtra;
    });
    if (anchors.length < 2) return;
    var tpl = anchors.filter(function (a) { return !a.hasAttribute('aria-current'); }).pop() || anchors[anchors.length - 1];
    var parent = tpl.parentNode;
    if (parent.querySelector('[data-erp-extra]')) return;
    var after = anchors[anchors.length - 1];
    var ref = after.nextSibling;
    wanted(u).forEach(function (it) {
      var a = tpl.cloneNode(true);
      a.dataset.erpExtra = it[0];
      a.setAttribute('href', it[2]);
      a.removeAttribute('aria-current');
      a.removeAttribute('data-discover');
      var svg = a.querySelector('svg');
      if (svg) svg.innerHTML = ICONS[it[0]];
      setLabel(a, it[1]);
      after.parentNode.insertBefore(a, ref);
    });
  }
  var t = null;
  function schedule() { if (t) return; t = setTimeout(function () { t = null; try { inject(); } catch (e) {} }, 60); }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('storage', schedule);
  schedule();
})();