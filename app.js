const cfg=window.POOLHUB_CONFIG;
const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
const $=id=>document.getElementById(id);
let profile=null,members=[],rewards=[];
const pageParams=new URLSearchParams(location.search);
let lang=pageParams.get("lang");
if(!["th","en"].includes(lang)){try{lang=localStorage.getItem("poolhub_language")}catch{}}
if(!["th","en"].includes(lang))lang="th";
const I18N={
  th:{
    logout:"ออกจากระบบ",staffLoginTitle:"เข้าสู่ระบบพนักงาน",staffLoginDesc:"ใช้บัญชี Owner หรือพนักงานที่สร้างไว้",email:"อีเมล",password:"รหัสผ่าน",login:"เข้าสู่ระบบ",loading:"กำลังโหลด…",
    membersTab:"สมาชิก",newMemberTab:"สมัครใหม่",rewardsTab:"ของรางวัล",inviteTab:"ลิงก์สมัคร",memberListTitle:"รายชื่อสมาชิก",refresh:"รีเฟรช",memberSearch:"ค้นหาชื่อ เบอร์โทร หรือเลขสมาชิก",
    registerMember:"สมัครสมาชิก",memberName:"ชื่อสมาชิก",phone:"เบอร์โทรศัพท์",optional:"(ไม่บังคับ)",createMemberQr:"สร้างสมาชิกและ QR",rewardsTitle:"ของรางวัล",addReward:"เพิ่มของรางวัล",
    rewardName:"ชื่อของรางวัล",pointsRequired:"คะแนนที่ใช้",stock:"จำนวนคงเหลือ",description:"รายละเอียด",createSignupLink:"สร้างลิงก์สมัครสมาชิก",
    inviteDesc:"ใช้ส่งให้ลูกค้าหลังตรวจสอบค่าสมาชิกแล้ว ลิงก์ใช้ได้หนึ่งครั้งและหมดอายุใน 24 ชั่วโมง",createInvite:"สร้างลิงก์สมัคร",poolHubSignup:"สมัครสมาชิก Pool Hub",
    signupDesc:"กรอกข้อมูลให้ครบเพื่อรับเลขสมาชิกและ QR ประจำตัว",confirmSignup:"ยืนยันการสมัคร",close:"ปิด",saving:"กำลังบันทึก…",loginFailed:"เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล",
    unauthorized:"บัญชีนี้ยังไม่ได้รับสิทธิ์",points:"แต้ม",noMembers:"ยังไม่พบสมาชิก",memberCreated:"สร้างสมาชิกสำเร็จ",copyMemberLink:"คัดลอกลิงก์สมาชิก",
    memberLinkCopied:"คัดลอกลิงก์สมาชิกแล้ว",inStock:"คงเหลือ {count} ชิ้น",noRewards:"ยังไม่มีของรางวัล",rewardAdded:"เพิ่มของรางวัลเรียบร้อย",
    specialPointsOwner:"เพิ่มแต้มพิเศษ (Owner)",pointAmount:"จำนวนแต้ม",pointExample:"เช่น 3",reason:"เหตุผล",reasonExample:"เช่น ซื้อเครื่องดื่ม 200 บาท",addSpecialPoints:"เพิ่มแต้มพิเศษ",
    memberTier:"ระดับสมาชิก",saveTier:"บันทึกระดับ",addPlayPoints:"เพิ่มแต้มค่าเล่นพูล",playMinutes:"เวลาที่เล่น (นาที)",minutesExample:"เช่น 90",paidAmount:"ยอดชำระจริง (บาท)",
    optionalAmount:"ไม่กรอกก็ได้",calculatePoints:"คำนวณและเพิ่มแต้ม",redeemReward:"แลกของรางวัล",chooseReward:"เลือกของรางวัล",choose:"เลือก…",quantity:"จำนวน",confirmRedeem:"ยืนยันการแลก",
    pointsAdded:"เพิ่ม {count} แต้มเรียบร้อย",redeemed:"แลก {name} สำเร็จ",specialPointsAdded:"เพิ่ม {count} แต้มพิเศษเรียบร้อย ยอดใหม่ {balance} แต้ม",tierChanged:"เปลี่ยนระดับสมาชิกแล้ว",
    signupLinkReady:"ลิงก์สมัครพร้อมแล้ว",linkReadyForCustomer:"ลิงก์พร้อมส่งให้ลูกค้า",expires:"หมดอายุ {date}",copySignupLink:"คัดลอกลิงก์สมัคร",signupLinkCopied:"คัดลอกลิงก์สมัครแล้ว",
    signupSuccess:"สมัครสำเร็จ",tier:"ระดับ",openMemberCard:"เปิดบัตรสมาชิก",cardNotFound:"ไม่พบบัตรสมาชิก",contactStaff:"กรุณาติดต่อพนักงาน Pool Hub",pointsHistory:"ประวัติคะแนน",
    noHistory:"ยังไม่มีประวัติ",genericError:"เกิดข้อผิดพลาด",freeReferralSignup:"สมัครสมาชิกฟรีผ่านลิงก์แนะนำ",freeReferralDesc:"สมัครฟรีและรับเลขสมาชิก Pool Hub ได้ทันที",referralProgram:"โปรแกรมแนะนำสมาชิก",referralCount:"สมาชิกที่แนะนำ",referralPointsEarned:"แต้มแนะนำสะสม",copyReferralLink:"คัดลอกลิงก์แนะนำ",referralLinkCopied:"คัดลอกลิงก์แนะนำแล้ว",referralBonusAdded:" ผู้แนะนำได้รับเพิ่ม {count} แต้ม",invalidReferral:"ลิงก์แนะนำไม่ถูกต้องหรือหมดสิทธิ์ใช้งาน",addFoodPoints:"เพิ่มแต้มอาหารและเครื่องดื่ม",foodAmount:"ยอดอาหาร/เครื่องดื่ม (บาท)",foodAmountExample:"เช่น 650",foodNote:"รายละเอียดรายการ",foodNoteExample:"เช่น อาหารและเครื่องดื่ม",calculateFoodPoints:"คำนวณและเพิ่มแต้ม",foodRule:"ทุก 300 บาท = 2 แต้ม คำนวณแยกต่อบิล",foodPointsAdded:"บันทึก {amount} บาท ได้ {count} แต้ม เศษบิล {remainder} บาทไม่สะสม"
  },
  en:{
    logout:"Log out",staffLoginTitle:"Staff Login",staffLoginDesc:"Use an Owner or staff account",email:"Email",password:"Password",login:"Log in",loading:"Loading…",
    membersTab:"Members",newMemberTab:"New Member",rewardsTab:"Rewards",inviteTab:"Signup Link",memberListTitle:"Member List",refresh:"Refresh",memberSearch:"Search name, phone or member number",
    registerMember:"Register Member",memberName:"Member Name",phone:"Phone Number",optional:"(optional)",createMemberQr:"Create Member & QR",rewardsTitle:"Rewards",addReward:"Add Reward",
    rewardName:"Reward Name",pointsRequired:"Points Required",stock:"Stock",description:"Description",createSignupLink:"Create Signup Link",
    inviteDesc:"Send this link after confirming the membership payment. It can be used once and expires in 24 hours.",createInvite:"Create Signup Link",poolHubSignup:"Pool Hub Membership Signup",
    signupDesc:"Complete the form to receive your member number and personal QR code",confirmSignup:"Confirm Signup",close:"Close",saving:"Saving…",loginFailed:"Login failed. Please check your details.",
    unauthorized:"This account has not been authorized",points:"points",noMembers:"No members found",memberCreated:"MEMBER CREATED",copyMemberLink:"Copy Member Link",
    memberLinkCopied:"Member link copied",inStock:"{count} in stock",noRewards:"No rewards available",rewardAdded:"Reward added successfully",
    specialPointsOwner:"Add Bonus Points (Owner)",pointAmount:"Points",pointExample:"e.g. 3",reason:"Reason",reasonExample:"e.g. Beverage purchase THB 200",addSpecialPoints:"Add Bonus Points",
    memberTier:"Member Tier",saveTier:"Save Tier",addPlayPoints:"Add Pool Play Points",playMinutes:"Playing Time (minutes)",minutesExample:"e.g. 90",paidAmount:"Amount Paid (THB)",
    optionalAmount:"Optional",calculatePoints:"Calculate & Add Points",redeemReward:"Redeem Reward",chooseReward:"Choose a Reward",choose:"Select…",quantity:"Quantity",confirmRedeem:"Confirm Redemption",
    pointsAdded:"Added {count} points",redeemed:"Successfully redeemed {name}",specialPointsAdded:"Added {count} bonus points. New balance: {balance} points",tierChanged:"Member tier updated",
    signupLinkReady:"SIGNUP LINK READY",linkReadyForCustomer:"Link ready to send",expires:"Expires {date}",copySignupLink:"Copy Signup Link",signupLinkCopied:"Signup link copied",
    signupSuccess:"SIGNUP SUCCESSFUL",tier:"Tier",openMemberCard:"Open Member Card",cardNotFound:"Member Card Not Found",contactStaff:"Please contact Pool Hub staff",pointsHistory:"Points History",
    noHistory:"No history yet",genericError:"An error occurred",freeReferralSignup:"Free Signup by Referral",freeReferralDesc:"Join Pool Hub free and receive your member number instantly",referralProgram:"Member Referral Program",referralCount:"Referred Members",referralPointsEarned:"Referral Points Earned",copyReferralLink:"Copy Referral Link",referralLinkCopied:"Referral link copied",referralBonusAdded:" Referrer received {count} extra points",invalidReferral:"The referral link is invalid or inactive",addFoodPoints:"Add Food & Beverage Points",foodAmount:"Food & Beverage Amount (THB)",foodAmountExample:"e.g. 650",foodNote:"Order Details",foodNoteExample:"e.g. Food and beverages",calculateFoodPoints:"Calculate & Add Points",foodRule:"2 points per THB 300, calculated separately per bill",foodPointsAdded:"Recorded THB {amount}, added {count} points; THB {remainder} bill remainder was not carried forward"
  }
};
function t(key,vars={}){let s=I18N[lang][key]??key;for(const [k,v] of Object.entries(vars))s=s.replaceAll("{"+k+"}",v);return s}
function setLanguage(next){try{localStorage.setItem("poolhub_language",next)}catch{}const u=new URL(location.href);u.searchParams.set("lang",next);location.href=u.href}
function applyLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(e=>e.textContent=t(e.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>e.placeholder=t(e.dataset.i18nPlaceholder));
  document.querySelectorAll("[data-i18n-aria]").forEach(e=>e.setAttribute("aria-label",t(e.dataset.i18nAria)));
  $("langTh").classList.toggle("active",lang==="th");$("langEn").classList.toggle("active",lang==="en");
}
function formatDate(value){return new Date(value).toLocaleString(lang==="th"?"th-TH":"en-GB")}
const esc=(v="")=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function notice(msg,type="success"){const e=$("notice");e.textContent=msg;e.className="notice "+type;setTimeout(()=>e.classList.add("hidden"),4500)}
function busy(btn,on){if(!btn)return;if(on){btn.dataset.old=btn.textContent;btn.textContent=t("saving");btn.disabled=true}else{btn.textContent=btn.dataset.old||btn.textContent;btn.disabled=false}}
function publicUrl(type,token){const u=new URL(location.origin+location.pathname);u.searchParams.set(type,token);u.searchParams.set("lang",lang);return u.href}
function cardUrl(token){return publicUrl("card",token)}
function referralUrl(code){return publicUrl("ref",code)}
$("langTh").onclick=()=>setLanguage("th");$("langEn").onclick=()=>setLanguage("en");applyLanguage();

