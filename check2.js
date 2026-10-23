const http=require('http');
http.get('http://localhost:5173/compra-exitosa?folio=PP-0005',(res)=>{
  let d='';res.on('data',c=>d+=c);res.on('end',()=>{
    console.log(d.includes('PAGO ACEPTADO')?'PAGO':d.includes('Compra realizada')?'FALL':'L'+d.length);
  });
});
