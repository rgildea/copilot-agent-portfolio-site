import WaveSurfer from 'wavesurfer.js';

const WAVE_COLOR = 'rgba(82, 193, 209, 0.4)';
const PROGRESS_COLOR = '#e252a2';
const WAVEFORM_HEIGHT = 48;

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
    ws: null,
    silenceTimer: null,
    silenceStartMs: null,
    rafId: null,
  };
  players.set(card, state);

  const els = getCardEls(card);

  card.querySelectorAll('.listen-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.trackIndex, 10);
      if (idx === state.activeTrackIndex) return;
      const wasPlaying = isCardPlaying(state);
      clearSilenceTimer(state);
      loadTrack(card, state, idx, state.activeMix, wasPlaying, 0, els);
    });
  });

  card.querySelectorAll('.mix-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newMix = btn.dataset.mix;
      if (newMix === state.activeMix) return;
      const wasPlaying = isCardPlaying(state);
      const playerTime = getPlayerTime(state);
      const track = tracks[state.activeTrackIndex];
      const offset_s = (track.roughOffset || 0) / 1000;
      let targetFileTime;
      if (newMix === 'rough') {
        // final → rough: T_rough = T_player - offset_s
        targetFileTime = Math.max(0, playerTime - offset_s);
      } else {
        // rough → final: final file position = player time directly
        targetFileTime = Math.max(0, playerTime);
      }
      clearSilenceTimer(state);
      loadTrack(card, state, state.activeTrackIndex, newMix, wasPlaying, targetFileTime, els);
    });
  });

  els.playBtn.addEventListener('click', () => handlePlayClick(card, state, els));

  loadTrack(card, state, 0, 'rough', false, 0, els);
}

function loadTrack(card, state, trackIndex, mix, autoplay, seekToFileTime, els) {
  clearSilenceTimer(state);
  if (state.ws) {
    state.ws.destroy();
    state.ws = null;
  }

  const track = state.tracks[trackIndex];
  const url = mix === 'rough' ? track.roughUrl : track.finalUrl;
  const offset_s = (track.roughOffset || 0) / 1000;

  state.activeTrackIndex = trackIndex;
  state.activeMix = mix;

  updateTabUI(card, trackIndex);
  updateToggleUI(card, mix);
  if (els.trackTitleEl) els.trackTitleEl.textContent = track.title;
  if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
  if (els.timeTotalEl) els.timeTotalEl.textContent = '0:00';

  const ws = WaveSurfer.create({
    container: els.waveformEl,
    waveColor: WAVE_COLOR,
    progressColor: PROGRESS_COLOR,
    height: WAVEFORM_HEIGHT,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    url,
  });
  state.ws = ws;

  ws.on('ready', () => {
    const duration = ws.getDuration();
    if (els.timeTotalEl) els.timeTotalEl.textContent = formatTime(duration);

    // Determine initial seek position in file time
    let initialFileTime = seekToFileTime;
    if (seekToFileTime === 0 && mix === 'rough' && offset_s < 0) {
      // Negative offset: rough file starts at |offset_s| when player is at 0
      initialFileTime = Math.abs(offset_s);
    }
    if (initialFileTime > 0) {
      ws.setTime(Math.min(initialFileTime, duration));
    }

    if (autoplay) {
      if (mix === 'rough' && offset_s > 0 && seekToFileTime === 0) {
        // Positive offset starting from player time 0: apply silence zone
        startSilenceZone(card, state, els, offset_s);
      } else {
        ws.play();
      }
    }
  });

  ws.on('timeupdate', (currentTime) => {
    if (state.silenceStartMs !== null) return; // silence zone RAF handles display
    const displayTime = mix === 'rough'
      ? Math.max(0, currentTime + offset_s)
      : currentTime;
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = formatTime(displayTime);
  });

  ws.on('play', () => {
    updatePlayBtn(card, true);
    pauseOtherCards(card);
  });

  ws.on('pause', () => updatePlayBtn(card, false));

  ws.on('finish', () => {
    updatePlayBtn(card, false);
    clearSilenceTimer(state);
    if (els.timeCurrentEl) els.timeCurrentEl.textContent = '0:00';
  });
}

function handlePlayClick(card, state, els) {
  if (!state.ws) return;
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;

  // Pause if silence zone is counting down
  if (state.silenceTimer !== null) {
    clearSilenceTimer(state);
    updatePlayBtn(card, false);
    return;
  }

  if (state.ws.isPlaying()) {
    state.ws.pause();
    return;
  }

  // Positive offset + rough mix + at file position 0 = silence zone
  if (state.activeMix === 'rough' && offset_s > 0 && state.ws.getCurrentTime() === 0) {
    startSilenceZone(card, state, els, offset_s);
  } else {
    pauseOtherCards(card);
    state.ws.play();
  }
}

function startSilenceZone(card, state, els, offset_s) {
  state.silenceStartMs = performance.now();
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
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.ws) state.ws.play();
  }, offset_s * 1000);
}

function clearSilenceTimer(state) {
  if (state.silenceTimer !== null) {
    clearTimeout(state.silenceTimer);
    state.silenceTimer = null;
  }
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  state.silenceStartMs = null;
}

function isCardPlaying(state) {
  return (state.ws !== null && state.ws.isPlaying()) || state.silenceTimer !== null;
}

function getPlayerTime(state) {
  if (state.silenceStartMs !== null) {
    return (performance.now() - state.silenceStartMs) / 1000;
  }
  if (!state.ws) return 0;
  const track = state.tracks[state.activeTrackIndex];
  const offset_s = (track.roughOffset || 0) / 1000;
  return state.activeMix === 'rough'
    ? Math.max(0, state.ws.getCurrentTime() + offset_s)
    : state.ws.getCurrentTime();
}

function pauseOtherCards(activeCard) {
  players.forEach((state, card) => {
    if (card === activeCard) return;
    clearSilenceTimer(state);
    if (state.ws && state.ws.isPlaying()) state.ws.pause();
  });
}

function updateTabUI(card, activeIndex) {
  card.querySelectorAll('.listen-tab').forEach((tab, i) => {
    const isActive = i === activeIndex;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
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
  const icon = btn?.querySelector('i');
  if (icon) icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  if (btn) btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

function getCardEls(card) {
  return {
    waveformEl: card.querySelector('.listen-waveform'),
    playBtn: card.querySelector('.listen-play-btn'),
    timeCurrentEl: card.querySelector('.listen-time__current'),
    timeTotalEl: card.querySelector('.listen-time__total'),
    trackTitleEl: card.querySelector('.listen-track-title'),
  };
}

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