async function init(){
  const signupToken=pageParams.get("signup");
  if(signupToken){publicSignup(signupToken);return}
  const referralCode=pageParams.get("ref");
  if(referralCode){publicSignup(null,referralCode);return}
  const token=pageParams.get("card");
  if(token){await publicCard(token);return}
  const out=await db.auth.getSession();
  if(out.data.session)await enterApp();
}
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();busy(e.submitter,true);
  const out=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  busy(e.submitter,false);
  if(out.error){notice(t("loginFailed"),"error");return}
  await enterApp();
});
$("logoutBtn").onclick=async()=>{await db.auth.signOut();location.href=location.pathname};

async function enterApp(){
  const u=await db.auth.getUser();
  const out=await db.from("staff_profiles").select("display_name,role,active").eq("user_id",u.data.user.id).single();
  if(out.error||!out.data||!out.data.active){await db.auth.signOut();notice(t("unauthorized"),"error");return}
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
  const out=await db.from("members").select("id,member_no,card_token,full_name,phone,line_id,tier,available_points,lifetime_points,food_spend_remainder,lifetime_food_spend,status,created_at").order("created_at",{ascending:false});
  if(out.error){notice(out.error.message,"error");return}members=out.data||[];renderMembers();
}
function renderMembers(){
  const q=$("memberSearch").value.trim().toLowerCase();
  const list=members.filter(m=>[m.full_name,m.phone,m.member_no].some(v=>String(v||"").toLowerCase().includes(q)));
  $("memberList").innerHTML=list.length?list.map(m=>'<article class="member-row" data-id="'+m.id+'"><div><div class="member-name">'+esc(m.full_name)+'</div><div class="member-meta">'+esc(m.member_no)+" · "+esc(m.tier)+(m.phone?" · "+esc(m.phone):"")+'</div></div><div class="points">'+m.available_points+"<small>"+t("points")+"</small></div></article>").join(""):'<div class="empty">'+t("noMembers")+'</div>';
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
  el.innerHTML='<div class="eyebrow">'+t("memberCreated")+'</div><h3>'+esc(m.full_name)+'</h3><div class="member-no">'+esc(m.member_no)+'</div><div id="newQr" class="qr"></div><button id="copyCardLink" class="ghost" type="button">'+t("copyMemberLink")+'</button>';
  new QRCode($("newQr"),{text:cardUrl(m.card_token),width:180,height:180});
  $("copyCardLink").onclick=async()=>{await navigator.clipboard.writeText(cardUrl(m.card_token));notice(t("memberLinkCopied"))};
}

