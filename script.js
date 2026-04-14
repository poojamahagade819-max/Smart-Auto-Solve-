"use strict";

// PERFORMANCE OPTIMIZE: Cache frequent DOM elements
const loader = document.getElementById('globalLoader');
const errorToast = document.getElementById('errorToast');
const menuToggle = document.getElementById('menuToggle');
const backBtn = document.getElementById('backBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const titleEl = document.getElementById('headerTitle');
let errorTimeout;

// --- SPLASH SCREEN & ONBOARDING LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if(!localStorage.getItem('nfOnboardingDone')) {
                    document.getElementById('onboardingOverlay').style.display = 'flex';
                }
            }, 500);
        }
    }, 1500);
    
    history.replaceState({ page: 'home' }, '', '#home');
});

function closeOnboarding() {
    document.getElementById('onboardingOverlay').style.display = 'none';
    localStorage.setItem('nfOnboardingDone', 'true');
}

// --- GLOBAL LOADER & ERROR LOGIC ---
function showLoader() { loader.classList.add('active'); }
function hideLoader() { loader.classList.remove('active'); }

function showError(msg) {
    errorToast.innerText = msg;
    errorToast.classList.add('show');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => { errorToast.classList.remove('show'); }, 3000);
}

function runToolWithLoader(callback) {
    showLoader();
    setTimeout(() => {
        try { callback(); } catch(e) { showError("An error occurred"); console.error(e); }
        hideLoader();
    }, 300);
}

// --- WINDOW.OPEN SECURE HANDLE ---
function openSecureLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (sidebar.classList.contains('active')) toggleMenu();
}

// --- SHARE BUTTON ---
document.getElementById('shareBtn').onclick = () => {
    if (navigator.share) {
        navigator.share({ title: 'Smart Auto Solve', text: 'Check out this amazing all-in-one toolkit!', url: window.location.href })
        .catch(err => console.log('Share failed', err));
    } else {
        showError("Share is not supported on this browser.");
    }
};

// --- SMART GREETING & UNIQUE COUNTER ---
let totalCalculations = parseInt(localStorage.getItem('nfTotalUsage')) || 0;
const usageCountEl = document.getElementById('calcUsageCount');
if(usageCountEl) usageCountEl.innerText = totalCalculations;

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Good Evening!";
    if (hour < 12) greeting = "Good Morning!";
    else if (hour < 18) greeting = "Good Afternoon!";
    const dashGreeting = document.getElementById('dashGreeting');
    if(dashGreeting) dashGreeting.innerText = greeting;
}
updateGreeting();

function incrementCounter() {
    totalCalculations++;
    localStorage.setItem('nfTotalUsage', totalCalculations);
    if(usageCountEl) usageCountEl.innerText = totalCalculations;
}

// --- BUTTON RIPPLE ANIMATION ---
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        let rect = this.getBoundingClientRect();
        let x = e.clientX - rect.left; let y = e.clientY - rect.top;
        let ripple = document.createElement('span'); ripple.className = 'ripple';
        ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });
});

// --- MENU SYSTEM & BACK BUTTON LOGIC ---
function toggleMenu() { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); }
function toggleSubmenu(id) {
    const submenu = document.getElementById(id); const btn = submenu.previousElementSibling;
    if (submenu.classList.contains('show')) { submenu.classList.remove('show'); btn.classList.remove('open'); }
    else { submenu.classList.add('show'); btn.classList.add('open'); }
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active'); overlay.classList.remove('active');
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
});

window.addEventListener('popstate', (e) => {
    if(sidebar.classList.contains('active')) { toggleMenu(); return; }
    
    const activePage = document.querySelector('.page-view.active');
    if(activePage) { activePage.classList.remove('active'); return; }
    
    if(e.state && e.state.page) {
        switchTabInternal(e.state.page);
    } else {
        switchTabInternal('home');
    }
});

function switchTab(tabId) {
    switchTabInternal(tabId);
    history.pushState({ page: tabId }, '', '#' + tabId);
}

function goBackHome() {
    switchTabInternal('home');
    history.pushState({ page: 'home' }, '', '#home');
}

