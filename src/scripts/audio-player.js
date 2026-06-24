import WaveSurfer from 'wavesurfer.js';

const WAVE_OPTIONS = {
  waveColor: 'rgba(82, 193, 209, 0.4)',
  progressColor: '#e252a2',
  height: 48,
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
};

// Registry of all card states — used for global playback exclusivity
const players = new Map();

export function initAudioPlayers() {
  document.querySelectorAll('.listen-card').forEach(initCard);
}

function initCard(card) {
  const tracks = JSON.parse(card.dataset.tracks || '[]');
  if (!tracks.length) return;

  const state = {
    tracks,
    activeTrackIndex: 0,
    activeMix: 'rough',
    wsRough: null,
    wsFinal: null,
    roughReady: false,
    finalReady: false,
    pendingOnReady: null,
    silenceTimer: null,
    silenceStartMs: null,
    rafId: null,
    loaded: false,
  };
  players.set(card, state);

  const els = buildCardEls(card);

  function ensureLoaded(trackIndex = 0, autoplay = false) {
    if (state.loaded) return;
    state.loaded = true;
    loadTrackPair(card, state, trackIndex, 'rough', autoplay, 0, els);
  }

  card.querySelectorAll('.listen-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.trackIndex, 10);
      if (!state.loaded) {
        ensureLoaded(idx);
        return;
      }
      if (idx === state.activeTrackIndex) return;
      const wasPlaying = isCardPlaying(state);
      clearSilenceTimer(state);
      destroyPair(state);
      loadTrackPair(card, state, idx, state.activeMix, wasPlaying, 0, els);
    });
  });

  card.querySelectorAll('.mix-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      ensureLoaded();
      const newMix = btn.dataset.mix;
      if (newMix === state.activeMix) return;
      switchMix(card, state, newMix, els);
    });
  });

  els.playBtn.addEventListener('click', () => {
    if (!state.loaded) {
      ensureLoaded(0, true);
      return;
    }
    handlePlayClick(card, state, els);
  });
}

function buildCardEls(card) {
  const waveformEl = card.querySelector('.listen-waveform');
  const roughEl = document.createElement('div');
  const finalEl = document.createElement('div');
  finalEl.hidden = true;
  waveformEl.appendChild(roughEl);
  waveformEl.appendChild(finalEl);
  return {
    roughWaveformEl: roughEl,
    finalWaveformEl: finalEl,
    playBtn: card.querySelector('.listen-play-btn'),
    timeCurrentEl: card.querySelector('.listen-time__current'),
    timeTotalEl: card.querySelector('.listen-time__total'),
    trackTitleEl: card.querySelector('.listen-track-title'),
  };
}

