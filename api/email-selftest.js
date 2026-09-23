const URL='https://formsubmit.co/9049c1ae9ef65ad4895a5f3334767a9e';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false});
  const ticket='CHN-EMAIL-TEST-' + Date.now();
  const form=new URLSearchParams();
  const fields={
    _subject:'Новая заявка Чинилкин — ТЕСТ ДОСТАВКИ',
    _template:'table',
    _captcha:'false',
    _url:'https://remontpc-ivan.vercel.app/',
    'ID заявки':ticket,
    'Имя':'ТЕСТ Чинилкин',
    'Телефон':'+7 999 000-00-01',
    'Проблема':'Техническая проверка доставки email — можно удалить',
    'Адрес / район':'Тест',
    'Источник':'server_email_selftest',
    'Страница':'https://remontpc-ivan.vercel.app/'
  };
  Object.entries(fields).forEach(([k,v])=>form.append(k,v));
  try{
    const upstream=await fetch(URL,{
      method:'POST',
      headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'Accept':'text/html,application/xhtml+xml',
        'Referer':'https://remontpc-ivan.vercel.app/'
      },
      body:form.toString(),
      redirect:'follow'
    });
    const body=await upstream.text();
    return res.status(200).json({
      ok:upstream.ok,
      ticket,
      providerStatus:upstream.status,
      providerUrl:upstream.url,
      activated:/thank|submitted|success|formsubmit/i.test(body),
      preview:body.replace(/\s+/g,' ').slice(0,240)
    });
  }catch(e){
    return res.status(500).json({ok:false,error:String(e)});
  }
}