function switchTabInternal(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.add('active');
    
    const titles = {
        'home': 'Smart Auto Solve', 'calc': 'Standard Calculator', 'scientific': 'Scientific Calculator', 
        'agecalc': 'Age Calculator', 'gstcalc': 'GST Calculator', 'emicalc': 'EMI Calculator', 
        'percentcalc': 'Percentage Calc', 'discountcalc': 'Discount Calc', 'bmicalc': 'BMI Calculator', 
        'loancalc': 'Loan Calculator', 'texttools': 'Text Tools', 'devtools': 'Developer Tools',
        'seotools': 'SEO Tools', 'socialtools': 'Social Tools'
    };
    titleEl.innerHTML = `<span>⚡</span> ${titles[tabId] || 'Smart Auto Solve'}`;

    if(tabId === 'home') {
        menuToggle.style.display = 'block'; backBtn.style.display = 'none';
    } else {
        menuToggle.style.display = 'none'; backBtn.style.display = 'block';
    }
}

function openPage(pageId) { 
    sidebar.classList.remove('active'); overlay.classList.remove('active'); 
    document.getElementById('page-' + pageId).classList.add('active'); 
    history.pushState({ page: pageId }, '', '#' + pageId);
}
function closePage(pageId) { 
    document.getElementById('page-' + pageId).classList.remove('active'); 
    history.back(); 
}

// --- THEME STATE ---
const themeBtn = document.getElementById('themeBtn');
if(localStorage.getItem('theme') === 'dark') { document.body.setAttribute('data-theme', 'dark'); themeBtn.textContent = '☀️'; }
themeBtn.addEventListener('click', () => {
    if(document.body.getAttribute('data-theme') === 'dark') { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); themeBtn.textContent = '🌙'; }
    else { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); themeBtn.textContent = '☀️'; }
});

// --- HELPER FUNCTION TO OPEN SPECIFIC TOOL ---
function openDevTool(toolId) { switchTab('devtools'); document.getElementById('devToolSelect').value = toolId; showDevToolUI(); }
function openSeoTool(toolId) { switchTab('seotools'); document.getElementById('seoToolSelect').value = toolId; showSeoToolUI(); }
function openSocialTool(toolId) { switchTab('socialtools'); document.getElementById('socialToolSelect').value = toolId; showSocialToolUI(); }

// --- CALCULATOR FUNCTIONS WITH VALIDATION ---
function calculateEMI() {
    const P = parseFloat(document.getElementById('emiP').value), R = parseFloat(document.getElementById('emiR').value)/12/100, N = parseFloat(document.getElementById('emiN').value);
    if(!P || !R || !N) return showError("Please fill all fields correctly");
    runToolWithLoader(() => {
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1); 
        document.getElementById('emiResult').innerText = "₹ " + emi.toFixed(2); addToHistory("EMI Calc", "₹"+emi.toFixed(2));
    });
}
function calculatePercentage() {
    const num = parseFloat(document.getElementById('percNum').value), total = parseFloat(document.getElementById('percTotal').value);
    if(!num || !total) return showError("Please enter valid numbers");
    runToolWithLoader(() => {
        const res = ((num / 100) * total).toFixed(2); document.getElementById('percResult').innerText = res; addToHistory(num+"% of "+total, res);
    });
}
function calculateDiscount() {
    const price = parseFloat(document.getElementById('discPrice').value), disc = parseFloat(document.getElementById('discPerc').value);
    if(!price || !disc) return showError("Please enter valid price and discount");
    runToolWithLoader(() => {
        const saved = (price * disc) / 100; document.getElementById('discFinal').innerText = "₹ " + (price - saved).toFixed(2); document.getElementById('discSaved').innerText = "₹ " + saved.toFixed(2); addToHistory("Disc: "+disc+"% off "+price, "Final: ₹"+(price-saved).toFixed(2));
    });
}
function calculateBMI() {
    const w = parseFloat(document.getElementById('bmiWeight').value), h = parseFloat(document.getElementById('bmiHeight').value)/100;
    if(!w || !h) return showError("Enter valid weight and height");
    runToolWithLoader(() => {
        const bmi = w/(h*h); let cat = bmi<18.5?"Underweight":bmi<24.9?"Normal":bmi<29.9?"Overweight":"Obese"; document.getElementById('bmiResult').innerText = bmi.toFixed(1); document.getElementById('bmiCat').innerText = cat; addToHistory("BMI Calc", bmi.toFixed(1) + " ("+cat+")");
    });
}
function calculateLoan() {
    const P = parseFloat(document.getElementById('loanP').value), R = parseFloat(document.getElementById('loanR').value)/12/100, N = parseFloat(document.getElementById('loanN').value);
    if(!P || !R || !N) return showError("Please fill all details");
    runToolWithLoader(() => {
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1); const total = emi * N; document.getElementById('loanEmi').innerText = "₹ " + emi.toFixed(2); document.getElementById('loanTotal').innerText = "₹ " + total.toFixed(2); document.getElementById('loanInterest').innerText = "₹ " + (total - P).toFixed(2); addToHistory("Loan Calc", "EMI: ₹"+emi.toFixed(2));
    });
}

