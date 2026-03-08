const payload = JSON.parse(process.argv[2] ?? "{}");

if (payload.hasArgument) globalThis.$argument = payload.argument;
else Reflect.deleteProperty(globalThis, "$argument");

const mod = await import(payload.entry);
const result = payload.exportMode === "module" ? { $argument: mod.$argument, argument: mod.argument } : globalThis.$argument;

process.stdout.write(JSON.stringify({ result, globalArgument: globalThis.$argument }));
