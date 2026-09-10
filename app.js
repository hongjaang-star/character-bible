
const periods = {
  "한국":["조선 기반 동화","고려","삼국","근대","현대","한국풍 판타지"],
  "일본":["에도","헤이안","메이지","현대","일본풍 판타지"],
  "중국":["당·송 기반","명·청 기반","고대","현대","중국풍 판타지"],
  "인도":["고대 인도","무굴풍","근대","현대","인도풍 판타지"],
  "그리스":["고대 그리스","헬레니즘풍","현대","그리스 신화 판타지"],
  "프랑스":["19세기","중세","르네상스","벨 에포크","현대","프랑스풍 판타지"],
  "영국":["빅토리아 시대","중세","에드워드 시대","현대","영국풍 판타지"],
  "중동":["중세 이슬람권","오스만풍","고대","현대","아라비안 판타지"],
  "기타":["고전","근대","현대","판타지"]
};

const qs = id => document.getElementById(id);
const inputs = ["type","species","country","period","renderStyle","characterStyle","cultureLevel","silhouette","headRatio","eyeRatio","bodyRatio","face","eyes","ears","tail","palette","outfit","accent","prop","lineStyle","shading","texture","personality","expressions","motions"];

function updatePeriods(){
  const country = qs("country").value;
  qs("period").innerHTML = (periods[country]||periods["기타"]).map(v=>`<option>${v}</option>`).join("");
}

function currentData(){
  return {
    character_id:"CHAR_NEW_001",
    concept:{
      type:qs("type").value,
      species:qs("species").value,
      country:qs("country").value,
      period:qs("period").value,
      culture_level:qs("cultureLevel").value
    },
    style:{
      render:qs("renderStyle").value,
      character_style:qs("characterStyle").value,
      line:qs("lineStyle").value,
      shading:qs("shading").value,
      texture:qs("texture").value,
      palette:qs("palette").value
    },
    anatomy:{
      silhouette:qs("silhouette").value,
      head_ratio:Number(qs("headRatio").value),
      eye_ratio:Number(qs("eyeRatio").value),
      body_ratio:Number(qs("bodyRatio").value)
    },
    identity:{
      face:qs("face").value,
      eyes:qs("eyes").value,
      ears:qs("ears").value,
      tail:qs("tail").value
    },
    wardrobe:{
      outfit:qs("outfit").value,
      accent:qs("accent").value,
      prop:qs("prop").value
    },
    acting:{
      personality:qs("personality").value,
      expressions:qs("expressions").value,
      motions:qs("motions").value
    },
    locks:[...document.querySelectorAll(".lock:checked")].map(x=>x.value),
    reference:{
      enabled:!qs("referenceSection").classList.contains("hidden"),
      strength:Number(qs("refStrength").value)
    }
  };
}

function buildPrompt(d){
  return `Create a production-ready character bible for a ${d.concept.species}.

[CORE CONCEPT]
Country / cultural frame: ${d.concept.country}
Period / world: ${d.concept.period}
Cultural treatment: ${d.concept.culture_level}

[VISUAL STYLE]
Rendering: ${d.style.render}
Character style: ${d.style.character_style}
Line: ${d.style.line}
Shading: ${d.style.shading}
Texture: ${d.style.texture}
Palette direction: ${d.style.palette}

[ANATOMY & SILHOUETTE]
Silhouette: ${d.anatomy.silhouette}
Head proportion: ${d.anatomy.head_ratio}/100
Eye proportion: ${d.anatomy.eye_ratio}/100
Body proportion: ${d.anatomy.body_ratio}/100

[IDENTITY ANCHORS — KEEP CONSISTENT]
Face: ${d.identity.face}
Eyes: ${d.identity.eyes}
Ears: ${d.identity.ears}
Tail / signature feature: ${d.identity.tail}

[WARDROBE]
Outfit: ${d.wardrobe.outfit}
Accent: ${d.wardrobe.accent}
Signature prop: ${d.wardrobe.prop}

[ACTING RANGE]
Personality: ${d.acting.personality}
Expressions: ${d.acting.expressions}
Motions: ${d.acting.motions}

[CHARACTER LOCK]
Preserve exactly across all views and future scenes:
${d.locks.join(", ")}

[MASTER SHEET]
Generate one clean identity sheet containing:
Front view, 3/4 front view, side view, back view, close-up face detail,
signature costume/prop detail, and compact palette swatches.

[MOTION SHEET]
Generate a second sheet containing:
${d.acting.expressions}
and
${d.acting.motions}

Do not redesign the character between panels.
Only viewpoint, facial expression and pose may change.`;
}

