function cors(res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}
export default async function handler(req,res){
  cors(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method==='GET') return res.status(200).json({ok:true,mode:'whatsapp-handoff',message:'Lead handoff is active'});
  if(req.method!=='POST'){
    res.setHeader('Allow','GET, POST, OPTIONS');
    return res.status(405).json({error:'Method not allowed'});
  }
  const input=req.body||{};
  const phone=String(input.phone||'').trim();
  if(phone.replace(/\D/g,'').length<10) return res.status(400).json({error:'Введите корректный номер телефона'});
  if(input.consent!==true) return res.status(400).json({error:'Требуется согласие на обработку данных'});
  return res.status(200).json({ok:true,mode:'whatsapp-handoff',message:'Откройте WhatsApp и отправьте подготовленную заявку.'});
}