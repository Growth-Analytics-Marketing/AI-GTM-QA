// Flatten the logged Mixpanel requests into one row per event, dropping SDK/system properties.
JSON.stringify(JSON.parse(sessionStorage.__mplog||'[]').flatMap(e => (Array.isArray(e.d)?e.d:[e.d]).map(x => ({
  kind: e.k, event: (x||{}).event,
  props: Object.fromEntries(Object.entries((x||{}).properties||{}).filter(([k]) => !/^\$|^mp_|token|^time$|utm_|tracking_version|gtm_|distinct_id/.test(k))),
  set: x && (x.$set || x.$set_once)
}))), null, 1)
