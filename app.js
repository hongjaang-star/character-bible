
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

qs("referenceInput").addEventListener("change",e=>{
  const file=e.target.files[0];
  if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{
    qs("referenceThumb").src=ev.target.result;
    qs("referenceThumb").classList.remove("hidden");
    qs("uploadContent").classList.add("hidden");
    qs("mainPreview").innerHTML=`<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:contain">`;
  };
  r.readAsDataURL(file);
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
