import type { SourceReference } from '../../types';

export const LENNOX_SOURCES = {
  modernStandard: [
    {
      name: 'Building Intelligence Center: Lennox HVAC Age',
      url: 'https://www.building-center.org/lennox-hvac-age/',
      confidence: 'verified',
    },
    {
      name: 'Inspector Handbook: Lennox Serial Numbers',
      confidence: 'verified',
    },
  ] as SourceReference[],
};
