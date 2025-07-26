(() => {
  const imageUploader = document.getElementById('imageUploader');
  const container = document.getElementById('container');
  const zoomableContent = document.getElementById('zoomable-content');
  const controls = document.getElementById('controls');
  const addTextBtn = document.getElementById('addTextBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const templateName = document.getElementById('templateName');
  const saveBtn = document.getElementById('saveBtn');
  const savedTemplates = document.getElementById('savedTemplates');
  const savedTemplatesList = document.getElementById('savedTemplatesList');
  const toggleSavedBtn = document.getElementById('toggleSavedBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const styleControls = document.getElementById('styleControls');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const fontSize = document.getElementById('fontSize');
  const fontFamily = document.getElementById('fontFamily');
  const fontColor = document.getElementById('fontColor');
  const downloadPopup = document.getElementById('downloadPopup');
  const confirmDownload = document.getElementById('confirmDownload');
  const cancelDownload = document.getElementById('cancelDownload');
  const darkToggle = document.getElementById('darkToggle');

  let imageElement = null;
  let focusedTextarea = null;

  // Utility: Convert rgb(...) to hex string
  function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    const result = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!result) return '#000000';
    return '#' + [result[1], result[2], result[3]]
      .map(x => ('0' + parseInt(x).toString(16)).slice(-2)).join('');
  }

  // Utility: Get pointer position (touch/mouse)
  function getPointerPos(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  // Dark mode toggle and persistence
  darkToggle.checked = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', darkToggle.checked);
  darkToggle.addEventListener('change', () => {
    document.documentElement.classList.toggle('dark', darkToggle.checked);
    localStorage.setItem('darkMode', darkToggle.checked);
  });

  // Show/hide saved templates list
  toggleSavedBtn.addEventListener('click', () => {
    if (savedTemplates.style.display === 'block') {
      savedTemplates.style.display = 'none';
      toggleSavedBtn.textContent = 'Show Saved Templates';
    } else {
      savedTemplates.style.display = 'block';
      toggleSavedBtn.textContent = 'Hide Saved Templates';
      savedTemplatesList.focus();
    }
  });

  // Load saved templates from localStorage and render the list
  function loadTemplates() {
    const data = JSON.parse(localStorage.getItem('imageTemplates') || '{}');
    savedTemplatesList.innerHTML = '';
    if (Object.keys(data).length === 0) {
      savedTemplates.style.display = 'none';
      toggleSavedBtn.style.display = 'inline-block';
      return;
    }
    savedTemplates.style.display = 'block';
    toggleSavedBtn.style.display = 'inline-block';

    for (const name in data) {
      const li = document.createElement('li');

      const span = document.createElement('span');
      span.textContent = name;
      span.tabIndex = 0;
      span.setAttribute('role', 'button');
      span.addEventListener('click', () => restoreState(data[name]));
      span.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          restoreState(data[name]);
        }
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.title = `Delete template ${name}`;
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`Delete template "${name}"?`)) {
          delete data[name];
          localStorage.setItem('imageTemplates', JSON.stringify(data));
          loadTemplates();
        }
      });

      li.appendChild(span);
      li.appendChild(delBtn);
      savedTemplatesList.appendChild(li);
    }
  }

  // Enable/disable Save button based on input and image loaded
  templateName.addEventListener('input', () => {
    saveBtn.disabled = !templateName.value.trim() || !imageElement;
  });

  // Save current editor state as a template
  saveBtn.addEventListener('click', () => {
    const name = templateName.value.trim();
    if (!name) return alert('Please enter a template name');
    if (!imageElement) return alert('Please upload an image first');

    let data = JSON.parse(localStorage.getItem('imageTemplates') || '{}');
    if (name in data && !confirm(`Template "${name}" exists. Overwrite?`)) return;

    data[name] = captureState();
    localStorage.setItem('imageTemplates', JSON.stringify(data));
    alert('Template saved');
    templateName.value = '';
    saveBtn.disabled = true;
    loadTemplates();
  });

  // Clear all content and reset
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Clear all content and start new?')) {
      zoomableContent.innerHTML = '';
      imageElement = null;
      controls.style.display = 'none';
      clearAllBtn.style.display = 'none';
      downloadBtn.disabled = true;
      shareBtn.disabled = true;
      saveBtn.disabled = true;
      savedTemplates.style.display = 'none';
      toggleSavedBtn.style.display = 'inline-block';
      templateName.value = '';
      hideStyleControls();
    }
  });

  // Add new text box
  addTextBtn.addEventListener('click', () => {
    if (!imageElement) return;
    const wrapper = createTextbox('Edit text', '10px', '10px');
    zoomableContent.appendChild(wrapper);
    wrapper.querySelector('textarea').focus();
  });

  // Create a new text box element with controls
  function createTextbox(text = '', top = '10px', left = '10px', styles = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'textbox-wrapper';
    wrapper.style.top = top;
    wrapper.style.left = left;

    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, styles);
    textarea.value = text;
    wrapper.appendChild(textarea);

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '●';
    wrapper.appendChild(dragHandle);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'textbox-buttons';

    // Duplicate button
    const dupBtn = document.createElement('button');
    dupBtn.title = 'Duplicate';
    dupBtn.textContent = '⎘';
    dupBtn.addEventListener('click', () => duplicateTextbox(wrapper));
    btnContainer.appendChild(dupBtn);

    // Lock/unlock button
    const lockBtn = document.createElement('button');
    lockBtn.title = 'Lock';
    lockBtn.textContent = '🔓';
    lockBtn.addEventListener('click', () => toggleLock(wrapper, lockBtn, textarea, dragHandle));
    btnContainer.appendChild(lockBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.title = 'Delete';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this text box?')) {
        wrapper.remove();
        if (focusedTextarea === textarea) {
          focusedTextarea = null;
          hideStyleControls();
        }
      }
    });
    btnContainer.appendChild(delBtn);

    wrapper.appendChild(btnContainer);

    makeDraggable(wrapper, dragHandle);
    attachTextareaListeners(textarea);

    return wrapper;
  }

  // Duplicate a text box
  function duplicateTextbox(wrapper) {
    const textarea = wrapper.querySelector('textarea');
    const style = window.getComputedStyle(textarea);
    const styles = {
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      color: style.color,
    };

    const newTop = (parseInt(wrapper.style.top) + 20) + 'px';
    const newLeft = (parseInt(wrapper.style.left) + 20) + 'px';

    const newBox = createTextbox(textarea.value, newTop, newLeft, styles);
    zoomableContent.appendChild(newBox);
  }

  // Toggle locking a text box
  function toggleLock(wrapper, btn, textarea, dragHandle) {
    if (wrapper.classList.contains('locked')) {
      wrapper.classList.remove('locked');
      textarea.readOnly = false;
      textarea.style.cursor = 'text';
      textarea.style.userSelect = 'text';
      textarea.style.backgroundColor = 'rgba(255,255,255,0.7)';
      dragHandle.style.cursor = 'grab';
      dragHandle.style.backgroundColor = 'var(--drag-handle-bg)';
      btn.textContent = '🔓';
      btn.title = 'Lock text box';
    } else {
      wrapper.classList.add('locked');
      textarea.readOnly = true;
      textarea.style.cursor = 'default';
      textarea.style.userSelect = 'none';
      textarea.style.backgroundColor = '#eee';
      dragHandle.style.cursor = 'default';
      dragHandle.style.backgroundColor = '#999';
      btn.textContent = '🔒';
      btn.title = 'Unlock text box';
      if (focusedTextarea === textarea) {
        focusedTextarea = null;
        hideStyleControls();
      }
    }
  }

  // Attach listeners to textarea for style updates
  function attachTextareaListeners(textarea) {
    ['input', 'keyup', 'mouseup', 'focus', 'blur'].forEach(ev =>
      textarea.addEventListener(ev, () => {
        if (focusedTextarea === textarea) updateStylePosition();
      })
    );
  }

  // Make a wrapper draggable using its drag handle
  function makeDraggable(wrapper, handle) {
    let dragging = false;
    let startX, startY, origX, origY;

    function dragStart(e) {
      if (wrapper.classList.contains('locked')) return;
      e.preventDefault();
      const pos = getPointerPos(e);
      if (!pos) return;

      dragging = true;
      startX = pos.x;
      startY = pos.y;
      const rect = wrapper.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      handle.style.cursor = 'grabbing';
      wrapper.style.zIndex = 9999;
    }

    function dragMove(e) {
      if (!dragging) return;
      e.preventDefault();
      const pos = getPointerPos(e);
      if (!pos) return;

      let dx = pos.x - startX;
      let dy = pos.y - startY;
      const contRect = zoomableContent.getBoundingClientRect();

      let newLeft = origX + dx - contRect.left;
      let newTop = origY + dy - contRect.top;

      newLeft = Math.max(0, Math.min(newLeft, contRect.width - wrapper.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, contRect.height - wrapper.offsetHeight));

      wrapper.style.left = newLeft + 'px';
      wrapper.style.top = newTop + 'px';

      if (focusedTextarea === wrapper.querySelector('textarea')) {
        updateStylePosition();
      }
    }

    function dragEnd() {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = 'grab';
      wrapper.style.zIndex = '';
    }

    if (window.PointerEvent) {
      handle.style.touchAction = 'none';
      handle.addEventListener('pointerdown', dragStart);
      window.addEventListener('pointermove', dragMove);
      window.addEventListener('pointerup', dragEnd);
      window.addEventListener('pointercancel', dragEnd);
    } else {
      handle.addEventListener('mousedown', dragStart);
      handle.addEventListener('touchstart', dragStart, { passive: false });
      window.addEventListener('mousemove', dragMove);
      window.addEventListener('touchmove', dragMove, { passive: false });
      window.addEventListener('mouseup', dragEnd);
      window.addEventListener('touchend', dragEnd);
      window.addEventListener('touchcancel', dragEnd);
    }
  }

  // Position the style toolbar near the focused textarea
  function updateStylePosition() {
    if (!focusedTextarea) return hideStyleControls();

    const wrapper = focusedTextarea.parentElement;
    if (wrapper.classList.contains('locked')) return hideStyleControls();

    const containerRect = container.getBoundingClientRect();
    const textareaRect = focusedTextarea.getBoundingClientRect();

    let top = textareaRect.top - containerRect.top + container.scrollTop - styleControls.offsetHeight - 8;
    let left = textareaRect.left - containerRect.left + container.scrollLeft;

    if (top < container.scrollTop) top = textareaRect.bottom - containerRect.top + 8 + container.scrollTop;
    if (left + styleControls.offsetWidth > container.scrollLeft + container.clientWidth) {
      left = container.scrollLeft + container.clientWidth - styleControls.offsetWidth - 8;
    }
    if (left < container.scrollLeft) left = container.scrollLeft + 8;

    styleControls.style.top = top + 'px';
    styleControls.style.left = left + 'px';

    styleControls.classList.add('visible');
    styleControls.setAttribute('aria-hidden', 'false');

    boldBtn.classList.toggle('active', focusedTextarea.style.fontWeight === 'bold');
    boldBtn.setAttribute('aria-pressed', focusedTextarea.style.fontWeight === 'bold');

    italicBtn.classList.toggle('active', focusedTextarea.style.fontStyle === 'italic');
    italicBtn.setAttribute('aria-pressed', focusedTextarea.style.fontStyle === 'italic');

    fontSize.value = focusedTextarea.style.fontSize || '16px';
    fontFamily.value = focusedTextarea.style.fontFamily || 'Arial, sans-serif';
    fontColor.value = rgbToHex(focusedTextarea.style.color);
  }

  // Hide style toolbar
  function hideStyleControls() {
    styleControls.classList.remove('visible');
    styleControls.setAttribute('aria-hidden', 'true');
  }

  // Capture current editor state (image + textboxes)
  function captureState() {
    const textboxes = [];
    zoomableContent.querySelectorAll('.textbox-wrapper').forEach(wrapper => {
      const ta = wrapper.querySelector('textarea');
      textboxes.push({
        top: wrapper.style.top || '10px',
        left: wrapper.style.left || '10px',
        width: ta.style.width || '200px',
        height: ta.style.height || '60px',
        value: ta.value,
        fontWeight: ta.style.fontWeight,
        fontStyle: ta.style.fontStyle,
        fontSize: ta.style.fontSize,
        fontFamily: ta.style.fontFamily,
        color: ta.style.color,
        locked: wrapper.classList.contains('locked')
      });
    });
    return {
      imageSrc: imageElement ? imageElement.src : null,
      textboxes
    };
  }

  // Restore editor state (loads image and textboxes)
  function restoreState(state) {
    if (!state || !state.imageSrc) return;
    zoomableContent.innerHTML = '';
    imageElement = new Image();
    imageElement.src = state.imageSrc;
    imageElement.draggable = false;
    imageElement.style.userSelect = 'none';
    imageElement.style.position = 'relative';
    imageElement.style.maxWidth = '100%';
    imageElement.style.height = 'auto';
    imageElement.onload = () => {
      zoomableContent.appendChild(imageElement);
      showControls();
      for (const tb of state.textboxes) {
        const box = createTextbox(tb.value, tb.top, tb.left, {
          fontWeight: tb.fontWeight,
          fontStyle: tb.fontStyle,
          fontSize: tb.fontSize,
          fontFamily: tb.fontFamily,
          color: tb.color,
        });
        if (tb.locked) {
          const lockBtn = box.querySelector('.textbox-buttons button:nth-child(2)');
          toggleLock(box, lockBtn, box.querySelector('textarea'), box.querySelector('.drag-handle'));
        }
        zoomableContent.appendChild(box);
      }
    };
  }

  // Show editor controls
  function showControls() {
    controls.style.display = 'flex';
    clearAllBtn.style.display = 'inline-block';
    toggleSavedBtn.style.display = 'inline-block';
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
    saveBtn.disabled = templateName.value.trim() === '' || !imageElement;
  }

  // Exporting functions:

  // Draw image and textboxes to canvas and pass blob to callback
  function exportCanvas(callback, mimeType = 'image/png') {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imageRect = imageElement.getBoundingClientRect();
    const zoomRect = zoomableContent.getBoundingClientRect();
    const scaleX = canvas.width / imageRect.width;
    const scaleY = canvas.height / imageRect.height;

    zoomableContent.querySelectorAll('.textbox-wrapper').forEach(wrapper => {
      const textarea = wrapper.querySelector('textarea');
      if (wrapper.classList.contains('locked')) return;

      const style = window.getComputedStyle(textarea);
      const fontSize = parseInt(style.fontSize);
      const fontFamily = style.fontFamily;
      const fontWeight = style.fontWeight;
      const fontStyle = style.fontStyle;
      const color = style.color || '#000';

      const x = ((parseFloat(wrapper.style.left) + zoomRect.left - imageRect.left) * scaleX);
      const y = ((parseFloat(wrapper.style.top) + zoomRect.top - imageRect.top) * scaleY);

      ctx.fillStyle = color;
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize * scaleX}px ${fontFamily}`;
      ctx.textBaseline = 'top';

      const lines = textarea.value.split('\n');
      const lineHeight = fontSize * 1.2 * scaleY;
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight);
      });
    });

    canvas.toBlob(callback, mimeType, 0.95);
  }

  // Export as PNG or JPEG
  function exportImage(format) {
    exportCanvas(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `image.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, format === 'jpeg' ? 'image/jpeg' : 'image/png');
  }

  // Export as PDF by opening print popup with the image
  function exportPdf() {
    exportCanvas(blob => {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return alert('Popup blocked. Please allow popups to export PDF.');
      printWindow.document.write(`
        <html>
          <head>
            <title>Export as PDF</title>
            <style>body,html{margin:0;padding:0;height:100%;}img{max-width:100%;height:auto;display:block;margin:0 auto;}@media print{body{margin:0;}img{max-width:100%;height:auto;}}</style>
          </head>
          <body>
            <img src="${url}" alt="Exported PDF Image" />
            <script>window.onload=()=>{window.focus();window.print();window.close();}<\/script>
          </body>
        </html>`);
      printWindow.document.close();
    }, 'image/png');
  }

  // Download button handler opens export popup
  downloadBtn.addEventListener('click', () => {
    downloadPopup.classList.add('show');
    downloadPopup.focus();
  });

  cancelDownload.addEventListener('click', () => {
    downloadPopup.classList.remove('show');
  });

  confirmDownload.addEventListener('click', () => {
    const selected = downloadPopup.querySelector('input[name="exportFormat"]:checked');
    if (!selected) {
      alert('Please select an export format.');
      return;
    }
    downloadPopup.classList.remove('show');
    if (selected.value === 'pdf') exportPdf();
    else exportImage(selected.value);
  });

  // Share button functionality using Web Share API with fallback to download
  shareBtn.addEventListener('click', () => {
    if (!imageElement) {
      alert('Please upload or load an image first.');
      return;
    }
    exportCanvas(blob => {
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'image.jpeg', { type: 'image/jpeg' })] })) {
        navigator.share({
          files: [new File([blob], 'image.jpeg', { type: 'image/jpeg' })],
          title: 'Shared Image',
          text: 'Check out this image!'
        }).catch(() => alert('Sharing failed or cancelled.'));
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'image.jpeg';
        document.body.appendChild(link);
        link.click();
        link.remove();
        alert('Sharing not supported; image downloaded instead.');
      }
    }, 'image/jpeg');
  });

  // Initialize
  loadTemplates();
  saveBtn.disabled = true;
  controls.style.display = 'none';
  clearAllBtn.style.display = 'none';

  // Show controls helper once image is loaded or template restored
  function showControls() {
    controls.style.display = 'flex';
    clearAllBtn.style.display = 'inline-block';
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
    saveBtn.disabled = templateName.value.trim() === '' || !imageElement;
    toggleSavedBtn.style.display = 'inline-block';
  }

})();
