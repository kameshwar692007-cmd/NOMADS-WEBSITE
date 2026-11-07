import fs from 'fs';

let content = fs.readFileSync('src/GamifiedPages.css', 'utf8');
const searchStr = `.province-explore-intro.scroll-reveal {
  transition-duration: .55s;
}
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal, .scroll-reveal.revealed {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;

}

/* ==========================================================================`;

// Normalize \r\n to \n for replacement then save
const normalized = content.replace(/\r\n/g, '\n');
const fixed = normalized.replace(
`@media (prefers-reduced-motion: reduce) {
  .scroll-reveal, .scroll-reveal.revealed {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;

}

/* ==========================================================================`,
`@media (prefers-reduced-motion: reduce) {
  .scroll-reveal, .scroll-reveal.revealed {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
  }
}

/* ==========================================================================`
);

if (fixed === normalized) {
  console.error('Replacement failed: search pattern not found!');
  process.exit(1);
}

fs.writeFileSync('src/GamifiedPages.css', fixed, 'utf8');
console.log('Successfully fixed missing brace in GamifiedPages.css!');
