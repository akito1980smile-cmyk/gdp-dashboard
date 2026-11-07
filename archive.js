const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
export async function onRequestGet({request,env}){
 if(!env.DB)return reply({error:'D1未設定：PagesのDBバインディングを設定してください'},503);
 try{const u=new URL(request.url),limit=Math.min(200,Math.max(1,Number(u.searchParams.get('limit'))||100));
 const {results}=await env.DB.prepare('SELECT race_key,payload,updated_at FROM races ORDER BY updated_at DESC LIMIT ?').bind(limit).all();
 return reply({races:results.map(x=>({...x,payload:JSON.parse(x.payload)}))});}catch(e){return reply({error:'D1読み込み失敗: '+e.message},500)}
}
export async function onRequestPost({request,env}){
 if(!env.DB)return reply({error:'D1未設定'},503);
 if(!env.ARCHIVE_WRITE_TOKEN)return reply({error:'ARCHIVE_WRITE_TOKEN未設定'},503);
 if(request.headers.get('authorization')!==`Bearer ${env.ARCHIVE_WRITE_TOKEN}`)return reply({error:'認証失敗'},401);
 try{const raw=await request.text();if(raw.length>950000)return reply({error:'送信サイズ上限超過'},413);const data=JSON.parse(raw),races=data.races||[],predictions=data.predictions||[];
 if(!Array.isArray(races)||!Array.isArray(predictions)||races.length>200||predictions.length>200)return reply({error:'1回あたり各200件まで'},400);
 let nr=0,np=0;for(const x of races){const p=x.payload;if(!p||typeof p!=='object')continue;const key=String(x.race_key||'').slice(0,180);if(!key)continue;const date=String(p.date||'').slice(0,30),kind=String(p.kind||'').slice(0,20),venue=String(p.venue||'').slice(0,80),number=Number(p.race||0);await env.DB.prepare('INSERT INTO races(race_key,race_date,kind,venue,race_number,payload) VALUES(?,?,?,?,?,?) ON CONFLICT(race_key) DO UPDATE SET payload=excluded.payload,updated_at=CURRENT_TIMESTAMP').bind(key,date,kind,venue,number,JSON.stringify(p)).run();nr++}
 for(const x of predictions){const key=String(x.race_key||'').slice(0,180);if(!key||!Array.isArray(x.payload))continue;await env.DB.prepare('INSERT INTO predictions(id,race_key,payload) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind(key,key,JSON.stringify(x.payload)).run();np++}return reply({savedRaces:nr,savedPredictions:np});
 }catch(e){return reply({error:'D1保存失敗: '+e.message},500)}
}
