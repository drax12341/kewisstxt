(()=>{
  const by=id=>document.getElementById(id),assetQuery=new URL(document.currentScript.src).search;
  by('apple-preview-toggle').addEventListener('click',e=>{const button=e.currentTarget,on=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(on));by('apple-study').src='assets/golden_apple'+(on?'':'-original')+'.png';by('apple-study').alt=on?'Black obsidian golden apple':'Original golden apple';});
  by('bow-stage').addEventListener('input',e=>{const stage=Number(e.target.value);by('bow-study').src=`assets/bow_pulling_${stage}.png${assetQuery}`;by('bow-stage-label').value=['Low / original arrow','Medium / original arrow','Full / original arrow'][stage];by('bow-study').alt=['Original Minecraft bow at low draw','Original Minecraft bow at medium draw','Original Minecraft bow at full draw'][stage];});
  by('block-preview-toggle').addEventListener('click',e=>{const button=e.currentTarget,on=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(on));by('block-study').dataset.enabled=String(on);});
  for(const location of ['name','chat','tab'])by(`tier-${location}-toggle`).addEventListener('change',e=>{by(`tier-${location}`).hidden=!e.target.checked;});
})();
