import { describe, it, expect, vi } from 'vitest';
import {
  connectGain,
  disconnectAudioNodes,
  gainToVolume,
  formatTime,
  playerTimeToFileTime,
  fileTimeToPlayerTime,
} from './audio-player.js';

describe('gainToVolume', () => {
  it('returns unity (1.0) for 0 dB', () => {
    expect(gainToVolume(0)).toBeCloseTo(1.0);
  });

  it('returns unity for missing/non-numeric gain', () => {
    expect(gainToVolume(undefined)).toBeCloseTo(1.0);
    expect(gainToVolume(null)).toBeCloseTo(1.0);
    expect(gainToVolume('loud')).toBeCloseTo(1.0);
    expect(gainToVolume(NaN)).toBeCloseTo(1.0);
  });

  it('converts negative dB values correctly', () => {
    expect(gainToVolume(-6)).toBeCloseTo(0.501, 2);
  });

  it('returns linear gain above 1.0 for positive dB (Web Audio GainNode range)', () => {
    expect(gainToVolume(6)).toBeCloseTo(1.995, 2);
    expect(gainToVolume(12)).toBeCloseTo(3.981, 2);
  });

  it('clamps dB input above +12 to the +12 dB ceiling', () => {
    expect(gainToVolume(100)).toBeCloseTo(gainToVolume(12), 5);
    expect(gainToVolume(13)).toBeCloseTo(gainToVolume(12), 5);
  });

  it('clamps values below -60 dB to the min', () => {
    expect(gainToVolume(-100)).toBeCloseTo(gainToVolume(-60));
    expect(gainToVolume(-61)).toBeCloseTo(gainToVolume(-60));
  });
});

describe('Web Audio node lifecycle', () => {
  it('disconnects both the source and gain nodes for cleanup', () => {
    const source = { connect: vi.fn(), disconnect: vi.fn() };
    const gainNode = { connect: vi.fn(), disconnect: vi.fn(), gain: { value: 0 } };
    class MockAudioContext {
      constructor() {
        this.state = 'running';
        this.destination = {};
      }
      createMediaElementSource() {
        return source;
      }
      createGain() {
        return gainNode;
      }
    }

    vi.stubGlobal('AudioContext', MockAudioContext);

    const ws = {
      getMediaElement: vi.fn(() => ({})),
      setVolume: vi.fn(),
    };

    const audioNodes = connectGain(ws, 1.5);

    expect(audioNodes).toEqual({ source, gainNode });
    expect(source.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledOnce();
    expect(gainNode.gain.value).toBe(1.5);

    expect(disconnectAudioNodes(audioNodes)).toBeNull();
    expect(source.disconnect).toHaveBeenCalledOnce();
    expect(gainNode.disconnect).toHaveBeenCalledOnce();

    vi.unstubAllGlobals();
  });
});

describe('formatTime', () => {
  it('formats zero as 0:00', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('zero-pads seconds below 10', () => {
    expect(formatTime(9)).toBe('0:09');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(599)).toBe('9:59');
  });

  it('floors fractional seconds rather than rounding', () => {
    expect(formatTime(65.9)).toBe('1:05');
  });

  it('clamps negative values to 0:00', () => {
    expect(formatTime(-5)).toBe('0:00');
  });

  it('does not roll over at 60 minutes', () => {
    expect(formatTime(3600)).toBe('60:00');
  });
});

describe('playerTimeToFileTime', () => {
  it('subtracts a positive offset (silence zone before rough starts)', () => {
    expect(playerTimeToFileTime(10, 2)).toBe(8);
  });

  it('clamps to 0 when player time is less than offset', () => {
    expect(playerTimeToFileTime(1, 3)).toBe(0);
    expect(playerTimeToFileTime(0, 2)).toBe(0);
  });

  it('adds the magnitude of a negative offset (rough starts before player time 0)', () => {
    expect(playerTimeToFileTime(0, -2)).toBe(2);
    expect(playerTimeToFileTime(5, -2)).toBe(7);
  });

  it('is a no-op with zero offset', () => {
    expect(playerTimeToFileTime(5, 0)).toBe(5);
    expect(playerTimeToFileTime(0, 0)).toBe(0);
  });
});

describe('fileTimeToPlayerTime', () => {
  it('adds a positive offset to get player time', () => {
    expect(fileTimeToPlayerTime(8, 2)).toBe(10);
  });

  it('subtracts the magnitude of a negative offset', () => {
    expect(fileTimeToPlayerTime(2, -2)).toBe(0);
  });

  it('clamps to 0 when file time is before player time 0', () => {
    expect(fileTimeToPlayerTime(0, -3)).toBe(0);
    expect(fileTimeToPlayerTime(1, -3)).toBe(0);
  });

  it('is the inverse of playerTimeToFileTime for valid inputs', () => {
    const offset = 2.5;
    const playerTime = 10;
    const fileTime = playerTimeToFileTime(playerTime, offset);
    expect(fileTimeToPlayerTime(fileTime, offset)).toBe(playerTime);
  });

  it('is a no-op with zero offset', () => {
    expect(fileTimeToPlayerTime(5, 0)).toBe(5);
  });
});
