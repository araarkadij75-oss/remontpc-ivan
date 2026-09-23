const FORMSUBMIT_TOKEN = '9049c1ae9ef65ad4895a5f3334767a9e';
const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/' + FORMSUBMIT_TOKEN;

function setHeaders(res){
  res.setHeader('Access-Control-Allow-Origin','https://remontpc-ivan.vercel.app');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Accept');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
}

function clean(value, max=2000){
  return String(value ?? '').trim().slice(0,max);
}

export default async function handler(req,res){
  setHeaders(res);
  if(req.method==='OPTIONS') return res.status(204).end();

  if(req.method==='GET'){
    return res.status(200).json({ok:true,mode:'email',provider:'FormSubmit'});
  }

  if(req.method!=='POST'){
    res.setHeader('Allow','GET, POST, OPTIONS');
    return res.status(405).json({ok:false,error:'Method not allowed'});
  }

  const input=req.body || {};
  const honeypot=clean(input.website,200);
  if(honeypot) return res.status(200).json({ok:true,mode:'email',ticket:'accepted'});

  const phone=clean(input.phone,80);
  if(phone.replace(/\D/g,'').length < 10){
    return res.status(400).json({ok:false,error:'Введите корректный номер телефона'});
  }
  if(input.consent !== true && input.consent !== 'true' && input.consent !== 'on'){
    return res.status(400).json({ok:false,error:'Требуется согласие на обработку данных'});
  }

  const now=new Date();
  const ticket='CHN-' + now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14) + '-' + Math.floor(100+Math.random()*900);
  const utm=input.utm || {};

  const payload={
    _subject:'Новая заявка Чинилкин — ' + phone,
    _template:'table',
    _captcha:'false',
    'ID заявки':ticket,
    'Дата UTC':now.toISOString(),
    'Имя':clean(input.name,160) || 'Не указано',
    'Телефон':phone,
    'Проблема':clean(input.problem,3000) || 'Не указана',
    'Адрес / район':clean(input.location,500) || 'Не указан',
    'Источник':clean(input.source,120) || 'website',
    'UTM source':clean(utm.source,200),
    'UTM medium':clean(utm.medium,200),
    'UTM campaign':clean(utm.campaign,200),
    'Страница':clean(input.page,1000)
  };

  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    const upstream=await fetch(FORMSUBMIT_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload),
      signal:controller.signal
    });
    clearTimeout(timeout);

    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok || data.success === false){
      console.error('FormSubmit error', upstream.status, data);
      return res.status(200).json({ok:true,mode:'whatsapp-handoff',ticket});
    }

    return res.status(200).json({ok:true,mode:'email',ticket});
  }catch(error){
    console.error('Lead email failed', error);
    return res.status(200).json({ok:true,mode:'whatsapp-handoff',ticket});
  }
}