function refresh(){
  const d = currentData();
  qs("characterTitle").textContent = `${d.concept.species} · ${d.concept.country} ${d.concept.period}`;
  qs("summaryText").textContent = `${d.style.render} / ${d.style.character_style} / ${d.anatomy.silhouette}`;
  qs("promptPreview").textContent = buildPrompt(d);
  qs("jsonPreview").textContent = JSON.stringify(d,null,2);
  qs("headVal").textContent = qs("headRatio").value;
  qs("eyeVal").textContent = qs("eyeRatio").value;
  qs("bodyVal").textContent = qs("bodyRatio").value;
  qs("refStrengthLabel").textContent = qs("refStrength").value+"%";
}

document.querySelectorAll(".mode").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".mode").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    qs("referenceSection").classList.toggle("hidden",mode!=="reference");
    refresh();
  });
});

qs("country").addEventListener("change",()=>{updatePeriods();refresh();});
inputs.forEach(id=>qs(id).addEventListener("input",refresh));
document.querySelectorAll(".lock").forEach(x=>x.addEventListener("change",refresh));
qs("refStrength").addEventListener("input",refresh);

let referenceLoadVersion = 0;
async function registerReferenceImage(file){
  const version=++referenceLoadVersion;
  const status=message=>qs("referenceStatus").textContent=message;
  if(!file.type.startsWith("image/"))return status("이미지 파일을 선택하세요.");
  if(file.size>20*1024*1024)return status("20MB 이하 이미지를 선택하세요.");
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();img.src=url;await img.decode();
    if(version!==referenceLoadVersion)return;
    const reader=new FileReader();
    const data=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    if(version!==referenceLoadVersion)return;
    qs("referenceThumb").src=data;
    qs("referenceThumb").classList.remove("hidden");
    qs("uploadContent").classList.add("hidden");
    const preview=new Image();preview.src=data;preview.alt="레퍼런스 이미지 미리보기";
    preview.style.cssText="width:100%;height:100%;object-fit:contain";
    qs("mainPreview").replaceChildren(preview);
    status("레퍼런스 이미지를 등록했습니다.");
  }catch{if(version===referenceLoadVersion)status("이미지를 읽을 수 없습니다. 다른 이미지를 선택하세요.");}
  finally{URL.revokeObjectURL(url);}
}
qs("referenceInput").addEventListener("change",e=>{
  if(e.target.files[0])registerReferenceImage(e.target.files[0]);
  e.target.value="";
});

qs("btnAnalyze").addEventListener("click",()=>{
  // Prototype-only: deterministic preset simulating reference -> options mapping.
  // In production this action should call a vision model and map structured output into these fields.
  const activeRefs=[...document.querySelectorAll("[data-ref]:checked")].map(x=>x.dataset.ref);
  if(activeRefs.includes("style")){
    qs("renderStyle").value="수채화 그림책";
    qs("characterStyle").value="Storybook Cute";
    qs("lineStyle").value="Soft Brown";
    qs("shading").value="Soft Painterly";
    qs("texture").value="Watercolor Paper";
  }
  if(activeRefs.includes("palette")) qs("palette").value="따뜻한 자연색";
  if(activeRefs.includes("shape")){
    qs("headRatio").value=64; qs("eyeRatio").value=68; qs("bodyRatio").value=44;
  }
  alert("프로토타입 분석값을 옵션에 적용했습니다.\n실서비스에서는 Vision AI 분석 결과를 JSON 스키마로 매핑합니다.");
  refresh();
});

qs("btnNaturalApply").addEventListener("click",()=>{
  const t=qs("naturalEdit").value;
  if(!t.trim()) return;
  if(t.includes("눈") && (t.includes("작")||t.includes("줄"))) qs("eyeRatio").value=Math.max(20,Number(qs("eyeRatio").value)-12);
  if(t.includes("날렵")) { qs("bodyRatio").value=Math.max(20,Number(qs("bodyRatio").value)-10); qs("silhouette").value="키가 크고 날렵함"; }
  if(t.includes("목도리") && (t.includes("제거")||t.includes("없"))) qs("accent").value="없음";
  alert("프로토타입 규칙으로 옵션 변경을 적용했습니다.");
  refresh();
});

