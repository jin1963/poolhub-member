const cfg=window.POOLHUB_CONFIG;
const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
const $=id=>document.getElementById(id);
let profile=null,members=[],rewards=[];
const esc=(v="")=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function notice(msg,type="success"){const e=$("notice");e.textContent=msg;e.className="notice "+type;setTimeout(()=>e.classList.add("hidden"),4500)}
function busy(btn,on){if(!btn)return;if(on){btn.dataset.old=btn.textContent;btn.textContent="กำลังบันทึก…";btn.disabled=true}else{btn.textContent=btn.dataset.old||btn.textContent;btn.disabled=false}}
function cardUrl(token){return location.origin+location.pathname+"?card="+encodeURIComponent(token)}

async function init(){
  const token=new URLSearchParams(location.search).get("card");
  if(token){await publicCard(token);return}
  const out=await db.auth.getSession();
  if(out.data.session)await enterApp();
}
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();busy(e.submitter,true);
  const out=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  busy(e.submitter,false);
  if(out.error){notice("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล","error");return}
  await enterApp();
});
$("logoutBtn").onclick=async()=>{await db.auth.signOut();location.href=location.pathname};

async function enterApp(){
  const u=await db.auth.getUser();
  const out=await db.from("staff_profiles").select("display_name,role,active").eq("user_id",u.data.user.id).single();
  if(out.error||!out.data||!out.data.active){await db.auth.signOut();notice("บัญชีนี้ยังไม่ได้รับสิทธิ์","error");return}
  profile=out.data;$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
  $("staffName").textContent=profile.display_name;$("staffRole").textContent=profile.role==="owner"?"OWNER":"STAFF";
  document.querySelectorAll(".owner-only").forEach(e=>e.classList.toggle("hidden",profile.role!=="owner"));
  await Promise.all([loadMembers(),loadRewards()]);
}
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(x=>x.classList.add("hidden"));$("tab-"+btn.dataset.tab).classList.remove("hidden");
});

async function loadMembers(){
  const out=await db.from("members").select("id,member_no,card_token,full_name,phone,line_id,tier,available_points,lifetime_points,status,created_at").order("created_at",{ascending:false});
  if(out.error){notice(out.error.message,"error");return}members=out.data||[];renderMembers();
}
function renderMembers(){
  const q=$("memberSearch").value.trim().toLowerCase();
  const list=members.filter(m=>[m.full_name,m.phone,m.member_no].some(v=>String(v||"").toLowerCase().includes(q)));
  $("memberList").innerHTML=list.length?list.map(m=>'<article class="member-row" data-id="'+m.id+'"><div><div class="member-name">'+esc(m.full_name)+'</div><div class="member-meta">'+esc(m.member_no)+" · "+esc(m.tier)+(m.phone?" · "+esc(m.phone):"")+'</div></div><div class="points">'+m.available_points+"<small>แต้ม</small></div></article>").join(""):'<div class="empty">ยังไม่พบสมาชิก</div>';
  document.querySelectorAll(".member-row").forEach(e=>e.onclick=()=>openMember(e.dataset.id));
}
$("memberSearch").oninput=renderMembers;$("refreshBtn").onclick=()=>Promise.all([loadMembers(),loadRewards()]);

$("memberForm").addEventListener("submit",async e=>{
  e.preventDefault();busy(e.submitter,true);
  const out=await db.rpc("create_poolhub_member",{p_full_name:$("memberName").value.trim(),p_phone:$("memberPhone").value.trim()||null,p_line_id:$("memberLine").value.trim()||null});
  busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}
  e.target.reset();await loadMembers();showNewMember(out.data);
});
function showNewMember(m){
  const el=$("newMemberResult");el.className="result-card card";
  el.innerHTML='<div class="eyebrow">MEMBER CREATED</div><h3>'+esc(m.full_name)+'</h3><div class="member-no">'+esc(m.member_no)+'</div><div id="newQr" class="qr"></div><button id="copyCardLink" class="ghost" type="button">คัดลอกลิงก์สมาชิก</button>';
  new QRCode($("newQr"),{text:cardUrl(m.card_token),width:180,height:180});
  $("copyCardLink").onclick=async()=>{await navigator.clipboard.writeText(cardUrl(m.card_token));notice("คัดลอกลิงก์สมาชิกแล้ว")};
}

async function loadRewards(){
  const out=await db.from("rewards").select("id,name,description,points_required,stock,active").order("created_at",{ascending:false});
  if(out.error){notice(out.error.message,"error");return}rewards=out.data||[];renderRewards();
}
function renderRewards(){
  $("rewardList").innerHTML=rewards.length?rewards.map(r=>'<article class="reward-card"><strong>'+esc(r.name)+'</strong><div class="reward-points">'+r.points_required+' แต้ม</div><div class="stock">คงเหลือ '+r.stock+" ชิ้น"+(r.description?" · "+esc(r.description):"")+"</div></article>").join(""):'<div class="empty">ยังไม่มีของรางวัล</div>';
}
$("rewardForm").addEventListener("submit",async e=>{
  e.preventDefault();busy(e.submitter,true);
  const out=await db.rpc("create_poolhub_reward",{p_name:$("rewardName").value.trim(),p_points_required:Number($("rewardPoints").value),p_stock:Number($("rewardStock").value),p_description:$("rewardDescription").value.trim()||null});
  busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}e.target.reset();notice("เพิ่มของรางวัลเรียบร้อย");await loadRewards();
});

