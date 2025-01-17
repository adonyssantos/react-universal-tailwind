import {
  forwardRef,
  createElement,
  type ComponentType,
  type Ref,
  type ForwardRefExoticComponent,
  useMemo,
} from 'react';
import { StyleSheet, type StyleProp, type Touchable } from 'react-native';
import { AnyStyle } from '@universal-labs/css';
import { useChildren } from '../hooks/useChildren';
import { useComponentInteractions } from '../hooks/useComponentInteractions';
import { useComponentRegistry } from '../hooks/useComponentRegistry';
import { useCssToRN } from '../hooks/useCssToRN';
import type {
  Primitive,
  StyledComponentProps,
  TemplateFunctions,
} from '../types/styled.types';
import { buildCSSString } from '../utils/buildCssString';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { type VariantProps, type VariantsConfig, createVariants } from './variants';

// Readapted from @Sharcoux https://github.com/Sharcoux/rn-css
function styledComponentsFactory<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & Props & StyledComponentProps>)[]
  ): ForwardRefExoticComponent<Props & S & StyledComponentProps & { ref?: Ref<any> }> {
    const ForwardRefComponent = forwardRef<any, S & Props>(
      (props: S & Props & StyledComponentProps, ref) => {
        const classNames = buildCSSString(chunks, functions, props);
        const { stylesheet, componentID } = useCssToRN(classNames);

        const { component, parentComponent, currentGroupID } = useComponentRegistry({
          componentID,
          groupID: props.groupID,
          isGroupParent: stylesheet.metadata.isGroupParent,
          parentID: props.parentID,
        });

        const { componentInteractionHandlers, focusHandlers } = useComponentInteractions({
          props: props as Touchable,
          hasGroupInteractions: stylesheet.metadata.hasGroupEvents,
          hasPointerInteractions: stylesheet.metadata.hasPointerEvents,
          isGroupParent: stylesheet.metadata.isGroupParent,
          id: componentID,
        });

        const componentChilds = useChildren(
          props.children,
          componentID,
          stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
          stylesheet.getChildStyles,
        );

        const componentStyles = useMemo(() => {
          const styles: AnyStyle = stylesheet.getStyles({
            isParentActive:
              parentComponent.active || parentComponent.focus || parentComponent.hover,
            isPointerActive:
              component.interactionState.active ||
              component.interactionState.focus ||
              component.interactionState.hover,
          });
          return StyleSheet.create({
            generated: {
              ...styles,
              //@ts-expect-error
              ...props.style,
            },
          }).generated;
        }, [component.interactionState, stylesheet, parentComponent, props.style]);

        // const start = performance.now();
        const newProps = {
          ...props,
        };
        Reflect.deleteProperty(newProps, 'className');
        Reflect.deleteProperty(newProps, 'tw');
        // console.log('TOOK: ', performance.now() - start);
        return createElement(Component, {
          ...newProps,
          style: componentStyles,
          ref,
          children: componentChilds,
          groupID: currentGroupID,
          ...focusHandlers,
          ...componentInteractionHandlers,
        });
      },
    );
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    return ForwardRefComponent as any;
  }

  styledComponent.variants = <TConfig,>(config?: VariantsConfig<TConfig>) => {
    const classNamesGenerator = createVariants(config!);
    // @ts-expect-error
    const ComponentWithVariants = styledComponent`${(props) => classNamesGenerator(props)}`;

    // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
    const ForwardRefComponent = forwardRef<
      any,
      VariantProps<typeof classNamesGenerator> & StyledComponentProps & Props
    >((props, ref) => {
      return <ComponentWithVariants ref={ref} {...(props as Props)} />;
    });
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    return ForwardRefComponent;
  };

  // provide styled(Comp).attrs({} | () => {}) feature
  // styledComponent.attrs =
  //   <Part, Result extends Partial<Props & Part> = Partial<Props & StyledProps & Part>>(
  //     opts: Result | ((props: Props & Part) => Result),
  //   ) =>
  //   (
  //     chunks: TemplateStringsArray,
  //     ...functions: (Primitive | TemplateFunctions<Props & Part>)[]
  //   ) => {
  //     const ComponentWithAttrs = styledComponent(chunks, ...functions);
  //     // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
  //     const ForwardRefComponent = forwardRef<
  //       any,
  //       Omit<Props, keyof Result> &
  //         StyledProps &
  //         Part &
  //         Partial<Pick<Props, Extract<keyof Props, keyof Result>>>
  //     >((props, ref) => {
  //       const attrs = opts instanceof Function ? opts(props as Props & Part) : opts;
  //       return <ComponentWithAttrs ref={ref} {...(props as Props & Part)} {...attrs} />;
  //     });
  //     if (__DEV__) {
  //       ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
  //     }
  //     // TODO : Find a way to remove from the Props the properties affected by opts
  //     return ForwardRefComponent;
  //   };

  return styledComponent;
}

export default styledComponentsFactory;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