function loadTrackPair(card, state, trackIndex, startMix, autoplay, seekPlayerTime, els) {
  const track = state.tracks[trackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;

  state.activeTrackIndex = trackIndex;
  state.activeMix = startMix;

  updateTabUI(card, trackIndex);
  updateToggleUI(card, startMix);
  if (els.trackTitleEl) els.trackTitleEl.textContent = track.title;
  if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
  if (els.timeTotalEl) els.timeTotalEl.textContent = '0:00';

  els.roughWaveformEl.hidden = (startMix !== 'rough');
  els.finalWaveformEl.hidden = (startMix !== 'final');

  // Compute initial file seek positions from player time
  const roughSeek = seekPlayerTime === 0 && offset_s < 0
    ? Math.abs(offset_s)
    : Math.max(0, seekPlayerTime - offset_s);
  const finalSeek = Math.max(0, seekPlayerTime);

  // --- Rough instance ---
  const wsRough = WaveSurfer.create({ container: els.roughWaveformEl, url: track.roughUrl, ...WAVE_OPTIONS });
  state.wsRough = wsRough;

  wsRough.on('ready', () => {
    state.roughReady = true;
    const dur = wsRough.getDuration();
    if (state.activeMix === 'rough') {
      if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(dur);
      if (state.pendingOnReady) {
        const action = state.pendingOnReady;
        state.pendingOnReady = null;
        action();
      } else {
        if (roughSeek > 0) wsRough.setTime(Math.min(roughSeek, dur));
        if (autoplay) {
          if (offset_s > 0 && seekPlayerTime === 0) {
            startSilenceZone(card, state, els, offset_s, 0);
          } else {
            wsRough.play();
          }
        }
      }
    } else {
      if (roughSeek > 0) wsRough.setTime(Math.min(roughSeek, dur));
    }
  });

  wsRough.on('timeupdate', (t) => {
    if (state.activeMix !== 'rough' || state.silenceStartMs !== null) return;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(Math.max(0, t + offset_s));
  });

  wsRough.on('play', () => { updatePlayBtn(card, true); pauseOtherCards(card); });
  wsRough.on('pause', () => { if (!state.wsFinal?.isPlaying() && !state.silenceTimer) updatePlayBtn(card, false); });
  wsRough.on('finish', () => {
    if (state.activeMix === 'rough') {
      updatePlayBtn(card, false);
      clearSilenceTimer(state);
      if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
    }
  });

  // --- Final instance ---
  const wsFinal = WaveSurfer.create({ container: els.finalWaveformEl, url: track.finalUrl, ...WAVE_OPTIONS });
  state.wsFinal = wsFinal;

  wsFinal.on('ready', () => {
    state.finalReady = true;
    const dur = wsFinal.getDuration();
    if (state.activeMix === 'final') {
      if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(dur);
      if (state.pendingOnReady) {
        const action = state.pendingOnReady;
        state.pendingOnReady = null;
        action();
      } else {
        if (finalSeek > 0) wsFinal.setTime(Math.min(finalSeek, dur));
        if (autoplay) wsFinal.play();
      }
    } else {
      if (finalSeek > 0) wsFinal.setTime(Math.min(finalSeek, dur));
    }
  });

  wsFinal.on('timeupdate', (t) => {
    if (state.activeMix !== 'final') return;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(t);
  });

  wsFinal.on('play', () => { updatePlayBtn(card, true); pauseOtherCards(card); });
  wsFinal.on('pause', () => { if (!state.wsRough?.isPlaying() && !state.silenceTimer) updatePlayBtn(card, false); });
  wsFinal.on('finish', () => {
    if (state.activeMix === 'final') {
      updatePlayBtn(card, false);
      if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
    }
  });
}

function switchMix(card, state, newMix, els) {
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;
  const wasPlaying = isCardPlaying(state);
  const playerTime = getPlayerTime(state);

  clearSilenceTimer(state);

  // Pause the outgoing mix
  const outgoing = newMix === 'rough' ? state.wsFinal : state.wsRough;
  if (outgoing?.isPlaying()) outgoing.pause();

  state.activeMix = newMix;
  updateToggleUI(card, newMix);

  // Swap waveform visibility
  els.roughWaveformEl.hidden = (newMix !== 'rough');
  els.finalWaveformEl.hidden = (newMix !== 'final');

  const incoming = newMix === 'rough' ? state.wsRough : state.wsFinal;
  const isReady = newMix === 'rough' ? state.roughReady : state.finalReady;
  const targetFileTime = newMix === 'rough'
    ? Math.max(0, playerTime - offset_s)
    : Math.max(0, playerTime);

  if (isReady && incoming) {
    state.pendingOnReady = null;
    incoming.setTime(Math.min(targetFileTime, incoming.getDuration()));
    if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(incoming.getDuration());
    if (wasPlaying) {
      if (newMix === 'rough' && offset_s > 0 && playerTime < offset_s) {
        startSilenceZone(card, state, els, offset_s, playerTime);
      } else {
        incoming.play();
      }
    } else {
      const displayTime = newMix === 'rough'
        ? formatTime(Math.max(0, targetFileTime + offset_s))
        : formatTime(targetFileTime);
      if (els.timeCurrentEl) els.timeCurrentEl.textContent = displayTime;
    }
  } else {
    // Incoming not ready yet — defer seek + play until its ready event fires
    const capturedPlayerTime = playerTime;
    const capturedWasPlaying = wasPlaying;
    state.pendingOnReady = () => {
      const ws = newMix === 'rough' ? state.wsRough : state.wsFinal;
      if (!ws) return;
      ws.setTime(Math.min(targetFileTime, ws.getDuration()));
      if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(ws.getDuration());
      if (capturedWasPlaying) {
        if (newMix === 'rough' && offset_s > 0 && capturedPlayerTime < offset_s) {
          startSilenceZone(card, state, els, offset_s, capturedPlayerTime);
        } else {
          ws.play();
        }
      } else {
        const displayTime = newMix === 'rough'
          ? formatTime(Math.max(0, targetFileTime + offset_s))
          : formatTime(targetFileTime);
        if (els.timeCurrentEl) els.timeCurrentEl.textContent = displayTime;
      }
    };
  }
}

function handlePlayClick(card, state, els) {
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;
  const ws = activeWs(state);
  if (!ws) return;

  if (state.silenceTimer !== null) {
    clearSilenceTimer(state);
    updatePlayBtn(card, false);
    return;
  }

  if (ws.isPlaying()) {
    ws.pause();
    return;
  }

  if (state.activeMix === 'rough' && offset_s > 0 && ws.getCurrentTime() === 0) {
    startSilenceZone(card, state, els, offset_s, 0);
  } else {
    pauseOtherCards(card);
    ws.play();
  }
}

function startSilenceZone(card, state, els, offset_s, startPlayerTime = 0) {
  state.silenceStartMs = performance.now() - startPlayerTime * 1000;
  pauseOtherCards(card);
  updatePlayBtn(card, true);

  function tick() {
    if (state.silenceStartMs === null) return;
    const elapsed = (performance.now() - state.silenceStartMs) / 1000;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(elapsed);
    state.rafId = requestAnimationFrame(tick);
  }
  state.rafId = requestAnimationFrame(tick);

  state.silenceTimer = setTimeout(() => {
    state.silenceStartMs = null;
    state.silenceTimer = null;
    if (state.rafId !== null) { cancelAnimationFrame(state.rafId); state.rafId = null; }
    activeWs(state)?.play();
  }, (offset_s - startPlayerTime) * 1000);
}

function clearSilenceTimer(state) {
  if (state.silenceTimer !== null) { clearTimeout(state.silenceTimer); state.silenceTimer = null; }
  if (state.rafId !== null) { cancelAnimationFrame(state.rafId); state.rafId = null; }
  state.silenceStartMs = null;
}

function destroyPair(state) {
  if (state.wsRough) { state.wsRough.destroy(); state.wsRough = null; }
  if (state.wsFinal) { state.wsFinal.destroy(); state.wsFinal = null; }
  state.roughReady = false;
  state.finalReady = false;
  state.pendingOnReady = null;
}

function activeWs(state) {
  return state.activeMix === 'rough' ? state.wsRough : state.wsFinal;
}

function isCardPlaying(state) {
  return (activeWs(state)?.isPlaying() ?? false) || state.silenceTimer !== null;
}

function getPlayerTime(state) {
  if (state.silenceStartMs !== null) return (performance.now() - state.silenceStartMs) / 1000;
  const ws = activeWs(state);
  if (!ws) return 0;
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;
  return state.activeMix === 'rough'
    ? Math.max(0, ws.getCurrentTime() + offset_s)
    : ws.getCurrentTime();
}

function pauseOtherCards(activeCard) {
  players.forEach((state, card) => {
    if (card === activeCard) return;
    clearSilenceTimer(state);
    activeWs(state)?.isPlaying() && activeWs(state).pause();
  });
}

function updateTabUI(card, activeIndex) {
  const panel = card.querySelector('[role="tabpanel"]');
  card.querySelectorAll('.listen-tab').forEach((tab, i) => {
    const isActive = i === activeIndex;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
    if (isActive && panel && tab.id) panel.setAttribute('aria-labelledby', tab.id);
  });
}

function updateToggleUI(card, mix) {
  card.querySelectorAll('.mix-toggle__btn').forEach((btn) => {
    const isActive = btn.dataset.mix === mix;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function updatePlayBtn(card, isPlaying) {
  const btn = card.querySelector('.listen-play-btn');
  const use = btn?.querySelector('use');
  if (use) use.setAttribute('href', isPlaying ? '/icons.svg#icon-pause' : '/icons.svg#icon-play');
  if (btn) btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}
