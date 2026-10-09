import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import type {Property,Demand,Deal,Task,DealEvent} from './core';
const url=import.meta.env.VITE_SUPABASE_URL || '';
const key=import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const configured=Boolean(url && key);
export const db:SupabaseClient|null=configured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;
export type Membership={org_id:string;role:'admin'|'agent'};
export type Contact={id:string;name:string;email?:string;phone?:string;kind?:string;org_id?:string};
export type Fee={id:string;deal_id:string;rate:number;add_vat:boolean;due_milestone:string;state:string;notes?:string};
export type Document={id:string;deal_id:string;title:string;storage_path:string;visibility:'interno'|'cliente';verification:string;created_at?:string};
export type Exchange={id:string;partner_name:string;details:string;status:string;demand_id?:string};
export type Study={id:string;title:string;address:string;industry:string;criteria:Record<string,number>;caveats:string};
export type Workspace={membership:Membership|null;properties:Property[];demands:Demand[];deals:Deal[];tasks:Task[];events:DealEvent[];contacts:Contact[];fees:Fee[];documents:Document[];exchanges:Exchange[];studies:Study[]};
const empty:Workspace={membership:null,properties:[],demands:[],deals:[],tasks:[],events:[],contacts:[],fees:[],documents:[],exchanges:[],studies:[]};
export async function loadWorkspace():Promise<Workspace>{
 if(!db)return empty;
 const {data:membership,error:mErr}=await db.from('memberships').select('org_id,role').limit(1).maybeSingle();
 if(mErr)throw mErr;
 const orgId=membership?.org_id;
 // A participant without staff membership can only access the client portal (RLS).
 const tableNames=['properties','demands','deals','tasks','deal_events','contacts','fees','documents','exchange_requests','location_studies'] as const;
 const items=await Promise.all(tableNames.map(async name=>{
  if(!orgId && !['deals','tasks','deal_events','documents','fees'].includes(name))return [];
  const query= db!.from(name).select('*').limit(300);
  const {data,error}=await (orgId?query.eq('org_id',orgId):query);
  if(error)throw new Error(name+': '+error.message);
  return data||[];
 }));
 return {
  membership:membership as Membership|null,properties:items[0] as Property[],demands:items[1] as Demand[],
  deals:items[2] as Deal[],tasks:items[3] as Task[],events:items[4] as DealEvent[],
  contacts:items[5] as Contact[],fees:items[6] as Fee[],documents:items[7] as Document[],
  exchanges:items[8] as Exchange[],studies:items[9] as Study[]
 };
}
export async function addRow(table:'contacts'|'properties'|'demands'|'deals'|'tasks'|'fees'|'exchange_requests'|'location_studies',payload:Record<string,unknown>,orgId:string){
 if(!db)throw new Error('Sin backend');
 const {error}=await db.from(table).insert({...payload,org_id:orgId});
 if(error)throw error;
}
export async function taskDone(id:string){
 if(!db)throw new Error('Sin backend');
 const {error}=await db.from('tasks').update({status:'hecha',completed_at:new Date().toISOString()}).eq('id',id);
 if(error)throw error;
}
export async function advance(id:string,stage:number,summary:string){
 if(!db)throw new Error('Sin backend');
 const {error}=await db.rpc('advance_deal',{p_deal:id,p_next_stage:stage,p_summary:summary,p_visibility:'cliente'});
 if(error)throw error;
}
export async function sendMagicLink(email:string){
 if(!db)throw new Error('Sin backend configurado');
 const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.href.split('#')[0]}});
 if(error)throw error;
}
export async function uploadDocument(orgId:string,dealId:string,file:File,title:string,visibility:'interno'|'cliente'){
 if(!db)throw new Error('Sin backend');
 if(file.size>10*1024*1024)throw new Error('Máximo 10 MB');
 if(!['application/pdf','image/png','image/jpeg'].includes(file.type))throw new Error('Solo PDF, PNG o JPEG');
 const ext=file.type==='application/pdf'?'pdf':file.type==='image/png'?'png':'jpg';
 const path=orgId+'/'+dealId+'/'+crypto.randomUUID()+'.'+ext;
 const {error:uploadError}=await db.storage.from('deal-documents').upload(path,file,{contentType:file.type,upsert:false});
 if(uploadError)throw uploadError;
 const {error}=await db.from('documents').insert({org_id:orgId,deal_id:dealId,title,storage_path:path,visibility,uploaded_by:(await db.auth.getUser()).data.user?.id});
 if(error)throw new Error('Se subió un archivo privado, pero no se registró en el expediente: '+error.message);
}

export async function addParticipant(dealId:string,userId:string,relation:'propietario'|'comprador'){
 if(!db)throw new Error('Sin backend');
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!uuid.test(userId))throw new Error('Identificador de usuario inválido');
 const {error}=await db.from('deal_participants').insert({deal_id:dealId,user_id:userId,relation});
 if(error)throw error;
}
