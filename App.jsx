import { useState, useEffect, useRef } from "react";

const theme = {
  bg: "#0a0a0a", surface: "#111111", surfaceHigh: "#1a1a1a",
  border: "#222222", borderLight: "#2a2a2a",
  accent: "#00c896", accentDim: "#00c89620", accentHover: "#00e0a8",
  text: "#f0f0f0", textSub: "#888888", textDim: "#555555",
  danger: "#ff4d4d", warning: "#f5a623", info: "#4d9fff", success: "#00c896",
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const KEYS = { products: "catalog-products", orders: "catalog-orders" };
function loadData(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id:"p1", name:"Isca Artificial Shrimp Lure 95mm", desc:"Isca de camarão importada do Japão, ideal para robalo e pescada. Acabamento realista com 3D eyes.", price:89.90, stock:12, category:"Iscas", image:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", createdAt:Date.now() },
  { id:"p2", name:"Carretel Daiwa Ninja LT 2500", desc:"Carretel japonês de alta precisão, rolamento duplo, drag 5kg. Linha: 0.18mm.", price:349.00, stock:5, category:"Carretéis", image:"https://images.unsplash.com/photo-1605932890397-d3b3b5f69c2f?w=400&q=80", createdAt:Date.now() },
  { id:"p3", name:"Vara Shimano Catana 6'0 ML", desc:"Vara de fibra de carbono IM-6, anéis em aço inox, cabo em EVA premium.", price:279.00, stock:3, category:"Varas", image:"https://images.unsplash.com/photo-1516728778615-2d590ea1855e?w=400&q=80", createdAt:Date.now() },
];
const SEED_ORDERS = [
  { id:"o1", customerName:"Carlos Mendes", customerPhone:"11999990001", items:[{productId:"p1",productName:"Isca Artificial Shrimp Lure 95mm",qty:2,price:89.90}], total:179.80, status:"pending", address:"Rua das Pedras, 45 - SP", createdAt:Date.now()-3600000*2, pixProof:null, trackingCode:null },
  { id:"o2", customerName:"Ana Lima", customerPhone:"11988880002", items:[{productId:"p2",productName:"Carretel Daiwa Ninja LT 2500",qty:1,price:349.00}], total:349.00, status:"paid", address:"Av. Paulista, 1200 - SP", createdAt:Date.now()-3600000*5, pixProof:"comprovante_ana.jpg", trackingCode:null },
  { id:"o3", customerName:"Roberto Sakata", customerPhone:"11977770003", items:[{productId:"p3",productName:"Vara Shimano Catana 6'0 ML",qty:1,price:279.00},{productId:"p1",productName:"Isca Artificial Shrimp Lure 95mm",qty:3,price:89.90}], total:548.70, status:"shipped", address:"Rua Vergueiro, 3100 - SP", createdAt:Date.now()-3600000*24, pixProof:"pix_roberto.jpg", trackingCode:"BR123456789BR" },
];

const STATUS = {
  pending:   { label:"Aguardando pagamento", color:theme.warning, next:"paid",      nextLabel:"Marcar como pago" },
  paid:      { label:"Pago",                 color:theme.info,    next:"shipped",   nextLabel:"Marcar como enviado" },
  shipped:   { label:"Enviado",              color:theme.accent,  next:"delivered", nextLabel:"Marcar como entregue" },
  delivered: { label:"Entregue",             color:"#888",        next:null,        nextLabel:null },
  cancelled: { label:"Cancelado",            color:theme.danger,  next:null,        nextLabel:null },
};

const ADMIN_PASSWORD = "pesca2024";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=16 }) => {
  const icons = {
    fish:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 16s2-8 10-8 10 8 10 8"/><path d="M2 16s2-4 5-4 5 4 5 4"/><circle cx="17" cy="10" r="1" fill="currentColor"/><path d="M22 8l-3 4 3 4"/></svg>,
    package:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
    orders:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    plus:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    cart:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    whatsapp: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    x:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    truck:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    store:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    search:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    lock:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[name] || null;
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${theme.bg};color:${theme.text};font-family:'DM Sans',sans-serif;}
    ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:${theme.surface};}::-webkit-scrollbar-thumb{background:${theme.border};border-radius:2px;}
    input,textarea,select,button{font-family:'DM Sans',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fade-up{animation:fadeUp 0.35s ease forwards;}
    .fade-in{animation:fadeIn 0.25s ease forwards;}
  `}</style>
);

const fmtPrice = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtDate  = ts => new Date(ts).toLocaleDateString("pt-BR");

// ─── ROUTER (manual, sem dependência externa) ─────────────────────────────────
function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  const navigate = (to) => { window.history.pushState({}, "", to); setPath(to); };
  return { path, navigate };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500); }
  }

  return (
    <div style={{minHeight:"100vh",background:theme.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fade-up" style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:16,background:theme.accentDim,display:"flex",alignItems:"center",justifyContent:"center",color:theme.accent,margin:"0 auto 16px"}}>
            <Icon name="lock" size={26}/>
          </div>
          <div style={{fontFamily:"Syne",fontWeight:800,fontSize:24,letterSpacing:"-0.02em"}}>Painel Admin</div>
          <div style={{fontSize:13,color:theme.textSub,marginTop:6}}>Pesca Import — acesso restrito</div>
        </div>
        <form onSubmit={handleSubmit} style={{background:theme.surface,border:`1px solid ${shake ? theme.danger : theme.border}`,borderRadius:16,padding:28,transition:"border-color 0.2s"}}>
          <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:8}}>Senha de acesso</label>
          <input
            type="password" value={pw} onChange={e=>{setPw(e.target.value);setError(false);}}
            placeholder="••••••••" autoFocus
            style={{width:"100%",padding:"12px 14px",background:theme.bg,border:`1px solid ${error ? theme.danger : theme.borderLight}`,borderRadius:10,color:theme.text,fontSize:15,outline:"none",marginBottom:error?8:20}}
          />
          {error && <div style={{fontSize:12,color:theme.danger,marginBottom:16}}>Senha incorreta. Tente novamente.</div>}
          <button type="submit" style={{width:"100%",padding:"13px",background:theme.accent,color:"#000",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:14}}>
            Entrar
          </button>
        </form>
        <div style={{textAlign:"center",marginTop:20}}>
          <a href="/" style={{fontSize:13,color:theme.textSub,textDecoration:"none"}}>← Ver catálogo público</a>
        </div>
      </div>
    </div>
  );
}

// ─── CART MODAL ───────────────────────────────────────────────────────────────
function CartModal({ cart, products, onClose, onOrderPlaced }) {
  const [step, setStep] = useState("cart");
  const [form, setForm] = useState({name:"",phone:"",address:""});
  const [loading, setLoading] = useState(false);

  const items = Object.entries(cart).map(([pid,qty]) => {
    const p = products.find(x=>x.id===pid); return p ? {...p,qty} : null;
  }).filter(Boolean);
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);

  async function handleSubmit() {
    if (!form.name||!form.phone||!form.address) return;
    setLoading(true);
    const order = { id:"o"+Date.now(), customerName:form.name, customerPhone:form.phone, address:form.address, items:items.map(i=>({productId:i.id,productName:i.name,qty:i.qty,price:i.price})), total, status:"pending", createdAt:Date.now(), pixProof:null, trackingCode:null };
    await onOrderPlaced(order);
    setLoading(false); setStep("success");
  }

  const inputStyle = {width:"100%",padding:"11px 14px",background:theme.bg,border:`1px solid ${theme.borderLight}`,borderRadius:8,color:theme.text,fontSize:14,outline:"none"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-up" style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:16,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${theme.border}`}}>
          <span style={{fontFamily:"Syne",fontWeight:700,fontSize:18}}>{step==="cart"?"Seu carrinho":step==="form"?"Seus dados":"Pedido confirmado!"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:theme.textSub,padding:4,cursor:"pointer"}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{padding:24}}>
          {step==="cart" && (
            items.length===0
              ? <p style={{color:theme.textSub,textAlign:"center",padding:"32px 0"}}>Carrinho vazio</p>
              : <>
                  {items.map(item=>(
                    <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${theme.border}`}}>
                      <div><div style={{fontSize:14,fontWeight:500}}>{item.name}</div><div style={{fontSize:12,color:theme.textSub,marginTop:2}}>{item.qty}x {fmtPrice(item.price)}</div></div>
                      <div style={{fontFamily:"Syne",fontWeight:700,color:theme.accent}}>{fmtPrice(item.price*item.qty)}</div>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0",fontFamily:"Syne",fontWeight:700,fontSize:18}}>
                    <span>Total</span><span style={{color:theme.accent}}>{fmtPrice(total)}</span>
                  </div>
                  <button onClick={()=>setStep("form")} style={{width:"100%",marginTop:20,padding:14,background:theme.accent,color:"#000",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:14,cursor:"pointer"}}>Continuar →</button>
                </>
          )}
          {step==="form" && (
            <>
              <div style={{fontSize:13,color:theme.textSub,marginBottom:20}}>Pagamento via Pix — envie o comprovante no WhatsApp após confirmar.</div>
              {[["name","Nome completo","text"],["phone","WhatsApp (com DDD)","tel"],["address","Endereço de entrega","text"]].map(([k,lbl,t])=>(
                <div key={k} style={{marginBottom:14}}>
                  <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>{lbl}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={inputStyle}/>
                </div>
              ))}
              <button onClick={handleSubmit} disabled={loading||!form.name||!form.phone||!form.address}
                style={{width:"100%",marginTop:8,padding:14,background:(!form.name||!form.phone||!form.address)?theme.borderLight:theme.accent,color:(!form.name||!form.phone||!form.address)?theme.textDim:"#000",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                {loading?"Enviando...":"Confirmar pedido"}
              </button>
            </>
          )}
          {step==="success" && (
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:theme.accentDim,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:theme.accent}}><Icon name="check" size={32}/></div>
              <div style={{fontFamily:"Syne",fontWeight:800,fontSize:22,marginBottom:8}}>Pedido enviado!</div>
              <div style={{color:theme.textSub,fontSize:14,lineHeight:1.6,marginBottom:24}}>Envie o comprovante do Pix no WhatsApp para confirmar seu pedido.</div>
              <button onClick={()=>window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Fiz um pedido. Total: ${fmtPrice(total)}. Segue o comprovante!`)}`, "_blank")}
                style={{width:"100%",padding:14,background:"#25D366",color:"#fff",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                <Icon name="whatsapp" size={18}/> Enviar comprovante no WhatsApp
              </button>
              <button onClick={onClose} style={{width:"100%",marginTop:10,padding:12,background:"none",color:theme.textSub,border:`1px solid ${theme.border}`,borderRadius:10,fontSize:14,cursor:"pointer"}}>Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM MODAL ───────────────────────────────────────────────────────
function ProductFormModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product||{name:"",desc:"",price:"",stock:"",category:"",image:""});
  const [preview, setPreview] = useState(product?.image||"");
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setForm(f=>({...f,image:ev.target.result})); };
    reader.readAsDataURL(file);
  }

  const inp = {width:"100%",padding:"11px 14px",background:theme.bg,border:`1px solid ${theme.borderLight}`,borderRadius:8,color:theme.text,fontSize:14,outline:"none"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-up" style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:16,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${theme.border}`}}>
          <span style={{fontFamily:"Syne",fontWeight:700,fontSize:18}}>{product?"Editar produto":"Novo produto"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:theme.textSub,padding:4,cursor:"pointer"}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:8}}>Foto do produto</label>
            <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${preview?theme.accent:theme.border}`,borderRadius:12,height:160,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:theme.bg}}>
              {preview ? <img src={preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> :
                <div style={{textAlign:"center",color:theme.textSub}}><Icon name="upload" size={28}/><div style={{fontSize:13,marginTop:8}}>Clique para fazer upload</div></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
            <input type="text" placeholder="Ou cole a URL da imagem" value={typeof form.image==="string"&&!form.image.startsWith("data:")?form.image:""} onChange={e=>{setForm(f=>({...f,image:e.target.value}));setPreview(e.target.value);}} style={{...inp,marginTop:8,fontSize:12}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>Nome *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp} placeholder="Ex: Isca Shrimp Lure"/>
            </div>
            <div>
              <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>Preço (R$) *</label>
              <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={inp} placeholder="89.90"/>
            </div>
            <div>
              <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>Estoque *</label>
              <input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={inp} placeholder="10"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>Categoria</label>
              <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inp} placeholder="Ex: Iscas, Varas, Carretéis"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:12,color:theme.textSub,display:"block",marginBottom:6}}>Descrição</label>
              <textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}} placeholder="Detalhes, especificações, origem..."/>
            </div>
          </div>
          <button onClick={()=>{if(!form.name||!form.price||!form.stock)return;onSave({...form,id:form.id||"p"+Date.now(),price:parseFloat(form.price),stock:parseInt(form.stock),createdAt:form.createdAt||Date.now()});}}
            disabled={!form.name||!form.price||!form.stock}
            style={{padding:14,background:(!form.name||!form.price||!form.stock)?theme.borderLight:theme.accent,color:(!form.name||!form.price||!form.stock)?theme.textDim:"#000",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            {product?"Salvar alterações":"Adicionar produto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdateStatus, onUpdateTracking }) {
  const [tracking, setTracking] = useState(order.trackingCode||"");
  const s = STATUS[order.status];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-up" style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:16,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${theme.border}`}}>
          <div>
            <span style={{fontFamily:"Syne",fontWeight:700,fontSize:18}}>Pedido #{order.id.slice(-6)}</span>
            <div style={{fontSize:12,color:theme.textSub,marginTop:2}}>{new Date(order.createdAt).toLocaleString("pt-BR")}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:theme.textSub,padding:4,cursor:"pointer"}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:20}}>
          {/* Status */}
          <div style={{background:theme.bg,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:11,color:theme.textSub,marginBottom:4}}>Status atual</div><div style={{fontWeight:600,color:s.color,fontSize:15}}>{s.label}</div></div>
            {s.next && <button onClick={()=>onUpdateStatus(order.id,s.next)} style={{padding:"9px 16px",background:s.color+"22",color:s.color,border:`1px solid ${s.color}44`,borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer"}}>{s.nextLabel}</button>}
          </div>
          {/* Pipeline */}
          <div style={{display:"flex",gap:4}}>
            {["pending","paid","shipped","delivered"].map(st=>{
              const idx = ["pending","paid","shipped","delivered","cancelled"].indexOf(order.status);
              const stIdx = ["pending","paid","shipped","delivered","cancelled"].indexOf(st);
              const active = idx >= stIdx;
              return (
                <div key={st} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:"100%",height:4,background:active?s.color:theme.border,borderRadius:2}}/>
                  <span style={{fontSize:10,color:active?s.color:theme.textDim}}>{({pending:"Aguardando",paid:"Pago",shipped:"Enviado",delivered:"Entregue"})[st]}</span>
                </div>
              );
            })}
          </div>
          {/* Customer */}
          <div>
            <div style={{fontSize:12,color:theme.textSub,marginBottom:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em"}}>Cliente</div>
            <div style={{fontSize:14,fontWeight:500}}>{order.customerName}</div>
            <div style={{fontSize:13,color:theme.textSub,marginTop:2}}>{order.customerPhone}</div>
            <div style={{fontSize:13,color:theme.textSub,marginTop:2}}>{order.address}</div>
            <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:10,padding:"8px 14px",background:"#25D36622",color:"#25D366",border:"1px solid #25D36633",borderRadius:8,fontSize:12,textDecoration:"none"}}>
              <Icon name="whatsapp" size={14}/> Contatar no WhatsApp
            </a>
          </div>
          {/* Items */}
          <div>
            <div style={{fontSize:12,color:theme.textSub,marginBottom:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em"}}>Itens</div>
            {order.items.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${theme.border}`}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{item.productName}</div><div style={{fontSize:12,color:theme.textSub,marginTop:2}}>{item.qty}x {fmtPrice(item.price)}</div></div>
                <div style={{fontFamily:"Syne",fontWeight:700,color:theme.accent}}>{fmtPrice(item.price*item.qty)}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",fontFamily:"Syne",fontWeight:800,fontSize:18}}>
              <span>Total</span><span style={{color:theme.accent}}>{fmtPrice(order.total)}</span>
            </div>
          </div>
          {/* Tracking */}
          {(order.status==="shipped"||order.status==="delivered") && (
            <div>
              <div style={{fontSize:12,color:theme.textSub,marginBottom:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em"}}>Código de rastreio</div>
              <div style={{display:"flex",gap:8}}>
                <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="Ex: BR123456789BR" style={{flex:1,padding:"10px 14px",background:theme.bg,border:`1px solid ${theme.borderLight}`,borderRadius:8,color:theme.text,fontSize:14,outline:"none"}}/>
                <button onClick={()=>onUpdateTracking(order.id,tracking)} style={{padding:"10px 16px",background:theme.accent,color:"#000",border:"none",borderRadius:8,fontFamily:"Syne",fontWeight:700,fontSize:13,cursor:"pointer"}}>Salvar</button>
              </div>
              {order.trackingCode && <a href={`https://rastreamento.correios.com.br/app/index.php/rastro/${order.trackingCode}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:theme.accent,textDecoration:"none",marginTop:8,display:"inline-block"}}>Rastrear nos Correios →</a>}
            </div>
          )}
          {order.pixProof && (
            <div style={{background:theme.accentDim,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{color:theme.accent}}><Icon name="check" size={18}/></div>
              <div style={{fontSize:13,color:theme.accent}}>Comprovante Pix recebido: {order.pixProof}</div>
            </div>
          )}
          {order.status==="pending" && (
            <button onClick={()=>onUpdateStatus(order.id,"cancelled")} style={{padding:12,background:"none",color:theme.danger,border:`1px solid ${theme.danger}33`,borderRadius:10,fontSize:13,cursor:"pointer"}}>Cancelar pedido</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CATALOG PAGE ─────────────────────────────────────────────────────────────
function CatalogPage({ products, cart, onAddToCart, onOpenCart }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...new Set(products.map(p=>p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    const matchCat = category==="Todos"||p.category===category;
    const matchSearch = !search||p.name.toLowerCase().includes(search.toLowerCase())||p.desc?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);

  return (
    <div style={{minHeight:"100vh",background:theme.bg}}>
      <div style={{background:theme.surface,borderBottom:`1px solid ${theme.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:theme.accentDim,display:"flex",alignItems:"center",justifyContent:"center",color:theme.accent}}><Icon name="fish" size={20}/></div>
            <div><div style={{fontFamily:"Syne",fontWeight:800,fontSize:16}}>Pesca Import</div><div style={{fontSize:11,color:theme.textSub}}>Importados do Japão</div></div>
          </div>
          <button onClick={onOpenCart} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",background:theme.accentDim,color:theme.accent,border:`1px solid ${theme.accent}33`,borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            <Icon name="cart" size={16}/>
            Carrinho {cartCount>0 && <span style={{background:theme.accent,color:"#000",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{cartCount}</span>}
          </button>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}}>
        <div style={{marginBottom:28,padding:"28px 24px",background:`linear-gradient(135deg,${theme.surface} 0%,#0f1a16 100%)`,border:`1px solid ${theme.border}`,borderRadius:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:theme.accentDim,filter:"blur(40px)"}}/>
          <div style={{fontSize:11,color:theme.accent,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Catálogo Oficial</div>
          <div style={{fontFamily:"Syne",fontWeight:800,fontSize:26,lineHeight:1.2,marginBottom:8}}>Equipamentos de pesca<br/>direto do Japão 🎣</div>
          <div style={{fontSize:13,color:theme.textSub}}>Produtos exclusivos para os membros do grupo. Estoque limitado.</div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,position:"relative"}}>
            <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:theme.textSub}}><Icon name="search" size={16}/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto..." style={{width:"100%",padding:"10px 14px 10px 38px",background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:10,color:theme.text,fontSize:14,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {categories.map(cat=>(
              <button key={cat} onClick={()=>setCategory(cat)} style={{padding:"9px 16px",background:category===cat?theme.accent:theme.surface,color:category===cat?"#000":theme.textSub,border:`1px solid ${category===cat?theme.accent:theme.border}`,borderRadius:10,fontSize:13,fontWeight:category===cat?600:400,cursor:"pointer"}}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
          {filtered.map((product,i)=>(
            <div key={product.id} className="fade-up" style={{animationDelay:`${i*0.05}s`,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:14,overflow:"hidden",transition:"transform 0.2s,border-color 0.2s",cursor:"default"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=theme.accent+"44";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=theme.border;}}>
              <div style={{position:"relative",height:180,overflow:"hidden",background:theme.bg}}>
                {product.image ? <img src={product.image} alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> :
                  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:theme.textDim}}><Icon name="fish" size={48}/></div>}
                {product.stock===0 && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Syne",fontWeight:800,fontSize:14,color:theme.danger,border:`2px solid ${theme.danger}`,padding:"6px 14px",borderRadius:8}}>ESGOTADO</span></div>}
                {product.stock>0&&product.stock<=3 && <div style={{position:"absolute",top:10,right:10,background:theme.warning+"22",color:theme.warning,border:`1px solid ${theme.warning}44`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600}}>Últimas {product.stock}</div>}
              </div>
              <div style={{padding:"14px 16px 16px"}}>
                {product.category && <div style={{fontSize:11,color:theme.accent,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{product.category}</div>}
                <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:4,lineHeight:1.3}}>{product.name}</div>
                {product.desc && <div style={{fontSize:12,color:theme.textSub,marginBottom:12,lineHeight:1.5}}>{product.desc.slice(0,80)}{product.desc.length>80?"...":""}</div>}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Syne",fontWeight:800,fontSize:18,color:theme.accent}}>{fmtPrice(product.price)}</div>
                  <button onClick={()=>product.stock>0&&onAddToCart(product.id)} disabled={product.stock===0}
                    style={{padding:"8px 14px",background:product.stock===0?theme.borderLight:theme.accent,color:product.stock===0?theme.textDim:"#000",border:"none",borderRadius:8,fontFamily:"Syne",fontWeight:700,fontSize:12,cursor:product.stock===0?"default":"pointer"}}>
                    {cart[product.id]?`No carrinho (${cart[product.id]})` : "Adicionar"}
                  </button>
                </div>
                {product.stock>0 && <div style={{fontSize:11,color:theme.textDim,marginTop:8}}>{product.stock} disponível{product.stock>1?"s":""}</div>}
              </div>
            </div>
          ))}
        </div>
        {filtered.length===0 && <div style={{textAlign:"center",padding:"64px 0",color:theme.textSub}}><Icon name="search" size={32}/><div style={{marginTop:12,fontSize:14}}>Nenhum produto encontrado</div></div>}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ products, orders, onSaveProduct, onDeleteProduct, onUpdateOrderStatus, onUpdateTracking, onLogout }) {
  const [tab, setTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productModal, setProductModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter(o=>filterStatus==="all"||o.status===filterStatus).sort((a,b)=>b.createdAt-a.createdAt);
  const stats = {
    revenue: orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0),
    pending: orders.filter(o=>o.status==="pending").length,
    paid:    orders.filter(o=>o.status==="paid").length,
    shipped: orders.filter(o=>o.status==="shipped").length,
  };

  return (
    <div style={{minHeight:"100vh",background:theme.bg}}>
      <div style={{background:theme.surface,borderBottom:`1px solid ${theme.border}`}}>
        <div style={{maxWidth:1000,margin:"0 auto",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#ffffff10",display:"flex",alignItems:"center",justifyContent:"center",color:theme.textSub}}><Icon name="store" size={20}/></div>
            <div><div style={{fontFamily:"Syne",fontWeight:800,fontSize:16}}>Painel Admin</div><div style={{fontSize:11,color:theme.textSub}}>Pesca Import</div></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {[["orders","Pedidos"],["products","Produtos"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",background:tab===t?theme.surfaceHigh:"none",color:tab===t?theme.text:theme.textSub,border:tab===t?`1px solid ${theme.border}`:"1px solid transparent",borderRadius:8,fontSize:13,fontWeight:tab===t?600:400,cursor:"pointer"}}>{l}</button>
            ))}
            <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"none",color:theme.textSub,border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,cursor:"pointer"}}>
              <Icon name="logout" size={14}/> Sair
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="orders" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
              {[{label:"Receita total",value:fmtPrice(stats.revenue),color:theme.accent},{label:"Aguardando Pix",value:stats.pending,color:theme.warning},{label:"Pagos / enviar",value:stats.paid,color:theme.info},{label:"Enviados",value:stats.shipped,color:theme.accent}].map(s=>(
                <div key={s.label} style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:12,padding:16}}>
                  <div style={{fontSize:11,color:theme.textSub,marginBottom:6}}>{s.label}</div>
                  <div style={{fontFamily:"Syne",fontWeight:800,fontSize:22,color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[["all","Todos"],["pending","Aguardando Pix"],["paid","Pagos"],["shipped","Enviados"],["delivered","Entregues"],["cancelled","Cancelados"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"7px 14px",background:filterStatus===v?theme.accent:theme.surface,color:filterStatus===v?"#000":theme.textSub,border:`1px solid ${filterStatus===v?theme.accent:theme.border}`,borderRadius:8,fontSize:12,fontWeight:filterStatus===v?600:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filteredOrders.map(order=>{
                const s = STATUS[order.status];
                return (
                  <div key={order.id} onClick={()=>setSelectedOrder(order)} style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"border-color 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=theme.borderLight} onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:`0 0 8px ${s.color}88`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"Syne",fontWeight:700,fontSize:14}}>{order.customerName}</span>
                        <span style={{fontSize:11,color:theme.textSub}}>#{order.id.slice(-6)}</span>
                      </div>
                      <div style={{fontSize:12,color:theme.textSub,marginTop:2}}>{order.items.length} item(s) · {fmtDate(order.createdAt)}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"Syne",fontWeight:800,fontSize:16,color:theme.accent}}>{fmtPrice(order.total)}</div>
                      <div style={{fontSize:11,color:s.color,marginTop:2}}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
              {filteredOrders.length===0 && <div style={{textAlign:"center",padding:"48px 0",color:theme.textSub}}><Icon name="orders" size={32}/><div style={{marginTop:12,fontSize:14}}>Nenhum pedido encontrado</div></div>}
            </div>
          </>
        )}
        {tab==="products" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"Syne",fontWeight:700,fontSize:18}}>{products.length} produto{products.length!==1?"s":""}</div>
              <button onClick={()=>setProductModal("new")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",background:theme.accent,color:"#000",border:"none",borderRadius:10,fontFamily:"Syne",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                <Icon name="plus" size={16}/> Novo produto
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {products.map(product=>(
                <div key={product.id} style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:56,height:56,borderRadius:8,overflow:"hidden",background:theme.bg,flexShrink:0}}>
                    {product.image?<img src={product.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:theme.textDim}}><Icon name="fish" size={24}/></div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Syne",fontWeight:700,fontSize:14}}>{product.name}</div>
                    {product.category&&<div style={{fontSize:11,color:theme.accent,marginTop:2}}>{product.category}</div>}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,marginRight:8}}>
                    <div style={{fontFamily:"Syne",fontWeight:800,fontSize:16,color:theme.accent}}>{fmtPrice(product.price)}</div>
                    <div style={{fontSize:12,color:product.stock===0?theme.danger:product.stock<=3?theme.warning:theme.textSub,marginTop:2}}>{product.stock===0?"Esgotado":`${product.stock} em estoque`}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>setProductModal(product)} style={{padding:8,background:theme.surfaceHigh,border:`1px solid ${theme.border}`,borderRadius:8,color:theme.textSub,cursor:"pointer"}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>onDeleteProduct(product.id)} style={{padding:8,background:theme.surfaceHigh,border:`1px solid ${theme.border}`,borderRadius:8,color:theme.danger,cursor:"pointer"}}><Icon name="trash" size={15}/></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal order={orders.find(o=>o.id===selectedOrder.id)||selectedOrder} onClose={()=>setSelectedOrder(null)}
          onUpdateStatus={(id,status)=>{onUpdateOrderStatus(id,status);setSelectedOrder(o=>({...o,status}));}}
          onUpdateTracking={(id,code)=>{onUpdateTracking(id,code);setSelectedOrder(o=>({...o,trackingCode:code}));}}
        />
      )}
      {productModal && (
        <ProductFormModal product={productModal==="new"?null:productModal} onSave={p=>{onSaveProduct(p);setProductModal(null);}} onClose={()=>setProductModal(null)}/>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const { path, navigate } = useRoute();
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [cart, setCart]         = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [adminAuth, setAdminAuth] = useState(() => sessionStorage.getItem("admin_auth")==="1");

  useEffect(() => {
    const p = loadData(KEYS.products);
    const o = loadData(KEYS.orders);
    setProducts(p || SEED_PRODUCTS);
    setOrders(o || SEED_ORDERS);
    setLoaded(true);
  }, []);

  function sp(next){ setProducts(next); saveData(KEYS.products,next); }
  function so(next){ setOrders(next);   saveData(KEYS.orders,next);   }

  function handleLogin()  { sessionStorage.setItem("admin_auth","1"); setAdminAuth(true); }
  function handleLogout() { sessionStorage.removeItem("admin_auth");  setAdminAuth(false); navigate("/"); }

  function handleOrderPlaced(order) {
    const nextOrders = [order, ...orders];
    so(nextOrders);
    sp(products.map(p => { const item = order.items.find(i=>i.productId===p.id); return item ? {...p,stock:Math.max(0,p.stock-item.qty)} : p; }));
    setCart({});
  }

  if (!loaded) return <div style={{minHeight:"100vh",background:theme.bg,display:"flex",alignItems:"center",justifyContent:"center",color:theme.textSub,fontFamily:"Syne"}}>Carregando...</div>;

  const isAdmin = path.startsWith("/admin");

  return (
    <>
      <GlobalStyle/>
      {isAdmin
        ? adminAuth
          ? <AdminPage products={products} orders={orders}
              onSaveProduct={p=>{ const exists=products.find(x=>x.id===p.id); sp(exists?products.map(x=>x.id===p.id?p:x):[p,...products]); }}
              onDeleteProduct={id=>sp(products.filter(p=>p.id!==id))}
              onUpdateOrderStatus={(id,status)=>so(orders.map(o=>o.id===id?{...o,status}:o))}
              onUpdateTracking={(id,code)=>so(orders.map(o=>o.id===id?{...o,trackingCode:code}:o))}
              onLogout={handleLogout}
            />
          : <LoginPage onLogin={handleLogin}/>
        : <>
            <CatalogPage products={products} cart={cart} onAddToCart={id=>setCart(c=>({...c,[id]:(c[id]||0)+1}))} onOpenCart={()=>setCartOpen(true)}/>
            {cartOpen && <CartModal cart={cart} products={products} onClose={()=>setCartOpen(false)} onOrderPlaced={handleOrderPlaced}/>}
          </>
      }
    </>
  );
}
