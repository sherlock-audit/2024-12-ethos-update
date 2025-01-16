import { type MetaFunction, type MetaDescriptor } from '@remix-run/node';

export function mergeMeta<Loader>(
  overrideFn: MetaFunction<Loader>,
  appendFn?: MetaFunction<Loader>,
): MetaFunction<Loader> {
  return (arg) => {
    // get meta from parent routes
    let mergedMeta = arg.matches.reduce<MetaDescriptor[]>((acc, match) => {
      return acc.concat(match.meta || []);
    }, []);

    // replace any parent meta with the same name or property with the override
    const overrides = overrideFn(arg);

    for (const override of overrides) {
      const index = mergedMeta.findIndex(
        (meta) =>
          ('name' in meta && 'name' in override && meta.name === override.name) ||
          ('property' in meta && 'property' in override && meta.property === override.property) ||
          ('title' in meta && 'title' in override),
      );

      if (index !== -1) {
        mergedMeta.splice(index, 1, override);
      }
    }

    // append any additional meta
    if (appendFn) {
      mergedMeta = mergedMeta.concat(appendFn(arg));
    }

    return mergedMeta;
  };
}
