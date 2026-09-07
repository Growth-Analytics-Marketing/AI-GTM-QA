// djb2 hash used to compare a GTM tag's saved Custom HTML with the draft in gtm-fixes/.
// Node:     node tag-hash.js gtm-fixes/320-search.html
// Browser (on the GTM tag page): const c=document.querySelectorAll('.CodeMirror'); h(c[c.length-1].CodeMirror.getValue().trim())
function h(s){ let x=5381; for (const c of s) { x=((x<<5)+x+c.charCodeAt(0))|0; } return x; }
if (typeof require !== 'undefined' && require.main === module) { const fs=require('fs'); for (const f of process.argv.slice(2)) console.log(f, h(fs.readFileSync(f,'utf8').trim())); }
