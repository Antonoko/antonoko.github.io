const canvas = document.querySelector('#coverCanvas');
const ctx = canvas.getContext('2d');

const controls = {
  title: document.querySelector('#titleInput'),
  subtitle: document.querySelector('#subtitleInput'),
  iconInput: document.querySelector('#iconInput'),
  iconSize: document.querySelector('#iconSize'),
  iconX: document.querySelector('#iconX'),
  iconY: document.querySelector('#iconY'),
  guideToggle: document.querySelector('#guideToggle'),
  darkMode: document.querySelector('#darkModeToggle'),
  verticalMode: document.querySelector('#verticalModeToggle'),
};

const state = {
  icon: null,
  iconName: '',
  dragging: false,
  pointerStart: null,
  dragDepth: 0,
  darkMode: false,
  orientation: 'landscape',
  iconSettings: {
    landscape: { size: 180, x: 0, y: 0 },
    vertical: { size: 300, x: 0, y: 0 },
  },
};

const backgrounds = {
  landscape: { light: new Image(), dark: new Image() },
  vertical: { light: new Image(), dark: new Image() },
};
backgrounds.landscape.light.src = 'background-wordmark.png';
backgrounds.landscape.dark.src = 'background-wordmark-dark.png';
backgrounds.vertical.light.src = 'background-wordmark-vertical.png';
backgrounds.vertical.dark.src = 'background-wordmark-vertical-dark.png';
Object.values(backgrounds).flatMap((pair) => Object.values(pair)).forEach((image) => { image.onload = drawCover; });

const LAYOUTS = {
  landscape: {
    width: 1920,
    height: 1080,
    textMaxWidth: 1564,
    titleMaxSize: 86,
    titleMaxLines: 1,
    titleLineHeight: 129,
    titleFirstY: 524,
    titleFirstYNoIcon: 470,
    textGap: 6,
    iconCenterY: 352,
    defaultIconSize: 180,
    lightTextColor: '#044281',
    lightSubtitleColor: '#044281',
  },
  vertical: {
    width: 1080,
    height: 1920,
    textMaxWidth: 960,
    titleMaxSize: 86,
    titleMaxLines: 2,
    titleLineHeight: 103.2,
    titleFirstY: 803.6,
    titleFirstYNoIcon: 731.6,
    textGap: 64,
    iconCenterY: 508,
    defaultIconSize: 300,
    lightTextColor: '#1c3274',
    lightSubtitleColor: '#1c3274',
  },
};

const TITLE_MIN_SIZE = 8;
const SUBTITLE_SIZE = 52;
const SUBTITLE_TRACKING = -2.6;
const SUBTITLE_LINE_HEIGHT = 70.2;

function currentLayout() {
  return LAYOUTS[state.orientation];
}

function currentValue(input) {
  return Number(input.value);
}

