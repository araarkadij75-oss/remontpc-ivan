const TARGET='https://app-czxory.v2.appdeploy.ai/api/leads';
export default async function handler(req,res){
  if(req.method==='GET'){try{const upstream=await fetch('https://app-czxory.v2.appdeploy.ai/api/_healthcheck',{headers:{accept:'application/json'}});const text=await upstream.text();return res.status(upstream.ok?200:502).json({ok:upstream.ok,upstream:upstream.ok,status:upstream.status,response:text.slice(0,200)})}catch(err){return res.status(502).json({ok:false,upstream:false,error:'Upstream healthcheck failed'})}}
  if(req.method!=='POST'){ res.setHeader('Allow','GET, POST'); return res.status(405).json({error:'Method not allowed'}); }
  try{
    const input=req.body||{};
    const phone=String(input.phone||'').trim();
    if(phone.replace(/\D/g,'').length<10) return res.status(400).json({error:'Введите корректный номер телефона'});
    if(input.consent!==true) return res.status(400).json({error:'Требуется согласие на обработку данных'});
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),9000);
    const upstream=await fetch(TARGET,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...input,page:String(input.page||req.headers.referer||'').slice(0,1000)}),signal:controller.signal});
    clearTimeout(timer);
    const text=await upstream.text(); let data={}; try{data=JSON.parse(text)}catch{data={error:text||'Ошибка сервера заявок'}}
    return res.status(upstream.status).json(data);
  }catch(err){
    console.error('Lead proxy failed',err);
    return res.status(502).json({error:'Сервис заявок временно недоступен. Позвоните +7 (981) 017-23-45'});
  }
}
