import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useStore } from '@react-universal/core';

const useComponentRegistration = (id: string, className: string) => {
  const registerComponent = useStore((state) => state.components.registerComponent);
  const unRegisterComponent = useStore((state) => state.components.unregisterComponent);
  const component = useStore((state) => state.components.registeredComponents.get(id));
  console.log('COMPONENT: ', component);
  const finalStyles = useMemo(() => {
    if (!component?.styles) return {};
    const interactionStyles = component.interactionStyles;
    const hoverStyle = interactionStyles.get('hover')?.styles;
    return {
      ...component.styles,
      ...(component.componentState.hover ? hoverStyle : {}),
    };
  }, [component?.styles, component?.componentState, component?.interactionStyles]);

  useEffect(() => {
    registerComponent({ id, className });
    return () => {
      unRegisterComponent(id);
    };
  }, [id, unRegisterComponent, registerComponent, className]);

  return {
    style: finalStyles,
  };
};

export { useComponentRegistration };