function openMember(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  const opts=rewards.filter(r=>r.active&&r.stock>0).map(r=>'<option value="'+r.id+'">'+esc(r.name)+" — "+r.points_required+" แต้ม</option>").join("");
  const tiers=["Bronze","Silver","Gold","Platinum"].map(t=>'<option '+(m.tier===t?"selected":"")+">"+t+"</option>").join("");
  $("memberDialogBody").innerHTML='<div class="detail-top"><div><div class="eyebrow">'+esc(m.member_no)+'</div><h2>'+esc(m.full_name)+'</h2><div class="muted">'+esc(m.tier)+(m.phone?" · "+esc(m.phone):"")+'</div></div><div class="detail-points">'+m.available_points+'<small> แต้ม</small></div></div><div class="action-block"><h3>เพิ่มแต้มค่าเล่นพูล</h3><form id="playForm" class="form-stack"><label>เวลาที่เล่น (นาที)<input id="playMinutes" type="number" min="1" placeholder="เช่น 90" required></label><label>ยอดชำระจริง (บาท)<input id="playAmount" type="number" min="0" step="0.01" placeholder="ไม่กรอกก็ได้"></label><button class="primary" type="submit">คำนวณและเพิ่มแต้ม</button></form></div><div class="action-block"><h3>แลกของรางวัล</h3><form id="redeemForm" class="form-stack"><label>เลือกของรางวัล<select id="rewardSelect" required><option value="">เลือก…</option>'+opts+'</select></label><label>จำนวน<input id="rewardQty" type="number" min="1" value="1" required></label><button class="ghost" type="submit">ยืนยันการแลก</button></form></div>'+(profile.role==="owner"?'<div class="action-block"><h3>ระดับสมาชิก</h3><form id="tierForm" class="form-stack"><select id="tierSelect">'+tiers+'</select><button class="mini" type="submit">บันทึกระดับ</button></form></div>':"")+'<div class="action-block"><div id="memberQr" class="qr"></div></div>';
  new QRCode($("memberQr"),{text:cardUrl(m.card_token),width:180,height:180});$("memberDialog").showModal();
  $("playForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const a=$("playAmount").value;const out=await db.rpc("add_poolhub_play_points",{p_member_id:m.id,p_play_minutes:Number($("playMinutes").value),p_play_amount:a?Number(a):null});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}notice(out.data.message||"เพิ่ม "+out.data.points_added+" แต้มเรียบร้อย");$("memberDialog").close();await loadMembers()};
  $("redeemForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const out=await db.rpc("redeem_poolhub_reward",{p_member_id:m.id,p_reward_id:$("rewardSelect").value,p_quantity:Number($("rewardQty").value)});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}notice("แลก "+out.data.reward_name+" สำเร็จ");$("memberDialog").close();await Promise.all([loadMembers(),loadRewards()])};
  if($("tierForm"))$("tierForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const out=await db.rpc("change_poolhub_member_tier",{p_member_id:m.id,p_tier:$("tierSelect").value});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}notice("เปลี่ยนระดับสมาชิกแล้ว");$("memberDialog").close();await loadMembers()};
}
$("memberDialog").querySelector(".dialog-close").onclick=()=>$("memberDialog").close();

async function publicCard(token){
  $("loginView").classList.add("hidden");const out=await db.rpc("get_poolhub_member_card",{p_card_token:token});const el=$("memberCardView");el.classList.remove("hidden");
  if(out.error||!out.data){el.innerHTML='<div class="auth-card"><h2>ไม่พบบัตรสมาชิก</h2><p class="muted">กรุณาติดต่อพนักงาน Pool Hub</p></div>';return}
  const d=out.data;
  const history=(d.history||[]).map(x=>'<div class="member-row"><div><div class="member-name">'+esc(x.note||x.transaction_type)+'</div><div class="member-meta">'+new Date(x.created_at).toLocaleString("th-TH")+'</div></div><div class="points">'+(x.points_change>0?"+":"")+x.points_change+'<small>แต้ม</small></div></div>').join("");
  const prizes=(d.rewards||[]).map(r=>'<article class="reward-card"><strong>'+esc(r.name)+'</strong><div class="reward-points">'+r.points_required+' แต้ม</div><div class="stock">คงเหลือ '+r.stock+' ชิ้น</div></article>').join("");
  el.innerHTML='<div class="member-card"><div class="eyebrow">PHL MEMBER</div><h2>'+esc(d.member.full_name)+'</h2><div class="member-meta">'+esc(d.member.member_no)+" · "+esc(d.member.tier)+'</div><div class="detail-points" style="margin-top:20px">'+d.member.available_points+'<small> แต้ม</small></div></div><h2 style="margin-top:24px">ของรางวัล</h2><div class="reward-grid">'+(prizes||'<div class="empty">ยังไม่มีของรางวัล</div>')+'</div><h2 style="margin-top:24px">ประวัติคะแนน</h2><div class="member-list">'+(history||'<div class="empty">ยังไม่มีประวัติ</div>')+"</div>";
}
init().catch(e=>notice(e.message||"เกิดข้อผิดพลาด","error"));
