// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/georeferenceRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Georeference consistency rule (schema v2.3.0).
 *
 * Dependency-free, like the lifecycle and estate-change rules, because it is emitted
 * into the shared validator (`schemas/realm/.shared/validator/core/georeference-rules.mjs`)
 * so the published validator, the MCP server and `rl check` agree. Edit this file; the
 * `.mjs` is generated.
 *
 *   gps-position-without-georeference   an entity says its position came from a
 *                                        satellite fix, in a model whose coordinate
 *                                        system declares no WGS84 origin. Nothing can
 *                                        convert such a fix, so the source claims a
 *                                        provenance the model cannot honour. WARNING.
 *
 * The rule joins an entity to the root file, which the declarative rule pack cannot
 * express, hence code. It takes the coordinate system as a parameter rather than
 * finding it, because each runner (validator shim, `rl check`, MCP) already holds the
 * root document under its own name.
 */
/** Whether a coordinate system declares a usable WGS84 origin. */
export function hasWgs84Origin(coordinateSystem) {
    if (!coordinateSystem || typeof coordinateSystem !== 'object')
        return false;
    const origin = coordinateSystem['origin_wgs84'];
    if (!origin || typeof origin !== 'object')
        return false;
    const { latitude, longitude } = origin;
    return typeof latitude === 'number' && typeof longitude === 'number';
}
export function checkGeoreferenceRules(entities, coordinateSystem) {
    const findings = [];
    if (hasWgs84Origin(coordinateSystem))
        return findings;
    for (const [id, entity] of entities) {
        if (entity.data['position_source'] !== 'gps')
            continue;
        findings.push({
            severity: 'warning',
            rule: 'gps-position-without-georeference',
            entity: id,
            message: 'position_source is "gps" but coordinate_system declares no origin_wgs84, so nothing can convert the fix; declare the origin or record the source as "estimated"',
        });
    }
    return findings;
}
//# sourceMappingURL=georeferenceRules.js.map