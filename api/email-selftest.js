const URL='https://formsubmit.co/ajax/9049c1ae9ef65ad4895a5f3334767a9e';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false});
  const ticket='CHN-EMAIL-TEST-' + Date.now();
  try{
    const upstream=await fetch(URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        _subject:'Новая заявка Чинилкин — ТЕСТ ДОСТАВКИ',
        _template:'table',
        _captcha:'false',
        'ID заявки':ticket,
        'Имя':'ТЕСТ Чинилкин',
        'Телефон':'+7 999 000-00-01',
        'Проблема':'Техническая проверка доставки email — можно удалить',
        'Адрес / район':'Тест',
        'Источник':'server_email_selftest',
        'Страница':'https://remontpc-ivan.vercel.app/'
      })
    });
    const data=await upstream.json().catch(()=>({}));
    return res.status(upstream.ok?200:502).json({ok:upstream.ok && data.success!==false,ticket,providerStatus:upstream.status,provider:data});
  }catch(e){
    return res.status(500).json({ok:false,error:String(e)});
  }
}