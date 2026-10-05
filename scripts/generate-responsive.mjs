import { writeFileSync } from 'node:fs';
import { responsiveStyles } from '../src/ui/responsive.ts';
writeFileSync('src/ui/responsive.css', `/* Generated from display.ts and responsive.ts; regenerate with node --import tsx scripts/generate-responsive.mjs. */\n${responsiveStyles()}\n`);
