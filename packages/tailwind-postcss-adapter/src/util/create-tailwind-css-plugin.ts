import type { AcceptedPlugin } from 'postcss';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

export const createTailwindcssPlugin = (props: {
  config?: TailwindConfig;
  content: string;
}): AcceptedPlugin => {
  const tailwindConfig = resolveConfig(props.config ?? {});
  const tailwindcssPlugin = processTailwindFeatures(
    (processOptions) => () =>
      processOptions.createContext(tailwindConfig, [{ content: props.content }]),
  );
  return tailwindcssPlugin;
};