// --- SOCIAL TOOLS LOGIC ---
function showSocialToolUI() { const tool=document.getElementById('socialToolSelect').value; document.querySelectorAll('.social-tool-content').forEach(el=>el.classList.remove('active')); document.getElementById('soc-'+tool).classList.add('active'); }
function genBio() { const k=document.getElementById('bioInput').value||"Dreamer"; const v=document.getElementById('bioVibe').value; document.getElementById('socialOutput').value=`✨ ${v} Bio:\n\n🚀 ${k} | 🌍 Explorer\n💭 Dreaming Big | 📍 India\n📩 DM for collab`; }
function genHashtags() { const t=document.getElementById('hashInput').value; if(!t) return showError("Enter a topic first!"); document.getElementById('socialOutput').value=`#${t} #${t}Life #${t}Daily #Trending #Viral #${t}Gram #Insta${t} #Explore`; }
function genCaption() { const c=document.getElementById('capInput').value; if(!c) return showError("Describe the image first!"); document.getElementById('socialOutput').value=`📸 ${c}\n.\n.\nLiving the moment ✨\n#Life #GoodVibes #Moments`; }
function copySocialOutput() { document.getElementById('socialOutput').select(); document.execCommand('copy'); }

// --- DEV TOOLS LOGIC ---
function showDevToolUI() { const tool=document.getElementById('devToolSelect').value; document.querySelectorAll('.dev-tool-content').forEach(el=>el.classList.remove('active')); document.getElementById('ui-'+tool).classList.add('active'); }
function formatJSON() { try { document.getElementById('jsonOutput').value=JSON.stringify(JSON.parse(document.getElementById('jsonInput').value),null,4); } catch{showError("Invalid JSON");} }
function minifyJSON() { try { document.getElementById('jsonOutput').value=JSON.stringify(JSON.parse(document.getElementById('jsonInput').value)); } catch{showError("Invalid JSON");} }
function encodeB64() { try { document.getElementById('b64Output').value=btoa(document.getElementById('b64Input').value); } catch{showError("Error Encoding");} }
function decodeB64() { try { document.getElementById('b64Output').value=atob(document.getElementById('b64Input').value); } catch{showError("Error Decoding");} }
function encodeURL() { document.getElementById('urlOutput').value=encodeURIComponent(document.getElementById('urlInput').value); }
function decodeURL() { document.getElementById('urlOutput').value=decodeURIComponent(document.getElementById('urlInput').value); }
function genUUID() { document.getElementById('uuidOutput').value=crypto.randomUUID(); }
function copyUUID() { document.getElementById('uuidOutput').select(); document.execCommand('copy'); }
function genPass() { const chars="ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789!@#$%^&*"; let p=""; for(let i=0;i<document.getElementById('passLen').value;i++) p+=chars.charAt(Math.floor(Math.random()*chars.length)); document.getElementById('passOutput').value=p; }

