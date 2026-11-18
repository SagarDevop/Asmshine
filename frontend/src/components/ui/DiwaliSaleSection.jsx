import React from 'react';
import { TrendingNowBanner } from './TrendingNowBanner';

/**
 * Backward-compatible wrapper: Legacy DiwaliSaleSection now cleanly delegates
 * to the new ASM Shine "Trending Now" promotional banner.
 */
export const DiwaliSaleSection = (props) => {
  return <TrendingNowBanner {...props} />;
};

export default DiwaliSaleSection;
