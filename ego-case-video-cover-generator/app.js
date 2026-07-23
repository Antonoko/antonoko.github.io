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
};

const state = {
  icon: null,
  iconName: '',
  dragging: false,
  pointerStart: null,
  dragDepth: 0,
};

const background = new Image();
background.src = 'titleBG.png';
background.onload = drawCover;

const TEXT_MAX_WIDTH = 1564;
const TITLE_MAX_SIZE = 86;
const TITLE_MIN_SIZE = 8;
const TITLE_Y_WITH_ICON = 524;
const TITLE_Y_NO_ICON = 470;
const SUBTITLE_SIZE = 52;
const SUBTITLE_TRACKING = -2.6;
const SUBTITLE_LINE_HEIGHT = 70.2;

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

function fitSingleLine(text, maxWidth) {
  let size = TITLE_MAX_SIZE;
  while (size > TITLE_MIN_SIZE) {
    setFont({ size, weight: 600 });
    if (measureTrackedText(text, titleTracking(size)) <= maxWidth) break;
    size -= 0.5;
  }
  return size;
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
  const size = currentValue(controls.iconSize);
  const aspect = state.icon.naturalWidth / state.icon.naturalHeight || 1;
  const width = aspect >= 1 ? size : size * aspect;
  const height = aspect >= 1 ? size / aspect : size;
  const centerX = canvas.width / 2 + currentValue(controls.iconX);
  const centerY = 352 + currentValue(controls.iconY);
  return { x: centerX - width / 2, y: centerY - height / 2, width, height };
}

function drawCover() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background.complete && background.naturalWidth) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  else { ctx.fillStyle = '#f5f9fc'; ctx.fillRect(0, 0, canvas.width, canvas.height); }

  const iconRect = getIconRect();
  if (iconRect) ctx.drawImage(state.icon, iconRect.x, iconRect.y, iconRect.width, iconRect.height);

  const title = controls.title.value.trim() || '输入主标题';
  const titleSize = fitSingleLine(title, TEXT_MAX_WIDTH);
  setFont({ size: titleSize, weight: 600 });
  ctx.fillStyle = '#044281';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawTrackedText(title, canvas.width / 2, iconRect ? TITLE_Y_WITH_ICON : TITLE_Y_NO_ICON, titleTracking(titleSize));

  const subtitle = controls.subtitle.value.trim();
  if (subtitle) {
    setFont({ size: SUBTITLE_SIZE, weight: 400, italic: true });
    ctx.fillStyle = 'rgba(4, 66, 129, 0.8)';
    const lines = wrapText(subtitle, TEXT_MAX_WIDTH, 2, SUBTITLE_TRACKING);
    const firstY = (iconRect ? TITLE_Y_WITH_ICON : TITLE_Y_NO_ICON) + 105;
    lines.forEach((line, index) => drawTrackedText(line, canvas.width / 2, firstY + index * SUBTITLE_LINE_HEIGHT, SUBTITLE_TRACKING));
  }
}

function updateUI() {
  document.querySelector('#titleCount').textContent = `${controls.title.value.length} / 120`;
  document.querySelector('#subtitleCount').textContent = `${controls.subtitle.value.length} / 160`;
  document.querySelector('#iconSizeValue').textContent = `${controls.iconSize.value} px`;
  document.querySelector('#iconXValue').textContent = `${controls.iconX.value} px`;
  document.querySelector('#iconYValue').textContent = `${controls.iconY.value} px`;
  document.querySelector('#iconGuide').classList.toggle('is-hidden', !controls.guideToggle.checked);
  canvas.classList.toggle('is-draggable', Boolean(state.icon));
  drawCover();
}

Object.values(controls).forEach((control) => {
  if (control !== controls.iconInput) control.addEventListener('input', updateUI);
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
  controls.iconSize.value = 180;
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
    link.download = `${cleanTitle}-1920x1080.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('封面已导出');
  }, 'image/png');
});

Promise.all([
  document.fonts?.load('600 86px "Inter"'),
  document.fonts?.load('italic 400 52px "Inter"'),
]).then(drawCover);
updateUI();
