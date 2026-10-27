/* ============================================================
   club-portal-demo / 演示数据

   状态模型（用户 2026-10-27 定）：
     设备只有四个状态，由「有没有绑定」×「盒码有没有释放」推出来 ——
       可扫码        盒码可用、从未被绑过（出厂待用）
       绑定中        有账号绑在上面
       已解绑        解绑完成且盒码已重置，可以再扫
       已解绑待重置   绑定已解除，但盒码还被原账号占着，扫不了
     不用「领取 / 可借出」这类说法；不引入国际版与中国区并存。

   配对固定为出厂配对，本站不支持自由配对。
   全部为虚构数据：盒码随机生成，SN 序号固定在 L009xx / R209xx 演示段。
   ============================================================ */
window.SEED = {
  entities: [
    { id:'ent_nanshan', name:'南山滑雪俱乐部',          type:'club',    contact:'王磊',   phone:'138****2043', createdAt:'2026-09-28', status:'active' },
    { id:'ent_wanlong', name:'万龙单板公园 · 教学部',    type:'club',    contact:'赵一帆', phone:'186****7712', createdAt:'2026-10-09', status:'active' },
    { id:'ent_jihe',    name:'北京几何体育科技有限公司', type:'company', contact:'陈悦',   phone:'139****5580', createdAt:'2026-10-15', status:'active' }
  ],

  accounts: [
    { id:'acc_ns_1', username:'nanshan_ops',  name:'南山 · 器材前台', entityId:'ent_nanshan', password:'Heygo@2026', status:'active',   createdAt:'2026-09-28', lastLogin:'2026-10-26 10:12' },
    { id:'acc_ns_2', username:'nanshan_coach',name:'南山 · 教练组',   entityId:'ent_nanshan', password:'Heygo@2026', status:'active',   createdAt:'2026-10-11', lastLogin:'2026-10-25 16:40' },
    { id:'acc_wl_1', username:'wanlong_ops',  name:'万龙 · 教学部',   entityId:'ent_wanlong', password:'Heygo@2026', status:'active',   createdAt:'2026-10-09', lastLogin:'2026-10-24 09:05' },
    { id:'acc_jh_1', username:'jihe_admin',   name:'几何体育 · 运营', entityId:'ent_jihe',    password:'Heygo@2026', status:'active',   createdAt:'2026-10-15', lastLogin:'—' },
    { id:'acc_jh_2', username:'jihe_store02', name:'几何体育 · 二店', entityId:'ent_jihe',    password:'Heygo@2026', status:'disabled', createdAt:'2026-10-18', lastLogin:'2026-10-20 13:22' }
  ],

  /* 一条 = 一副出厂配对的设备。
     box.released = 盒码是否可以被下一个人扫；everBound = 历史上被绑过
     bindings    = 绑定记录，一条对应一只 SN（后端解绑就是按单只走的） */
  devices: [
    /* 绑定中：左右脚都绑在同一个账号 */
    { id:'d01', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260916', packageType:'标准套装',
      leftSn:'HGS1STGBG260916L00901', rightSn:'HGS1STGBG260916R20901',
      box:{ code:'HG3.Odrxo8F3miU1iVYZtZsVpH', released:false }, everBound:true,
      bindings:[
        { bindingId:'bd_1001', userEmail:'li***chen@163.com', sn:'HGS1STGBG260916L00901', deviceName:'左脚', firmware:'1.4.2', boundAt:'2026-10-21 09:40', lastSeenAt:'2026-10-25 14:08' },
        { bindingId:'bd_1002', userEmail:'li***chen@163.com', sn:'HGS1STGBG260916R20901', deviceName:'右脚', firmware:'1.4.2', boundAt:'2026-10-21 09:40', lastSeenAt:'2026-10-25 14:08' }
      ] },

    /* 绑定中（只绑上一只）：右脚当时没连上。解绑粒度必须能处理这种 */
    { id:'d02', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260916', packageType:'标准套装',
      leftSn:'HGS1STGBG260916L00903', rightSn:'HGS1STGBG260916R20903',
      box:{ code:'HG3.UFA1zHqN68R6TkpioMRFTJ', released:false }, everBound:true,
      bindings:[
        { bindingId:'bd_1003', userEmail:'zhou***qi@qq.com', sn:'HGS1STGBG260916L00903', deviceName:'左脚', firmware:'1.4.1', boundAt:'2026-10-23 14:02', lastSeenAt:'2026-10-23 16:30' }
      ] },

    /* 可扫码：出厂待用，没绑过 */
    { id:'d03', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260917', packageType:'标准套装',
      leftSn:'HGS1STGBG260917L00906', rightSn:'HGS1STGBG260917R20904',
      box:{ code:'HG3.JDzIMmMaGOBBfaaj0C8Fub', released:true }, everBound:false, bindings:[] },

    /* 已解绑待重置：盒码还被原账号占着，下一个人扫不了。最该被看见的那个坑 */
    { id:'d04', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260916', packageType:'标准套装',
      leftSn:'HGS1STGBG260917L00904', rightSn:'HGS1STGBG260917R20907',
      box:{ code:'HG3.Oxfv54tNQY0LMfxUaIQX49', released:false }, everBound:true, bindings:[] },

    /* 已解绑待重置 + 上一次重置作业失败，要在操作记录里重试 */
    { id:'d05', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260921', packageType:'标准套装',
      leftSn:'HGS1STGBG260921L00908', rightSn:'HGS1STGBG260921R20908',
      box:{ code:'HG3.9X10SsEJC1pRvQ2mzDkTub', released:false }, everBound:true, bindings:[] },

    /* 已解绑：解绑 + 重置都做完了，可以再扫 */
    { id:'d06', entityId:'ent_nanshan', model:'Heygo-S1', batch:'260921', packageType:'标准套装',
      leftSn:'HGS1STGBG260921L00909', rightSn:'HGS1STGBG260921R20909',
      box:{ code:'HG3.DrwVIOEgPONkhydyvovSIp', released:true }, everBound:true, bindings:[] },

    /* 万龙 */
    { id:'d07', entityId:'ent_wanlong', model:'Heygo-S1', batch:'260917', packageType:'标准套装',
      leftSn:'HGS1STGBG260917L00905', rightSn:'HGS1STGBG260917R20905',
      box:{ code:'HG3.KoRfmTPXtBkEuCfUxNvEeb', released:false }, everBound:true,
      bindings:[
        { bindingId:'bd_1009', userEmail:'wu***@foxmail.com', sn:'HGS1STGBG260917L00905', deviceName:'左脚', firmware:'1.4.2', boundAt:'2026-10-19 15:30', lastSeenAt:'2026-10-22 10:44' },
        { bindingId:'bd_1010', userEmail:'wu***@foxmail.com', sn:'HGS1STGBG260917R20905', deviceName:'右脚', firmware:'1.4.2', boundAt:'2026-10-19 15:30', lastSeenAt:'2026-10-22 10:44' }
      ] },
    { id:'d08', entityId:'ent_wanlong', model:'Heygo-S1', batch:'260917', packageType:'标准套装',
      leftSn:'HGS1STGBG260917L00907', rightSn:'HGS1STGBG260917R20906',
      box:{ code:'HG3.VlRuXvPLWYjmNesXlHdnsR', released:true }, everBound:false, bindings:[] },

    /* 几何体育 */
    { id:'d09', entityId:'ent_jihe', model:'Heygo-S1', batch:'261002', packageType:'体验机',
      leftSn:'HGS1STGBG261002L00910', rightSn:'HGS1STGBG261002R20910',
      box:{ code:'HG3.QOGsmDe2XGvoFaCoGtSpEL', released:false }, everBound:true,
      bindings:[
        { bindingId:'bd_1011', userEmail:'demo.a@jihe-sports.com', sn:'HGS1STGBG261002L00910', deviceName:'左脚', firmware:'1.4.2', boundAt:'2026-10-20 11:08', lastSeenAt:'2026-10-24 09:20' },
        { bindingId:'bd_1012', userEmail:'demo.a@jihe-sports.com', sn:'HGS1STGBG261002R20910', deviceName:'右脚', firmware:'1.4.2', boundAt:'2026-10-20 11:08', lastSeenAt:'2026-10-24 09:20' }
      ] },
    { id:'d10', entityId:'ent_jihe', model:'Heygo-S1', batch:'261002', packageType:'体验机',
      leftSn:'HGS1STGBG261002L00911', rightSn:'HGS1STGBG261002R20911',
      box:{ code:'HG3.ZpnKsfVrMhyKQwbTaxCnlA', released:true }, everBound:false, bindings:[] },

    /* 未授权给任何主体 —— 演示越权搜索被拦 */
    { id:'d11', entityId:null, model:'Heygo-S1', batch:'260916', packageType:'标准套装',
      leftSn:'HGS1STGBG260916L00902', rightSn:'HGS1STGBG260916R20902',
      box:{ code:'HG3.TbnEaKjQwMxZrUoPsVdHyG', released:false }, everBound:true, bindings:[] }
  ],

  /* 解绑并重置是异步作业。status: running / succeeded / failed */
  operations: [
    { id:'op_0001', operationId:'3f1c8a90-2b77-4d61-9e2a-71d0c4a51e02', action:'reset', deviceId:'d05',
      boxCode:'HG3.9X10SsEJC1pRvQ2mzDkTub', status:'failed', errorCode:'SOURCE_RESET_UNVERIFIED',
      actor:'nanshan_ops', reason:'客人还板，交给下一位',
      createdAt:'2026-10-26 18:22', finishedAt:'2026-10-26 18:23' }
  ],

  logs: [
    { id:'lg1', at:'2026-10-26 18:22', accountId:'acc_ns_1', entityId:'ent_nanshan', action:'reset',  deviceId:'d05', detail:'解绑并重置 · 提交失败，待重试', result:'fail' },
    { id:'lg2', at:'2026-10-25 17:02', accountId:'acc_ns_2', entityId:'ent_nanshan', action:'unbind', deviceId:'d04', detail:'解除绑定 2 条', result:'ok' },
    { id:'lg3', at:'2026-10-24 09:14', accountId:'acc_wl_1', entityId:'ent_wanlong', action:'reset',  deviceId:'d08', detail:'解绑并重置', result:'ok' },
    { id:'lg4', at:'2026-10-23 19:48', accountId:'acc_ns_1', entityId:'ent_nanshan', action:'search', deviceId:null, detail:'搜索越权 SN · L00902', result:'denied' }
  ]
};
