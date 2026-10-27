/* ============================================================
   club-portal-demo / 演示数据
   全部为虚构数据。盒码为随机生成，SN 序号固定落在 L009xx / R209xx 演示段，
   不与任何在产设备重合；只有「格式」参照 device-activation-ops 的真实口径：
   - SN:  HGS1STGBG + 6位生产日期 + L/R + 5位序号
   - 盒码: HG3.<22位 base62>，一对设备（左+右）共用一个盒码
   - 盒码状态: usable 可扫 / preconsumed 扫码中(10min 回滚) / consumed 已被账号激活
   ============================================================ */
window.SEED = {
  entities: [
    { id:'ent_nanshan', name:'南山滑雪俱乐部',          type:'club',    contact:'王磊',   phone:'138****2043', createdAt:'2026-09-28', status:'active' },
    { id:'ent_wanlong', name:'万龙单板公园 · 教学部',    type:'club',    contact:'赵一帆', phone:'186****7712', createdAt:'2026-10-09', status:'active' },
    { id:'ent_jihe',    name:'北京几何体育科技有限公司', type:'company', contact:'陈悦',   phone:'139****5580', createdAt:'2026-10-15', status:'active' }
  ],

  accounts: [
    { id:'acc_ns_1', username:'nanshan_ops',  name:'南山 · 器材前台',   entityId:'ent_nanshan', password:'Heygo@2026', status:'active',   createdAt:'2026-09-28', lastLogin:'2026-10-26 10:12' },
    { id:'acc_ns_2', username:'nanshan_coach',name:'南山 · 教练组',     entityId:'ent_nanshan', password:'Heygo@2026', status:'active',   createdAt:'2026-10-11', lastLogin:'2026-10-25 16:40' },
    { id:'acc_wl_1', username:'wanlong_ops',  name:'万龙 · 教学部',     entityId:'ent_wanlong', password:'Heygo@2026', status:'active',   createdAt:'2026-10-09', lastLogin:'2026-10-24 09:05' },
    { id:'acc_jh_1', username:'jihe_admin',   name:'几何体育 · 运营',   entityId:'ent_jihe',    password:'Heygo@2026', status:'active',   createdAt:'2026-10-15', lastLogin:'—' },
    { id:'acc_jh_2', username:'jihe_store02', name:'几何体育 · 二店',   entityId:'ent_jihe',    password:'Heygo@2026', status:'disabled', createdAt:'2026-10-18', lastLogin:'2026-10-20 13:22' }
  ],

  /* 一条 = 一套设备（左右脚 + 共用盒码）。entityId=null 表示未分配给任何主体 */
  devices: [
    { id:'d01', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260916',
      leftSn:'HGS1STGBG260916L00902', rightSn:'HGS1STGBG260916R20902',
      boxCode:'HG3.Odrxo8F3miU1iVYZtZsVpH', boxStatus:'consumed',
      bound:{ nickname:'李*辰', phone:'138****5521', boundAt:'2026-10-21 09:40' } },

    { id:'d02', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260916',
      leftSn:'HGS1STGBG260916L00904', rightSn:'HGS1STGBG260916R20901',
      boxCode:'HG3.UFA1zHqN68R6TkpioMRFTJ', boxStatus:'consumed',
      bound:{ nickname:'周*琪', phone:'159****8830', boundAt:'2026-10-23 14:02' } },

    { id:'d03', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260917',
      leftSn:'HGS1STGBG260917L00906', rightSn:'HGS1STGBG260917R20904',
      boxCode:'HG3.JDzIMmMaGOBBfaaj0C8Fub', boxStatus:'usable', bound:null },

    { id:'d04', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260916',
      leftSn:'HGS1STGBG260916L00901', rightSn:'HGS1STGBG260917R20907',
      boxCode:'HG3.Oxfv54tNQY0LMfxUaIQX49', boxStatus:'preconsumed',
      bound:null, preconsumedUntil:'2026-10-27 11:36' },

    { id:'d05', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260921',
      leftSn:'HGS1STGBG260921L00908', rightSn:'HGS1STGBG260921R20908',
      boxCode:null, boxStatus:'none', bound:null },

    { id:'d06', entityId:'ent_nanshan', model:'Heygo Edge 1', batch:'260921',
      leftSn:'HGS1STGBG260921L00909', rightSn:'HGS1STGBG260921R20909',
      boxCode:'HG3.DrwVIOEgPONkhydyvovSIp', boxStatus:'consumed',
      bound:{ nickname:'教练-孙*', phone:'137****0096', boundAt:'2026-10-12 08:11' } },

    { id:'d07', entityId:'ent_wanlong', model:'Heygo Edge 1', batch:'260917',
      leftSn:'HGS1STGBG260917L00907', rightSn:'HGS1STGBG260917R20905',
      boxCode:'HG3.hwYUlXtl7GYkmtupYowUy6', boxStatus:'consumed',
      bound:{ nickname:'吴*', phone:'133****4417', boundAt:'2026-10-19 15:30' } },

    { id:'d08', entityId:'ent_wanlong', model:'Heygo Edge 1', batch:'260917',
      leftSn:'HGS1STGBG260917L00905', rightSn:'HGS1STGBG260917R20906',
      boxCode:'HG3.WboSm6JCPY44gzVTyMn1Dh', boxStatus:'usable', bound:null },

    { id:'d09', entityId:'ent_jihe', model:'Heygo Edge 1', batch:'261002',
      leftSn:'HGS1STGBG261002L00910', rightSn:'HGS1STGBG261002R20910',
      boxCode:'HG3.ZWSf3gh4hAEHhOhdWeClKS', boxStatus:'consumed',
      bound:{ nickname:'几何-体验机A', phone:'186****1120', boundAt:'2026-10-20 11:08' } },

    { id:'d10', entityId:'ent_jihe', model:'Heygo Edge 1', batch:'261002',
      leftSn:'HGS1STGBG261002L00911', rightSn:'HGS1STGBG261002R20911',
      boxCode:null, boxStatus:'none', bound:null },

    /* 未授权给任何主体 —— 用来演示「搜索越权 SN」的拦截 */
    { id:'d11', entityId:null, model:'Heygo Edge 1', batch:'260916',
      leftSn:'HGS1STGBG260916L00903', rightSn:'HGS1STGBG260916R20903',
      boxCode:'HG3.ohnDOBe9IzitIPTlM88Rkr', boxStatus:'consumed',
      bound:{ nickname:'（他方账号）', phone:'***', boundAt:'2026-10-05 12:00' } }
  ],

  logs: [
    { id:'lg1', at:'2026-10-26 10:21', accountId:'acc_ns_1', entityId:'ent_nanshan', action:'release',  deviceId:'d03', detail:'解绑 + 重置盒码', result:'ok' },
    { id:'lg2', at:'2026-10-25 17:02', accountId:'acc_ns_2', entityId:'ent_nanshan', action:'unbind',   deviceId:'d02', detail:'原绑定 周*琪',  result:'ok' },
    { id:'lg3', at:'2026-10-24 09:14', accountId:'acc_wl_1', entityId:'ent_wanlong', action:'reset',    deviceId:'d08', detail:'HG3.WboSm6JCPY44gzVTyMn1Dh',        result:'ok' },
    { id:'lg4', at:'2026-10-23 19:48', accountId:'acc_ns_1', entityId:'ent_nanshan', action:'search',   deviceId:null, detail:'搜索越权 SN · HGS1STGBG260916L00903', result:'denied' },
    { id:'lg5', at:'2026-10-22 13:30', accountId:'acc_jh_1', entityId:'ent_jihe',    action:'generate', deviceId:'d09', detail:'HG3.ZWSf3gh4hAEHhOhdWeClKS',        result:'ok' }
  ]
};
