export default function handler(req,res){
  const recipient=String(req.query?.recipient||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)){
    res.status(400).send('Invalid recipient');
    return;
  }
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.status(200).send(`<!doctype html><meta charset="utf-8"><title>Активация формы</title>
  <body style="font-family:system-ui;background:#06152b;color:#fff;padding:40px">
  <p>Запускаю активацию защищённой формы…</p>
  <form id="f" method="POST" action="https://formsubmit.co/${esc(recipient)}">
    <input type="hidden" name="_subject" value="Активация заявок Чинилкин">
    <input type="hidden" name="name" value="Чинилкин">
    <input type="hidden" name="message" value="Тест активации формы сайта Чинилкин">
    <input type="hidden" name="_captcha" value="false">
  </form>
  <script>setTimeout(()=>document.getElementById('f').submit(),100)</script>`);
}