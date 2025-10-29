const fs = require('fs');

function pngSize(p) {
  try {
    const b = fs.readFileSync(p);
    if (b.length < 24) return null;
    const sig = '89504e470d0a1a0a';
    if (b.slice(0, 8).toString('hex') !== sig) return null;
    const w = b.readUInt32BE(16);
    const h = b.readUInt32BE(20);
    return { w, h };
  } catch (e) {
    return null;
  }
}

const files = process.argv.slice(2);
for (const f of files) {
  const s = pngSize(f);
  if (!s) {
    console.log(`${f}: not found or invalid PNG`);
  } else {
    console.log(`${f}: ${s.w}x${s.h} ${s.w === s.h ? 'square' : 'not-square'}`);
  }
}