qs("btnGuide").addEventListener("click",()=>qs("guideDialog").showModal());
qs("btnCloseGuide").addEventListener("click",()=>qs("guideDialog").close());
qs("btnCopyPrompt").addEventListener("click",async()=>{
  await navigator.clipboard.writeText(qs("promptPreview").textContent);
  alert("프롬프트를 복사했습니다.");
});
qs("btnGeneratePrompt").addEventListener("click",refresh);

qs("btnExport").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(currentData(),null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download="character_bible.json"; a.click();
  URL.revokeObjectURL(a.href);
});
qs("btnReset").addEventListener("click",()=>location.reload());

updatePeriods();
refresh();

/* Manual image-to-video workflow: assets stay in this browser tab. */
const studioAssets = {bible:null,scene:null};
let resultVideoUrl;
const studioStatus = message => { qs("studioStatus").textContent = message; };
function refreshStudio(){
  const d=currentData();
  qs("scenePrompt").value = `첨부한 캐릭터 기준 이미지의 캐릭터를 그대로 유지해 단일 장면 이미지를 만드세요.
기준 이미지의 얼굴, 비율, 무늬, 색상, 의상, 소품을 우선하며 여러 각도나 설명 글자를 배치하지 마세요.
장소: ${qs("sceneSetting").value}
시작 구도와 자세: ${qs("scenePose").value}
화면 비율: ${qs("sceneRatio").value}
기준 이미지에 없는 배경의 세계관 참고: ${d.concept.country}, ${d.concept.period}.
캐릭터 시트나 콜라주가 아닌 영상의 첫 프레임 한 장.`;
  qs("videoPrompt").value = `첨부한 장면을 첫 프레임으로 사용합니다.
동작: ${qs("sceneAction").value}
표정: ${qs("sceneEmotion").value}
카메라: ${qs("sceneCamera").value}
캐릭터의 외형과 의상, 그림체가 일관되게 이어지는 자연스러운 한 장면.`;
}
async function registerStudioImage(file){
  const target=qs("pasteTarget").value;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type))return studioStatus("PNG, JPEG 또는 WebP 이미지를 선택하세요.");
  if(file.size>20*1024*1024)return studioStatus("이미지는 20MB 이하로 선택하세요.");
  const url=URL.createObjectURL(file);
  const check=new Image();
  try{check.src=url;await check.decode();}catch{URL.revokeObjectURL(url);return studioStatus("이미지를 읽을 수 없습니다. 다른 파일을 선택하세요.");}
  if(studioAssets[target])URL.revokeObjectURL(studioAssets[target].url);
  studioAssets[target]={url,file};
  qs(target+"Image").src=url;qs(target+"Image").hidden=false;
  qs(target==="bible"?"removeBible":"removeScene").disabled=false;
  qs("downloadScene").disabled=!studioAssets.scene;
  studioStatus((target==="bible"?"캐릭터 기준":"영상 시작 장면")+" 이미지를 등록했습니다.");
}
qs("studioFile").addEventListener("change",e=>{if(e.target.files[0])registerStudioImage(e.target.files[0]);e.target.value="";});
document.addEventListener("paste",e=>{
  const file=[...(e.clipboardData?.items||[])].find(item=>item.kind==="file"&&item.type.startsWith("image/"))?.getAsFile();
  if(file){
    e.preventDefault();
    const inStudio=e.target instanceof Element && e.target.closest("#videoStudio");
    if(!inStudio && !qs("referenceSection").classList.contains("hidden"))registerReferenceImage(file);
    else registerStudioImage(file);
  }
});
qs("pasteImage").addEventListener("click",async()=>{
  try{
    const items=await navigator.clipboard.read();
    for(const item of items){const type=item.types.find(t=>["image/png","image/jpeg","image/webp"].includes(t));if(type){await registerStudioImage(await item.getType(type));return;}}
    studioStatus("클립보드에 이미지가 없습니다. 이미지 자체를 복사하거나 파일을 선택하세요.");
  }catch{studioStatus("클립보드를 읽을 수 없습니다. 붙여넣기 영역에서 Ctrl+V / ⌘V를 사용하거나 파일을 선택하세요.");}
});
for(const target of ["bible","scene"]){
  qs(target==="bible"?"removeBible":"removeScene").addEventListener("click",()=>{
    if(studioAssets[target])URL.revokeObjectURL(studioAssets[target].url);
    studioAssets[target]=null;qs(target+"Image").removeAttribute("src");qs(target+"Image").hidden=true;
    qs(target==="bible"?"removeBible":"removeScene").disabled=true;
    qs("downloadScene").disabled=!studioAssets.scene;studioStatus("이미지를 제거했습니다.");
  });
}
async function copyStudio(text,fallback){
  try{await navigator.clipboard.writeText(text);studioStatus("프롬프트를 복사했습니다. 열린 도구에 붙여넣으세요.");}
  catch{
    fallback.focus();
    if(fallback.select)fallback.select();
    else{const range=document.createRange();range.selectNodeContents(fallback);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
    studioStatus("자동 복사가 허용되지 않았습니다. 선택된 프롬프트를 직접 복사하세요.");
  }
}
qs("openCharacterTool").addEventListener("click",()=>{
  window.open(qs("imageProvider").value,"_blank","noopener,noreferrer");
  copyStudio(qs("promptPreview").textContent,qs("promptPreview"));
});
qs("openSceneTool").addEventListener("click",()=>{
  if(!studioAssets.bible)return studioStatus("먼저 캐릭터 기준 이미지를 등록하세요.");
  window.open(qs("imageProvider").value,"_blank","noopener,noreferrer");
  copyStudio(qs("scenePrompt").value,qs("scenePrompt"));
});
qs("copyVideo").addEventListener("click",()=>{
  if(!studioAssets.scene)return studioStatus("먼저 영상 시작 장면 이미지를 등록하세요.");
  copyStudio(qs("videoPrompt").value,qs("videoPrompt"));
});
function downloadStudio(url,name){const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
qs("downloadScene").addEventListener("click",()=>{
  const asset=studioAssets.scene;if(!asset)return;
  const ext={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"}[asset.file.type];
  downloadStudio(asset.url,"scene-start."+ext);
});
qs("exportVideo").addEventListener("click",()=>{
  if(!studioAssets.scene)return studioStatus("먼저 영상 시작 장면 이미지를 등록하세요.");
  const seconds=Number(qs("sceneDuration").value);
  if(!Number.isInteger(seconds)||seconds<1||seconds>60)return studioStatus("목표 길이는 1~60초의 정수로 입력하세요.");
  const data={version:1,character:currentData(),scene:{setting:qs("sceneSetting").value,pose:qs("scenePose").value,action:qs("sceneAction").value,emotion:qs("sceneEmotion").value,camera:qs("sceneCamera").value,duration_seconds:seconds,aspect_ratio:qs("sceneRatio").value},scene_prompt:qs("scenePrompt").value,video_prompt:qs("videoPrompt").value,assets_included:false,note:"이미지는 별도로 저장하고 영상 도구에 첨부하세요. 기준 이미지가 캐릭터 외형의 우선 기준입니다."};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  downloadStudio(url,"video-production.json");setTimeout(()=>URL.revokeObjectURL(url),10000);
  studioStatus("제작 정보를 저장했습니다. 장면 이미지도 별도로 다운로드하세요.");
});
qs("videoFile").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  if(!["video/mp4","video/webm"].includes(file.type)||file.size>200*1024*1024){studioStatus("200MB 이하의 MP4 또는 WebM을 선택하세요.");e.target.value="";return;}
  if(resultVideoUrl)URL.revokeObjectURL(resultVideoUrl);
  resultVideoUrl=URL.createObjectURL(file);qs("videoResult").src=resultVideoUrl;qs("videoResult").hidden=false;
  studioStatus("완성 영상을 불러왔습니다.");e.target.value="";
});
qs("videoResult").addEventListener("error",()=>studioStatus("이 브라우저에서 재생할 수 없는 영상입니다. MP4(H.264) 또는 WebM으로 변환해 주세요."));
[...inputs,"sceneSetting","scenePose","sceneAction","sceneEmotion","sceneCamera","sceneRatio"].forEach(id=>qs(id).addEventListener("input",refreshStudio));
qs("country").addEventListener("change",refreshStudio);
refreshStudio();
