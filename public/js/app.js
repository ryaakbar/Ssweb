/**
 * app.js — SnapShot Dashboard UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── State ──────────────────────────────────────────────
  let selectedProvider = 'pikwy';
  let lastResult = null;
  let lastUrl = '';

  // ── Elements ───────────────────────────────────────────
  const urlInput      = document.getElementById('urlInput');
  const captureBtn    = document.getElementById('captureBtn');
  const clearBtn      = document.getElementById('clearBtn');
  const providerCards = document.querySelectorAll('.provider-card');
  const configGrid    = document.getElementById('configGrid');
  const configBadge   = document.getElementById('configBadge');

  const previewEmpty   = document.getElementById('previewEmpty');
  const previewLoading = document.getElementById('previewLoading');
  const previewResult  = document.getElementById('previewResult');
  const previewError   = document.getElementById('previewError');
  const previewImg     = document.getElementById('previewImg');
  const browserUrl     = document.getElementById('browserUrl');
  const metaProvider   = document.getElementById('metaProvider');
  const metaTime       = document.getElementById('metaTime');
  const loadingText    = document.getElementById('loadingText');
  const previewActions = document.getElementById('previewActions');
  const downloadBtn    = document.getElementById('downloadBtn');
  const copyUrlBtn     = document.getElementById('copyUrlBtn');
  const retryBtn       = document.getElementById('retryBtn');
  const resultJsonWrap = document.getElementById('resultJsonWrap');
  const resultJson     = document.getElementById('resultJson');
  const copyJsonBtn    = document.getElementById('copyJsonBtn');
  const errorMsg       = document.getElementById('errorMsg');

  // ── Config Schemas ─────────────────────────────────────
  const CONFIGS = {
    pikwy: {
      label: 'Pikwy',
      fields: [
        { id: 'delay',    label: 'Delay (ms)',  type: 'number', default: 3000, min: 0, max: 10000 },
        { id: 'width',    label: 'Width (px)',  type: 'number', default: 1920, min: 320, max: 3840 },
        { id: 'height',   label: 'Height (px)', type: 'number', default: 1080, min: 240, max: 2160 },
        { id: 'format',   label: 'Format',      type: 'select', default: 'png', options: ['png','jpg','webp'] },
        { id: 'fullSize', label: 'Full page',   type: 'toggle', default: false },
        { id: 'zoom',     label: 'Zoom (%)',    type: 'number', default: 100, min: 10, max: 200 }
      ]
    },
    microlink: {
      label: 'Microlink',
      fields: [
        { id: 'width',    label: 'Width (px)',  type: 'number', default: 1920, min: 320, max: 3840 },
        { id: 'height',   label: 'Height (px)', type: 'number', default: 1080, min: 240, max: 2160 },
        { id: 'waitFor',  label: 'Wait (ms)',   type: 'number', default: 3000, min: 0, max: 15000 },
        { id: 'fullPage', label: 'Full page',   type: 'toggle', default: false },
        { id: 'element',  label: 'CSS selector (optional)', type: 'text', default: '' }
      ]
    },
    vivoldi: {
      label: 'Vivoldi',
      fields: [
        { id: 'device',   label: 'Device',    type: 'select', default: 'desktop_fhd',
          options: ['desktop_fhd','desktop_qhd','mobile','tablet_portrait','tablet_landscape'] },
        { id: 'browser',  label: 'Browser',   type: 'select', default: 'chromium',
          options: ['chromium','firefox'] },
        { id: 'format',   label: 'Format',    type: 'select', default: 'png',
          options: ['png','jpg'] },
        { id: 'delay',    label: 'Delay (s)', type: 'select', default: '2',
          options: ['1','2','3','5','7','9'] },
        { id: 'retina',   label: 'Retina',    type: 'toggle', default: false },
        { id: 'selector', label: 'CSS selector (optional)', type: 'text', default: '' }
      ]
    }
  };

  // ── Render Config Panel ────────────────────────────────
  function renderConfig(provider) {
    const schema = CONFIGS[provider];
    configBadge.textContent = schema.label;
    configGrid.innerHTML = '';

    const rows = [];
    let tempRow = null;

    schema.fields.forEach((field, i) => {
      if (field.type === 'toggle') {
        // Toggles as full-width row
        const wrap = document.createElement('div');
        wrap.className = 'config-field';
        wrap.innerHTML = `
          <div class="config-toggle-wrap">
            <span class="config-label">${field.label}</span>
            <button class="config-toggle ${field.default ? 'on' : ''}"
              data-id="${field.id}" data-state="${field.default ? 'true' : 'false'}"
              aria-label="${field.label}"></button>
          </div>`;
        configGrid.appendChild(wrap);
        return;
      }

      if (field.type === 'text') {
        const wrap = document.createElement('div');
        wrap.className = 'config-field';
        wrap.innerHTML = `
          <label class="config-label" for="cfg_${field.id}">${field.label}</label>
          <input class="config-input" id="cfg_${field.id}" data-id="${field.id}"
            type="text" placeholder="${field.default}" value="${field.default}" />`;
        configGrid.appendChild(wrap);
        return;
      }

      if (field.type === 'number' || field.type === 'select') {
        const cell = document.createElement('div');
        cell.className = 'config-field';

        if (field.type === 'number') {
          cell.innerHTML = `
            <label class="config-label" for="cfg_${field.id}">${field.label}</label>
            <input class="config-input" id="cfg_${field.id}" data-id="${field.id}"
              type="number" min="${field.min}" max="${field.max}" value="${field.default}" />`;
        } else {
          const opts = field.options.map(o =>
            `<option value="${o}" ${o === field.default ? 'selected' : ''}>${o}</option>`
          ).join('');
          cell.innerHTML = `
            <label class="config-label" for="cfg_${field.id}">${field.label}</label>
            <select class="config-select" id="cfg_${field.id}" data-id="${field.id}">${opts}</select>`;
        }

        if (!tempRow) {
          tempRow = document.createElement('div');
          tempRow.className = 'config-row';
          tempRow.appendChild(cell);
        } else {
          tempRow.appendChild(cell);
          configGrid.appendChild(tempRow);
          tempRow = null;
        }
      }
    });

    // Flush odd row
    if (tempRow) configGrid.appendChild(tempRow);

    // Toggle listeners
    configGrid.querySelectorAll('.config-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const state = btn.dataset.state === 'true';
        btn.dataset.state = (!state).toString();
        btn.classList.toggle('on', !state);
      });
    });
  }

  // ── Get Config Values ──────────────────────────────────
  function getConfigValues() {
    const schema = CONFIGS[selectedProvider];
    const result = {};
    schema.fields.forEach(field => {
      const el = configGrid.querySelector(`[data-id="${field.id}"]`);
      if (!el) return;

      if (field.type === 'toggle') {
        result[field.id] = el.dataset.state === 'true';
      } else if (field.type === 'number') {
        result[field.id] = Number(el.value);
      } else {
        result[field.id] = el.value;
      }
    });
    return result;
  }

  // ── Provider Card Selection ────────────────────────────
  providerCards.forEach(card => {
    card.addEventListener('click', () => {
      providerCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedProvider = card.dataset.id;
      renderConfig(selectedProvider);
    });
  });

  // Sidebar provider links
  document.querySelectorAll('.provider-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = link.dataset.provider;
      providerCards.forEach(c => {
        c.classList.toggle('active', c.dataset.id === pid);
      });
      selectedProvider = pid;
      renderConfig(selectedProvider);
    });
  });

  // ── Show/Hide Preview States ───────────────────────────
  function showState(state) {
    previewEmpty.style.display   = state === 'empty'   ? 'flex' : 'none';
    previewLoading.style.display = state === 'loading' ? 'flex' : 'none';
    previewResult.style.display  = state === 'result'  ? 'flex' : 'none';
    previewError.style.display   = state === 'error'   ? 'flex' : 'none';
  }

  // ── Loading Messages ───────────────────────────────────
  const LOADING_MSGS = {
    pikwy:      ['Initializing session...', 'Rendering page...', 'Capturing screenshot...'],
    microlink:  ['Connecting to Microlink...', 'Loading target URL...', 'Generating screenshot...'],
    vivoldi:    ['Initializing browser...', 'Applying viewport settings...', 'Processing capture...']
  };

  let msgIdx = 0;
  let msgTimer = null;

  function startLoadingMessages() {
    const msgs = LOADING_MSGS[selectedProvider];
    msgIdx = 0;
    loadingText.textContent = msgs[0];
    msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      loadingText.textContent = msgs[msgIdx];
    }, 2200);
  }

  function stopLoadingMessages() {
    if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
  }

  // ── Capture ────────────────────────────────────────────
  async function doCapture() {
    const url = urlInput.value.trim();
    if (!url) {
      urlInput.focus();
      shake(urlInput.parentElement);
      return;
    }

    let cleanUrl = url;
    if (!/^https?:\/\//.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      urlInput.value = cleanUrl;
    }

    lastUrl = cleanUrl;
    captureBtn.disabled = true;
    showState('loading');
    startLoadingMessages();
    previewActions.style.display = 'none';
    resultJsonWrap.style.display = 'none';

    const config = { input: cleanUrl, ...getConfigValues() };
    const t0 = Date.now();

    try {
      const data = await SnapAPI.capture(selectedProvider, config);
      stopLoadingMessages();

      if (!data.Status) {
        throw new Error(data.Error || 'Capture failed');
      }

      lastResult = data;
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

      // Determine image URL
      const imgUrl = data.Result_url || data.Download_url;
      previewImg.src = imgUrl;
      browserUrl.textContent = cleanUrl;
      metaProvider.textContent = CONFIGS[selectedProvider].label;
      metaTime.textContent = `${elapsed}s`;
      showState('result');
      previewActions.style.display = 'flex';

      // Result JSON
      resultJsonWrap.style.display = 'block';
      resultJson.textContent = JSON.stringify(data, null, 2);

      // Download btn
      downloadBtn.onclick = () => downloadImage(imgUrl, cleanUrl);
      copyUrlBtn.onclick = () => { copyToClipboard(imgUrl); showToast('URL copied!'); };

    } catch (err) {
      stopLoadingMessages();
      errorMsg.textContent = err.message || 'An unexpected error occurred.';
      showState('error');
    } finally {
      captureBtn.disabled = false;
    }
  }

  // ── Capture Button ─────────────────────────────────────
  captureBtn.addEventListener('click', doCapture);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') doCapture(); });
  retryBtn.addEventListener('click', doCapture);

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    showState('empty');
    previewActions.style.display = 'none';
    resultJsonWrap.style.display = 'none';
    lastResult = null;
    urlInput.focus();
  });

  // ── Copy JSON ──────────────────────────────────────────
  copyJsonBtn.addEventListener('click', () => {
    copyToClipboard(resultJson.textContent);
    showToast('JSON copied!');
  });

  // ── Helpers ────────────────────────────────────────────
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    });
  }

  function downloadImage(url, pageUrl) {
    const a = document.createElement('a');
    a.href = url;
    const domain = pageUrl.replace(/https?:\/\//, '').split('/')[0];
    a.download = `screenshot-${domain}-${Date.now()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Download started!');
  }

  function shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  let toastEl = null;
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  // Shake animation keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
  `;
  document.head.appendChild(style);

  // ── Init ───────────────────────────────────────────────
  renderConfig('pikwy');
  showState('empty');
});
