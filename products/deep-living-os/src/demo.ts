import type {Property,Demand,Deal,Task,DealEvent} from './core';
export const demoProperties:Property[]=[
 {id:'P-101',title:'Departamento Cumbres de San Miguel',address:'Talca · Sector oriente',commune:'Talca',sector:'Oriente',price:109000000,bedrooms:3,bathrooms:2,parking:true,area:76,operation_type:'venta',property_type:'departamento',status:'disponible'},
 {id:'P-102',title:'Casa familiar en Curicó',address:'Curicó · Barrio residencial',commune:'Curicó',sector:'Centro',price:112000000,bedrooms:3,bathrooms:2,parking:true,area:104,operation_type:'venta',property_type:'casa',status:'disponible'},
 {id:'P-103',title:'Casa con patio en Curicó',address:'Curicó · Sector norte',commune:'Curicó',sector:'Norte',price:124000000,bedrooms:4,bathrooms:2,parking:true,area:120,operation_type:'venta',property_type:'casa',status:'disponible'},
 {id:'P-104',title:'Oficina en Curicó',address:'Curicó · Zona céntrica',commune:'Curicó',sector:'Centro',price:230000,bedrooms:0,bathrooms:1,parking:false,area:25,operation_type:'arriendo',property_type:'oficina',status:'disponible'},
 {id:'P-105',title:'Local comercial en San Javier',address:'San Javier · Avenida principal',commune:'San Javier',sector:'Centro',price:390000,bedrooms:0,bathrooms:1,parking:false,area:36,operation_type:'arriendo',property_type:'local',status:'disponible'},
 {id:'P-106',title:'Casa de un piso',address:'Curicó · Sector sur',commune:'Curicó',sector:'Sur',price:99000000,bedrooms:3,bathrooms:1,parking:true,area:88,operation_type:'venta',property_type:'casa',status:'disponible'}
];
export const demoDemands:Demand[]=[
 {id:'D-201',client_name:'Familia A (ficticio)',commune:'Curicó',budget_max:120000000,bedrooms_min:3,parking_required:true,operation_type:'venta',property_type:'casa',status:'buscando'},
 {id:'D-202',client_name:'Profesional B (ficticio)',commune:'Curicó',budget_max:250000,bedrooms_min:0,parking_required:false,operation_type:'arriendo',property_type:'oficina',status:'buscando'},
 {id:'D-203',client_name:'Inversionista C (ficticio)',commune:'Talca',budget_max:110000000,bedrooms_min:2,parking_required:true,operation_type:'venta',property_type:'departamento',status:'buscando'}
];
export const demoDeals:Deal[]=[
 {id:'O-301',title:'Venta departamento · Talca',stage:4,price:109000000,property_id:'P-101',updated_at:'2026-10-08T12:00:00-03:00'},
 {id:'O-302',title:'Venta casa · Curicó',stage:2,price:112000000,property_id:'P-102',updated_at:'2026-10-07T10:00:00-03:00'},
 {id:'O-303',title:'Arriendo oficina · Curicó',stage:3,price:230000,property_id:'P-104',updated_at:'2026-10-08T09:00:00-03:00'}
];
export const demoTasks:Task[]=[
 {id:'T-1',deal_id:'O-301',title:'Registrar respuesta a carta oferta',status:'pendiente',due_at:'2026-10-11',blocking:true,visibility:'cliente'},
 {id:'T-2',deal_id:'O-301',title:'Confirmar antecedentes del inmueble',status:'pendiente',blocking:false,visibility:'interno'},
 {id:'T-3',deal_id:'O-302',title:'Validar autorización de venta',status:'pendiente',blocking:true,visibility:'cliente'},
 {id:'T-4',deal_id:'O-303',title:'Coordinar visita con interesado',status:'hecha',blocking:false,visibility:'cliente'}
];
export const demoEvents:DealEvent[]=[
 {id:'E-1',deal_id:'O-301',summary:'Propiedad preparada para comercialización',stage:2,visibility:'cliente',created_at:'2026-09-25T11:00:00-03:00'},
 {id:'E-2',deal_id:'O-301',summary:'Visitas coordinadas',stage:3,visibility:'cliente',created_at:'2026-10-01T15:00:00-03:00'},
 {id:'E-3',deal_id:'O-301',summary:'Oferta registrada para evaluación',stage:4,visibility:'cliente',created_at:'2026-10-08T12:00:00-03:00'},
 {id:'E-4',deal_id:'O-302',summary:'Revisión preliminar de carpeta',stage:2,visibility:'cliente',created_at:'2026-10-07T10:00:00-03:00'}
];