// --- SEO TOOLS LOGIC ---
function showSeoToolUI() { const tool=document.getElementById('seoToolSelect').value; document.querySelectorAll('.seo-tool-content').forEach(el=>el.classList.remove('active')); document.getElementById('seo-'+tool).classList.add('active'); }
function genMeta() { document.getElementById('metaOutput').value=`<title>${document.getElementById('metaTitle').value}</title>\n<meta name="description" content="${document.getElementById('metaDesc').value}">`; }
function genOG() { document.getElementById('ogOutput').value=`<meta property="og:title" content="${document.getElementById('ogTitle').value}">`; }
function checkDensity() { const v=document.getElementById('kwInput').value; if(!v) return showError("Paste content first"); const w=v.toLowerCase().match(/\b\w+\b/g); const c={}; if(w) w.forEach(i=>c[i]=(c[i]||0)+1); document.getElementById('kwOutput').innerText="Check console for details"; console.log(c); }
function genRobots() { document.getElementById('robotOutput').value=`User-agent: *\nSitemap: ${document.getElementById('robotMap').value}`; }

// --- TEXT TOOLS LOGIC ---
function updateStats() { const t=document.getElementById('textInput').value; document.getElementById('charCount').innerText=t.length; document.getElementById('wordCount').innerText=t.trim()===''?0:t.trim().split(/\s+/).length; }
function textAction(a) { const t=document.getElementById('textInput').value; if(!t) return showError("Enter text first"); document.getElementById('textOutput').value = a==='upper'?t.toUpperCase():a==='lower'?t.toLowerCase():a==='spaces'?t.replace(/\s+/g,' ').trim():t.toLowerCase().replace(/[^a-z0-9]+/g,'-'); }
function copyTextOutput() { document.getElementById('textOutput').select(); document.execCommand('copy'); }

// --- GST CALCULATOR LOGIC ---
function calculateGST() {
    const a=parseFloat(document.getElementById('gstAmount').value), r=parseFloat(document.getElementById('gstRate').value);
    if(isNaN(a)||isNaN(r)) return showError("Enter valid amount");
    runToolWithLoader(() => {
        const gst=(a*r)/100;
        document.getElementById('gstTotal').innerText=gst.toFixed(2); document.getElementById('gstCGST').innerText=(gst/2).toFixed(2);
        document.getElementById('gstSGST').innerText=(gst/2).toFixed(2); document.getElementById('gstFinal').innerText='₹ '+(a+gst).toFixed(2);
        addToHistory("GST: ₹"+a+" @ "+r+"%", "Total: ₹"+(a+gst).toFixed(2));
    });
}
function resetGST() { document.getElementById('gstAmount').value=''; document.getElementById('gstFinal').innerText='₹ 0'; }

// --- AGE CALCULATOR LOGIC ---
function calculateAge() {
    const d1=parseInt(document.getElementById('dobDay').value), m1=parseInt(document.getElementById('dobMonth').value), y1=parseInt(document.getElementById('dobYear').value);
    const d2=parseInt(document.getElementById('todayDay').value), m2=parseInt(document.getElementById('todayMonth').value), y2=parseInt(document.getElementById('todayYear').value);
    if(!d1||!m1||!y1) return showError("Enter correct Date of Birth");
    runToolWithLoader(() => {
        let y=y2-y1, m=m2-m1, d=d2-d1;
        if(d<0){ m--; d+=new Date(y2, m2-1, 0).getDate(); } if(m<0){ y--; m+=12; }
        document.getElementById('resYears').innerText=y; document.getElementById('resMonths').innerText=m; document.getElementById('resDays').innerText=d;
        
        let nb = new Date(y2, m1-1, d1); if(nb < new Date(y2, m2-1, d2)) nb.setFullYear(y2+1);
        const diff = Math.ceil((nb - new Date(y2, m2-1, d2))/(1000*60*60*24));
        document.getElementById('nbDay').innerText=diff; document.getElementById('nbDate').innerText=nb.toDateString();

        const totalD = Math.ceil(Math.abs(new Date(y2,m2-1,d2) - new Date(y1,m1-1,d1))/(1000*60*60*24));
        document.getElementById('totalDays').innerText=totalD; document.getElementById('totalWeeks').innerText=Math.floor(totalD/7); document.getElementById('totalMonths').innerText=(y*12)+m;
        
        const diffMs = Math.abs(new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1));
        document.getElementById('totalHours').innerText = (totalD * 24).toLocaleString();
        document.getElementById('totalMinutes').innerText = (totalD * 24 * 60).toLocaleString();
        document.getElementById('totalSeconds').innerText = (totalD * 24 * 60 * 60).toLocaleString();
        document.getElementById('totalYears').innerText = y;
        
        addToHistory("Age Calc", y+"Y "+m+"M "+d+"D");
    });
}
function resetAgeCalc() { document.getElementById('dobDay').value=''; document.getElementById('dobMonth').value=''; document.getElementById('dobYear').value=''; ['resYears','resMonths','resDays','nbDay','totalMonths','totalWeeks','totalDays','totalHours','totalMinutes','totalSeconds'].forEach(i=>{if(document.getElementById(i))document.getElementById(i).innerText='0'}); document.getElementById('nbDate').innerText='-'; }