async function loadRewards(){
  const out=await db.from("rewards").select("id,name,description,points_required,stock,active").order("created_at",{ascending:false});
  if(out.error){notice(out.error.message,"error");return}rewards=out.data||[];renderRewards();
}
function renderRewards(){
  $("rewardList").innerHTML=rewards.length?rewards.map(r=>'<article class="reward-card"><strong>'+esc(r.name)+'</strong><div class="reward-points">'+r.points_required+' '+t("points")+'</div><div class="stock">'+t("inStock",{count:r.stock})+(r.description?" · "+esc(r.description):"")+"</div></article>").join(""):'<div class="empty">'+t("noRewards")+'</div>';
}
$("rewardForm").addEventListener("submit",async e=>{
  e.preventDefault();busy(e.submitter,true);
  const out=await db.rpc("create_poolhub_reward",{p_name:$("rewardName").value.trim(),p_points_required:Number($("rewardPoints").value),p_stock:Number($("rewardStock").value),p_description:$("rewardDescription").value.trim()||null});
  busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}e.target.reset();notice(t("rewardAdded"));await loadRewards();
});

function openMember(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  const opts=rewards.filter(r=>r.active&&r.stock>0).map(r=>'<option value="'+r.id+'">'+esc(r.name)+" — "+r.points_required+" "+t("points")+"</option>").join("");
  const tiers=["Bronze","Silver","Gold","Platinum"].map(t=>'<option value="'+t+'" '+(String(m.tier).toLowerCase()===t.toLowerCase()?"selected":"")+'>'+t+'</option>').join("");
  const ownerTools=profile.role==="owner"?'<div class="action-block"><h3>'+t("specialPointsOwner")+'</h3><form id="manualPointsForm" class="form-stack"><label>'+t("pointAmount")+'<input id="manualPoints" type="number" min="1" max="10000" placeholder="'+t("pointExample")+'" required></label><label>'+t("reason")+'<input id="manualNote" maxlength="200" placeholder="'+t("reasonExample")+'" required></label><button class="primary" type="submit">'+t("addSpecialPoints")+'</button></form></div><div class="action-block"><h3>'+t("memberTier")+'</h3><form id="tierForm" class="form-stack"><select id="tierSelect">'+tiers+'</select><button class="mini" type="submit">'+t("saveTier")+'</button></form></div>':"";
  const foodTools='<div class="action-block"><h3>'+t("addFoodPoints")+'</h3><div class="muted">'+t("foodRule")+'</div><form id="foodPointsForm" class="form-stack"><label>'+t("foodAmount")+'<input id="foodAmount" type="number" min="0.01" step="0.01" placeholder="'+t("foodAmountExample")+'" required></label><label>'+t("foodNote")+'<input id="foodNote" maxlength="200" placeholder="'+t("foodNoteExample")+'"></label><button class="primary" type="submit">'+t("calculateFoodPoints")+'</button></form></div>';
  $("memberDialogBody").innerHTML='<div class="detail-top"><div><div class="eyebrow">'+esc(m.member_no)+'</div><h2>'+esc(m.full_name)+'</h2><div class="muted">'+esc(m.tier)+(m.phone?" · "+esc(m.phone):"")+'</div></div><div class="detail-points">'+m.available_points+'<small> '+t("points")+'</small></div></div><div class="action-block"><h3>'+t("addPlayPoints")+'</h3><form id="playForm" class="form-stack"><label>'+t("playMinutes")+'<input id="playMinutes" type="number" min="1" placeholder="'+t("minutesExample")+'" required></label><label>'+t("paidAmount")+'<input id="playAmount" type="number" min="0" step="0.01" placeholder="'+t("optionalAmount")+'"></label><button class="primary" type="submit">'+t("calculatePoints")+'</button></form></div><div class="action-block"><h3>'+t("redeemReward")+'</h3><form id="redeemForm" class="form-stack"><label>'+t("chooseReward")+'<select id="rewardSelect" required><option value="">'+t("choose")+'</option>'+opts+'</select></label><label>'+t("quantity")+'<input id="rewardQty" type="number" min="1" value="1" required></label><button class="ghost" type="submit">'+t("confirmRedeem")+'</button></form></div>'+ownerTools+'<div class="action-block"><div id="memberQr" class="qr"></div></div>';
  $("memberQr").closest(".action-block").insertAdjacentHTML("beforebegin",foodTools);
  new QRCode($("memberQr"),{text:cardUrl(m.card_token),width:180,height:180});$("memberDialog").showModal();
  $("playForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const a=$("playAmount").value;const out=await db.rpc("add_poolhub_play_points_with_referral",{p_member_id:m.id,p_play_minutes:Number($("playMinutes").value),p_play_amount:a?Number(a):null});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}const bonus=Number(out.data.referral_bonus||0);notice(t("pointsAdded",{count:out.data.points_added})+(bonus?t("referralBonusAdded",{count:bonus}):""));$("memberDialog").close();await loadMembers()};
  $("foodPointsForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const amount=Number($("foodAmount").value);const out=await db.rpc("add_poolhub_food_points_with_referral",{p_member_id:m.id,p_food_amount:amount,p_note:$("foodNote").value.trim()||null});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}const bonus=Number(out.data.referral_bonus||0);notice(t("foodPointsAdded",{amount:Number(out.data.amount_added).toLocaleString(),count:out.data.points_added,remainder:Number(out.data.bill_remainder||0).toLocaleString()})+(bonus?t("referralBonusAdded",{count:bonus}):""));$("memberDialog").close();await loadMembers()};
  $("redeemForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const out=await db.rpc("redeem_poolhub_reward",{p_member_id:m.id,p_reward_id:$("rewardSelect").value,p_quantity:Number($("rewardQty").value)});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}notice(t("redeemed",{name:out.data.reward_name}));$("memberDialog").close();await Promise.all([loadMembers(),loadRewards()])};
  if($("manualPointsForm"))$("manualPointsForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const out=await db.rpc("add_poolhub_service_points_with_referral",{p_member_id:m.id,p_points:Number($("manualPoints").value),p_note:$("manualNote").value.trim()});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}const bonus=Number(out.data.referral_bonus||0);notice(t("specialPointsAdded",{count:out.data.points_added,balance:out.data.balance_after})+(bonus?t("referralBonusAdded",{count:bonus}):""));$("memberDialog").close();await loadMembers()};
  if($("tierForm"))$("tierForm").onsubmit=async e=>{e.preventDefault();busy(e.submitter,true);const out=await db.rpc("change_poolhub_member_tier",{p_member_id:m.id,p_tier:$("tierSelect").value});busy(e.submitter,false);if(out.error){notice(out.error.message,"error");return}notice(t("tierChanged"));$("memberDialog").close();await loadMembers()};
}
$("memberDialog").querySelector(".dialog-close").onclick=()=>$("memberDialog").close();

$("createInviteBtn").onclick=async e=>{
  busy(e.currentTarget,true);
  const out=await db.rpc("create_poolhub_signup_invite");
  busy(e.currentTarget,false);
  if(out.error){notice(out.error.message,"error");return}
  const url=publicUrl("signup",out.data.token);
  const el=$("inviteResult");el.className="result-card card";
  el.innerHTML='<div class="eyebrow">'+t("signupLinkReady")+'</div><h3>'+t("linkReadyForCustomer")+'</h3><p class="muted">'+t("expires",{date:formatDate(out.data.expires_at)})+'</p><div id="inviteQr" class="qr"></div><button id="copyInviteLink" class="primary" type="button">'+t("copySignupLink")+'</button>';
  new QRCode($("inviteQr"),{text:url,width:180,height:180});
  $("copyInviteLink").onclick=async()=>{await navigator.clipboard.writeText(url);notice(t("signupLinkCopied"))};
};

function publicSignup(token,referralCode=null){
  $("loginView").classList.add("hidden");
  $("signupView").classList.remove("hidden");
  if(referralCode){
    const title=$("signupView").querySelector("h2");
    const desc=$("signupView").querySelector(".muted");
    if(title)title.textContent=t("freeReferralSignup");
    if(desc)desc.textContent=t("freeReferralDesc");
  }
  $("signupForm").onsubmit=async e=>{
    e.preventDefault();busy(e.submitter,true);
    const params={p_full_name:$("signupName").value.trim(),p_phone:$("signupPhone").value.trim(),p_line_id:$("signupLine").value.trim()||null};
    const out=referralCode
      ?await db.rpc("register_poolhub_free_referral",{p_referral_code:referralCode,...params})
      :await db.rpc("register_poolhub_with_invite",{p_token:token,...params});
    busy(e.submitter,false);
    if(out.error){notice(out.error.message,"error");return}
    $("signupForm").classList.add("hidden");
    const m=out.data,url=cardUrl(m.card_token),el=$("signupResult");
    el.className="result-card";
    el.innerHTML='<div class="eyebrow">'+t("signupSuccess")+'</div><h2>'+esc(m.full_name)+'</h2><div class="member-no">'+esc(m.member_no)+'</div><p>'+t("tier")+' '+esc(m.tier)+' · '+m.available_points+' '+t("points")+'</p><div id="signupQr" class="qr"></div><a class="primary" style="display:inline-block;text-decoration:none" href="'+url+'">'+t("openMemberCard")+'</a>';
    new QRCode($("signupQr"),{text:url,width:180,height:180});
  };
}

async function publicCard(token){
  $("loginView").classList.add("hidden");const out=await db.rpc("get_poolhub_member_card",{p_card_token:token});const el=$("memberCardView");el.classList.remove("hidden");
  if(out.error||!out.data){el.innerHTML='<div class="auth-card"><h2>'+t("cardNotFound")+'</h2><p class="muted">'+t("contactStaff")+'</p></div>';return}
  const d=out.data;
  const history=(d.history||[]).map(x=>'<div class="member-row"><div><div class="member-name">'+esc(x.note||x.transaction_type)+'</div><div class="member-meta">'+formatDate(x.created_at)+'</div></div><div class="points">'+(x.points_change>0?"+":"")+x.points_change+'<small>'+t("points")+'</small></div></div>').join("");
  const prizes=(d.rewards||[]).map(r=>'<article class="reward-card"><strong>'+esc(r.name)+'</strong><div class="reward-points">'+r.points_required+' '+t("points")+'</div><div class="stock">'+t("inStock",{count:r.stock})+'</div></article>').join("");
  const refUrl=referralUrl(d.member.referral_code);
  const foodProgress='<div class="card" style="margin-top:24px"><div class="eyebrow">FOOD &amp; DRINK</div><h2>300 THB = 2 '+t("points")+'</h2><div class="muted">'+t("foodRule")+'</div></div>';
  el.innerHTML='<div class="member-card"><div class="eyebrow">PHL MEMBER</div><h2>'+esc(d.member.full_name)+'</h2><div class="member-meta">'+esc(d.member.member_no)+" · "+esc(d.member.tier)+'</div><div class="detail-points" style="margin-top:20px">'+d.member.available_points+'<small> '+t("points")+'</small></div></div><div class="card" style="margin-top:24px"><div class="eyebrow">REFERRAL</div><h2>'+t("referralProgram")+'</h2><div class="two-col"><div><div class="muted">'+t("referralCount")+'</div><div class="detail-points">'+Number(d.member.referral_count||0)+'</div></div><div><div class="muted">'+t("referralPointsEarned")+'</div><div class="detail-points">'+Number(d.member.referral_points_earned||0)+'</div></div></div><button id="copyPublicReferral" class="primary" type="button" style="margin-top:18px">'+t("copyReferralLink")+'</button></div><h2 style="margin-top:24px">'+t("rewardsTitle")+'</h2><div class="reward-grid">'+(prizes||'<div class="empty">'+t("noRewards")+'</div>')+'</div><h2 style="margin-top:24px">'+t("pointsHistory")+'</h2><div class="member-list">'+(history||'<div class="empty">'+t("noHistory")+'</div>')+"</div>";
  el.querySelector(".member-card").insertAdjacentHTML("afterend",foodProgress);
  $("copyPublicReferral").onclick=async()=>{await navigator.clipboard.writeText(refUrl);notice(t("referralLinkCopied"))};
}
init().catch(e=>notice(e.message||t("genericError"),"error"));
