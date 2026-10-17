export function ed4Validate(n,context={},now=Date.now()){
 const errors=[],incident=['Bugs','Incidents','Resolved'].includes(n.kind),tools=n.affected_tools||[];
 if(!['Low','Medium','High','Critical'].includes(n.priority||'Medium'))errors.push('Choose a valid priority.');
 if(!['countdown','static','both'].includes(n.time_mode||'countdown'))errors.push('Choose a valid time display.');
 if(!Array.isArray(tools)||new Set(tools).size!==tools.length)errors.push('Affected tools must be unique.');
 else if(incident&&(tools.length>1||!context.existing&&tools.length!==1))errors.push('One incident must have exactly one affected tool.');
 if((n.branches||[]).some(b=>!tools.includes(b.tool_id)))errors.push('Keep the tool attached to its recorded timeline.');
 for(const field of ['started','eta','start','end'])if(n[field]&&!Number.isFinite(Date.parse(n[field])))errors.push('Invalid '+field+' time.');
 if(n.started&&Date.parse(n.started)>now+60000)errors.push('Reported time cannot be in the future.');
 if(n.started&&n.eta&&Date.parse(n.eta)<Date.parse(n.started))errors.push('ETA cannot be before the reported time.');
 if(n.kind==='Scheduled'&&(!n.start||!n.end))errors.push('Maintenance needs both start and end times.');
 if(n.start&&n.end&&Date.parse(n.end)<=Date.parse(n.start))errors.push('Maintenance end must be after start.');
 if((n.buttons||[]).length>2)errors.push('At most two action buttons are allowed.');
 for(const b of n.buttons||[]){if(!String(b.label||'').trim())errors.push('Each action button needs a label.');try{const u=new URL(b.url);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch{errors.push('Each action button needs a complete HTTPS link without credentials.');}}
 if((n.progress||'').length>1000)errors.push('Progress is limited to 1000 characters.');
 if((n.workaround||'').length>1000)errors.push('Workaround is limited to 1000 characters.');
 return [...new Set(errors)];
}
