// Asset Verifier & Image Loading Health Test Suite
import { TILE_DEFINITIONS } from './tileDefinitions';

export async function verifyAllAssets(onProgress = () => {}) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    items: [],
    startTime: performance.now(),
    durationMs: 0
  };

  const assetList = [
    {
      id: 'sheet-packed',
      type: 'Spritesheet (Packed)',
      name: 'tilemap_packed.png',
      url: '/assets/game/Tilemap/tilemap_packed.png',
      expectedWidth: 192,
      expectedHeight: 176
    },
    {
      id: 'sheet-spaced',
      type: 'Spritesheet (Spaced)',
      name: 'tilemap.png',
      url: '/assets/game/Tilemap/tilemap.png',
      expectedWidth: 203,
      expectedHeight: 186
    },
    {
      id: 'preview-image',
      type: 'Showcase Preview',
      name: 'Preview.png',
      url: '/assets/game/Preview.png',
      expectedWidth: 918,
      expectedHeight: 515
    },
    ...TILE_DEFINITIONS.map(tile => ({
      id: `tile-${tile.id}`,
      type: `Tile #${tile.id}`,
      name: tile.file,
      url: `/assets/game/Tiles/${tile.file}`,
      expectedWidth: 16,
      expectedHeight: 16,
      metadata: tile
    }))
  ];

  results.total = assetList.length;

  const testImage = (item) => {
    return new Promise((resolve) => {
      const img = new Image();
      const start = performance.now();

      img.onload = () => {
        const itemResult = {
          ...item,
          status: 'success',
          actualWidth: img.naturalWidth,
          actualHeight: img.naturalHeight,
          durationMs: Math.round(performance.now() - start),
          imageElement: img
        };
        resolve(itemResult);
      };

      img.onerror = () => {
        const itemResult = {
          ...item,
          status: 'error',
          error: 'Failed to load image',
          durationMs: Math.round(performance.now() - start)
        };
        resolve(itemResult);
      };

      img.src = item.url;
    });
  };

  // Run in chunks for smooth UI updates
  const chunkSize = 16;
  for (let i = 0; i < assetList.length; i += chunkSize) {
    const chunk = assetList.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(testImage));
    
    chunkResults.forEach(res => {
      if (res.status === 'success') {
        results.passed++;
      } else {
        results.failed++;
      }
      results.items.push(res);
    });

    onProgress({
      completed: results.items.length,
      total: results.total,
      percent: Math.round((results.items.length / results.total) * 100)
    });
  }

  results.durationMs = Math.round(performance.now() - results.startTime);
  return results;
}
