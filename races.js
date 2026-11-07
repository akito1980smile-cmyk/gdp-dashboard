// Cloudflare Pages Function: only fetches a user-configured, permitted JSON feed.
// Never scrapes JRA/NAR websites or claims an official connection.
export async function onRequestGet({request,env}) {
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
  if (!env.RACE_FEED_URL) return new Response(JSON.stringify({error:'配信元未設定：RACE_FEED_URL を設定してください。公式自動取得は未接続です。'}),{status:503,headers});
  try {
    const target=new URL(env.RACE_FEED_URL);
    if(target.protocol!=='https:') throw Error('HTTPS配信元のみ利用可能');
    const query=new URL(request.url).searchParams;
    for(const k of ['date','kind','venue','race']) if(query.has(k))target.searchParams.set(k,query.get(k).slice(0,50));
    const upstream=await fetch(target.toString(),{headers:{Accept:'application/json',...(env.RACE_FEED_TOKEN?{Authorization:`Bearer ${env.RACE_FEED_TOKEN}`}:{})},signal:AbortSignal.timeout(12000)});
    if(!upstream.ok)throw Error(`配信元 HTTP ${upstream.status}`);
    const body=await upstream.json();
    if(!Array.isArray(body.races))throw Error('配信元JSONにraces配列がありません');
    return new Response(JSON.stringify({races:body.races.slice(0,100)}),{headers});
  }catch(e){return new Response(JSON.stringify({error:`取得失敗: ${e.message}`}),{status:502,headers})}
}
