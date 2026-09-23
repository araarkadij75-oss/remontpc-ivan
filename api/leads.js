const GOOGLE_WEBHOOK = process.env.GOOGLE_APPS_SCRIPT_URL || '';

function cors(res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}

export default async function handler(req,res){
  cors(res);
  if(req.method==='OPTIONS') return res.status(204).end();

  if(req.method==='GET'){
    return res.status(200).json({
      ok:true,
      mode:GOOGLE_WEBHOOK ? 'google-sheets' : 'whatsapp-handoff',
      googleSheetsConfigured:Boolean(GOOGLE_WEBHOOK)
    });
  }

  if(req.method!=='POST'){
    res.setHeader('Allow','GET, POST, OPTIONS');
    return res.status(405).json({ok:false,error:'Method not allowed'});
  }

  const input=req.body||{};
  const phone=String(input.phone||'').trim();
  if(phone.replace(/\D/g,'').length<10){
    return res.status(400).json({ok:false,error:'Введите корректный номер телефона'});
  }
  if(input.consent!==true){
    return res.status(400).json({ok:false,error:'Требуется согласие на обработку данных'});
  }
  if(String(input.website||'').trim()){
    return res.status(200).json({ok:true,mode:'stored',ticket:'ignored'});
  }

  if(!GOOGLE_WEBHOOK){
    return res.status(200).json({ok:true,mode:'whatsapp-handoff'});
  }

  try{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),9000);
    const upstream=await fetch(GOOGLE_WEBHOOK,{
      method:'POST',
      headers:{'content-type':'text/plain;charset=utf-8'},
      body:JSON.stringify(input),
      signal:controller.signal,
      redirect:'follow'
    });
    clearTimeout(timer);

    const text=await upstream.text();
    let data={};
    try{ data=JSON.parse(text); }catch{ data={ok:false,error:text.slice(0,300)}; }

    if(!upstream.ok || data.ok===false){
      console.error('Google Sheets webhook rejected lead',upstream.status,text.slice(0,500));
      return res.status(200).json({ok:true,mode:'whatsapp-handoff'});
    }

    return res.status(200).json({
      ok:true,
      mode:'stored',
      ticket:data.ticket || data.id || ''
    });
  }catch(err){
    console.error('Google Sheets webhook failed',err);
    return res.status(200).json({ok:true,mode:'whatsapp-handoff'});
  }
}