// --- STANDARD & SCIENTIFIC CALC ---
let currentInput='0'; const displays=document.querySelectorAll('.display-sync');
['keypad-std','keypad-sci'].forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const {val,action,func}=b.dataset; if(val)handleInput(val); if(action)handleAction(action); if(func)handleMathFunc(func); }) });
function handleInput(v){ if(currentInput==='0'&&v!=='.')currentInput=''; currentInput+=v; updateDisplay(); }
function handleAction(a){ if(a==='clear')currentInput='0'; else if(a==='delete')currentInput=currentInput.slice(0,-1)||'0'; else if(a==='equal')calculateMath(); updateDisplay(); }
function handleMathFunc(f){ if(currentInput==='0')currentInput=''; currentInput+=(f==='sqrt'?'√(':f+'('); updateDisplay(); }

function calculateMath(){ 
    try { 
        let e=currentInput.replace(/π/g,'Math.PI').replace(/e/g,'Math.E').replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(').replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(').replace(/√\(/g,'Math.sqrt(').replace(/\^/g,'**'); 
        let r=new Function('return '+e)(); 
        currentInput=Number.isInteger(r)?r.toString():r.toFixed(8); 
        addToHistory(e, currentInput); 
    } catch { 
        currentInput='Error'; showError("Invalid Math Expression"); 
    } 
    updateDisplay(); 
}

function updateDisplay(){ 
    displays.forEach(d=>d.value=currentInput); 
    try{ 
        let n=parseInt(new Function('return ' + currentInput)()); 
        if(!isNaN(n)&&isFinite(n)){ 
            document.getElementById('hexVal').innerText=n.toString(16).toUpperCase(); 
            document.getElementById('binVal').innerText=n.toString(2); 
            document.getElementById('octVal').innerText=n.toString(8); 
        } else { 
            document.getElementById('hexVal').innerText='-'; 
            document.getElementById('binVal').innerText='-'; 
            document.getElementById('octVal').innerText='-'; 
        } 
    }catch{} 
}

// --- HISTORY LOGIC WITH LOCALSTORAGE ---
let calcHistoryData = JSON.parse(localStorage.getItem('nfCalcHistory')) || [];
const historyList = document.getElementById('historyList');

function renderHistory() {
    historyList.innerHTML = '';
    if (calcHistoryData.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No history available yet.</li>';
        document.getElementById('clearHistoryBtn').style.display = 'none';
    } else {
        calcHistoryData.forEach(item => {
            const li = document.createElement('li'); li.className = 'history-item';
            li.innerHTML = `<span class="hist-expr">${item.expr}</span><span class="hist-res">${item.res}</span>`;
            li.onclick = () => { currentInput = item.res.toString(); updateDisplay(); closePage('history'); switchTab('calc'); };
            historyList.appendChild(li);
        });
        document.getElementById('clearHistoryBtn').style.display = 'block';
    }
}

function addToHistory(expr, res) {
    if (res === 'Error') return;
    incrementCounter(); 
    calcHistoryData.unshift({expr, res});
    if (calcHistoryData.length > 50) calcHistoryData.pop(); 
    localStorage.setItem('nfCalcHistory', JSON.stringify(calcHistoryData));
    renderHistory();
}

document.getElementById('clearHistoryBtn').onclick = () => {
    calcHistoryData = []; localStorage.removeItem('nfCalcHistory'); renderHistory();
}

// Init logic on page load
renderHistory();
const todayD = new Date(); 
document.getElementById('todayDay').value = todayD.getDate(); 
document.getElementById('todayMonth').value = todayD.getMonth()+1; 
document.getElementById('todayYear').value = todayD.getFullYear();