function setFont({ size, weight = 400, italic = false }) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "Inter", sans-serif`;
}

function measureTrackedText(text, tracking = 0) {
  const chars = Array.from(text);
  return ctx.measureText(text).width + Math.max(0, chars.length - 1) * tracking;
}

function drawTrackedText(text, centerX, y, tracking = 0) {
  const chars = Array.from(text);
  let x = centerX - measureTrackedText(text, tracking) / 2;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((char, index) => {
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : tracking);
  });
  ctx.textAlign = previousAlign;
}

function titleTracking(size) {
  return size * -0.04;
}

function fitTitle(text, layout) {
  let size = layout.titleMaxSize;
  while (size > TITLE_MIN_SIZE) {
    setFont({ size, weight: 600 });
    const tracking = titleTracking(size);
    const lines = wrapText(text, layout.textMaxWidth, Number.POSITIVE_INFINITY, tracking);
    if (lines.length <= layout.titleMaxLines) return { size, lines };
    size -= 0.5;
  }
  setFont({ size, weight: 600 });
  return {
    size,
    lines: wrapText(text, layout.textMaxWidth, layout.titleMaxLines, titleTracking(size)),
  };
}

function wrapText(text, maxWidth, maxLines = 2, tracking = 0) {
  const chars = Array.from(text.trim());
  if (!chars.length) return [];
  const words = /\s/.test(text.trim()) ? text.trim().split(/\s+/) : chars;
  const spacer = /\s/.test(text.trim()) ? ' ' : '';
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line}${spacer}${word}` : word;
    if (measureTrackedText(test, tracking) <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`.trim();
    while (measureTrackedText(`${kept[maxLines - 1]}…`, tracking) > maxWidth && kept[maxLines - 1].length > 1) {
      kept[maxLines - 1] = kept[maxLines - 1].slice(0, -1).trimEnd();
    }
    kept[maxLines - 1] += '…';
    return kept;
  }
  return lines;
}

function getIconRect() {
  if (!state.icon) return null;
  const layout = currentLayout();
  const size = currentValue(controls.iconSize);
  const aspect = state.icon.naturalWidth / state.icon.naturalHeight || 1;
  const width = aspect >= 1 ? size : size * aspect;
  const height = aspect >= 1 ? size / aspect : size;
  const centerX = canvas.width / 2 + currentValue(controls.iconX);
  const centerY = layout.iconCenterY + currentValue(controls.iconY);
  return { x: centerX - width / 2, y: centerY - height / 2, width, height };
}

function drawCover() {
  const layout = currentLayout();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const background = backgrounds[state.orientation][state.darkMode ? 'dark' : 'light'];
  if (background.complete && background.naturalWidth) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  else { ctx.fillStyle = state.darkMode ? '#08121e' : '#f5f9fc'; ctx.fillRect(0, 0, canvas.width, canvas.height); }

  const iconRect = getIconRect();
  if (iconRect) ctx.drawImage(state.icon, iconRect.x, iconRect.y, iconRect.width, iconRect.height);

  const title = controls.title.value.trim() || '输入主标题';
  const fittedTitle = fitTitle(title, layout);
  setFont({ size: fittedTitle.size, weight: 600 });
  ctx.fillStyle = state.darkMode ? '#f5faff' : layout.lightTextColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleFirstY = iconRect ? layout.titleFirstY : layout.titleFirstYNoIcon;
  fittedTitle.lines.forEach((line, index) => {
    drawTrackedText(line, canvas.width / 2, titleFirstY + index * layout.titleLineHeight, titleTracking(fittedTitle.size));
  });

  const subtitle = controls.subtitle.value.trim();
  if (subtitle) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    setFont({ size: SUBTITLE_SIZE, weight: 300, italic: true });
    ctx.fillStyle = state.darkMode ? '#f5faff' : layout.lightSubtitleColor;
    const lines = wrapText(subtitle, layout.textMaxWidth, 2, SUBTITLE_TRACKING);
    const titleBlockBottom = titleFirstY + (fittedTitle.lines.length - 1) * layout.titleLineHeight + layout.titleLineHeight / 2;
    const firstY = titleBlockBottom + layout.textGap + SUBTITLE_LINE_HEIGHT / 2;
    lines.forEach((line, index) => drawTrackedText(line, canvas.width / 2, firstY + index * SUBTITLE_LINE_HEIGHT, SUBTITLE_TRACKING));
    ctx.restore();
  }
}

function saveCurrentIconSettings() {
  state.iconSettings[state.orientation] = {
    size: currentValue(controls.iconSize),
    x: currentValue(controls.iconX),
    y: currentValue(controls.iconY),
  };
}

function loadCurrentIconSettings() {
  const settings = state.iconSettings[state.orientation];
  controls.iconSize.value = settings.size;
  controls.iconX.value = settings.x;
  controls.iconY.value = settings.y;
}

function updateUI({ saveSettings = true } = {}) {
  state.darkMode = controls.darkMode.checked;
  if (saveSettings) saveCurrentIconSettings();
  document.querySelector('#titleCount').textContent = `${controls.title.value.length} / 120`;
  document.querySelector('#subtitleCount').textContent = `${controls.subtitle.value.length} / 160`;
  document.querySelector('#iconSizeValue').textContent = `${controls.iconSize.value} px`;
  document.querySelector('#iconXValue').textContent = `${controls.iconX.value} px`;
  document.querySelector('#iconYValue').textContent = `${controls.iconY.value} px`;
  document.querySelector('#iconGuide').classList.toggle('is-hidden', !controls.guideToggle.checked);
  document.body.classList.toggle('cover-dark', state.darkMode);
  document.body.classList.toggle('cover-vertical', state.orientation === 'vertical');
  canvas.classList.toggle('is-draggable', Boolean(state.icon));
  drawCover();
}

Object.values(controls).forEach((control) => {
  if (control !== controls.iconInput && control !== controls.verticalMode) {
    control.addEventListener('input', () => updateUI());
  }
});

controls.verticalMode.addEventListener('input', () => {
  saveCurrentIconSettings();
  state.orientation = controls.verticalMode.checked ? 'vertical' : 'landscape';
  loadCurrentIconSettings();
  const layout = currentLayout();
  canvas.width = layout.width;
  canvas.height = layout.height;
  document.querySelector('#canvasWrap').classList.toggle('is-vertical', state.orientation === 'vertical');
  document.querySelector('.export-size').textContent = `${layout.width} × ${layout.height} PNG`;
  updateUI({ saveSettings: false });
});

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function loadIconFile(file) {
  if (!file?.type.startsWith('image/')) {
    showToast('请拖入图片文件');
    return;
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    if (state.icon?.dataset?.objectUrl) URL.revokeObjectURL(state.icon.dataset.objectUrl);
    image.dataset.objectUrl = url;
    state.icon = image;
    state.iconName = file.name;
    document.querySelector('#uploadTitle').textContent = '更换图标';
    document.querySelector('#iconFileName').textContent = file.name;
    document.querySelector('#removeIcon').disabled = false;
    updateUI();
    showToast('图标已更新');
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    showToast('无法读取这张图片');
  };
  image.src = url;
}

controls.iconInput.addEventListener('change', () => {
  const file = controls.iconInput.files[0];
  if (file) loadIconFile(file);
});

const dropOverlay = document.querySelector('#dropOverlay');

document.addEventListener('dragenter', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault();
  state.dragDepth += 1;
  dropOverlay.classList.add('show');
});

document.addEventListener('dragover', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
});

document.addEventListener('dragleave', (event) => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  state.dragDepth = Math.max(0, state.dragDepth - 1);
  if (!state.dragDepth) dropOverlay.classList.remove('show');
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
  state.dragDepth = 0;
  dropOverlay.classList.remove('show');
  const file = [...(event.dataTransfer?.files || [])].find((item) => item.type.startsWith('image/'));
  loadIconFile(file);
});

document.querySelector('#removeIcon').addEventListener('click', () => {
  if (state.icon?.dataset?.objectUrl) URL.revokeObjectURL(state.icon.dataset.objectUrl);
  state.icon = null;
  state.iconName = '';
  controls.iconInput.value = '';
  document.querySelector('#uploadTitle').textContent = '上传图标';
  document.querySelector('#iconFileName').textContent = '尚未上传';
  document.querySelector('#removeIcon').disabled = true;
  updateUI();
});

document.querySelector('#resetPosition').addEventListener('click', () => {
  controls.iconSize.value = currentLayout().defaultIconSize;
  controls.iconX.value = 0;
  controls.iconY.value = 0;
  updateUI();
});

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const iconRect = getIconRect();
  if (!iconRect) return;
  const point = canvasPoint(event);
  const inside = point.x >= iconRect.x && point.x <= iconRect.x + iconRect.width && point.y >= iconRect.y && point.y <= iconRect.y + iconRect.height;
  if (!inside) return;
  state.dragging = true;
  state.pointerStart = { point, x: currentValue(controls.iconX), y: currentValue(controls.iconY) };
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('is-dragging');
});

canvas.addEventListener('pointermove', (event) => {
  if (!state.dragging) return;
  const point = canvasPoint(event);
  controls.iconX.value = Math.max(-600, Math.min(600, Math.round(state.pointerStart.x + point.x - state.pointerStart.point.x)));
  controls.iconY.value = Math.max(-260, Math.min(260, Math.round(state.pointerStart.y + point.y - state.pointerStart.point.y)));
  updateUI();
});

function stopDragging(event) {
  if (!state.dragging) return;
  state.dragging = false;
  canvas.classList.remove('is-dragging');
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}
canvas.addEventListener('pointerup', stopDragging);
canvas.addEventListener('pointercancel', stopDragging);

document.querySelector('#exportButton').addEventListener('click', async () => {
  await document.fonts?.ready;
  drawCover();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    const cleanTitle = controls.title.value.trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 48) || 'video-cover';
    const layout = currentLayout();
    const orientationSuffix = state.orientation === 'vertical' ? '-vertical' : '';
    link.download = `${cleanTitle}${orientationSuffix}${state.darkMode ? '-dark' : ''}-${layout.width}x${layout.height}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('封面已导出');
  }, 'image/png');
});

Promise.all([
  document.fonts?.load('600 86px "Inter"'),
  document.fonts?.load('italic 300 52px "Inter"'),
]).then(drawCover);
updateUI();
