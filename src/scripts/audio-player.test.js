import { describe, it, expect } from 'vitest';
import { gainToVolume } from './audio-player.js';

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

  it('converts valid dB values correctly', () => {
    expect(gainToVolume(-6)).toBeCloseTo(0.501, 2);
    expect(gainToVolume(6)).toBeCloseTo(1.995, 2);
    expect(gainToVolume(12)).toBeCloseTo(3.981, 2);
  });

  it('clamps values above +12 dB to the max', () => {
    expect(gainToVolume(100)).toBeCloseTo(gainToVolume(12));
    expect(gainToVolume(13)).toBeCloseTo(gainToVolume(12));
  });

  it('clamps values below -60 dB to the min', () => {
    expect(gainToVolume(-100)).toBeCloseTo(gainToVolume(-60));
    expect(gainToVolume(-61)).toBeCloseTo(gainToVolume(-60));
  });
});
