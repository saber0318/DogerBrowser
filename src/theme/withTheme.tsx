import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {ThemeConsumer, ThemeProps} from './ThemeProvider';
import LightTheme from './LightTheme';

const isClassComponent = (Component: any) =>
  Boolean(Component?.prototype?.isReactComponent);

const isFunctionComponent = (Component: any) => typeof Component === 'function';

const isForwardRefRenderFunction = (Component: any) =>
  typeof Component === 'object';

export interface ThemedComponent {
  displayName: string;
}

const ThemedComponent = (
  WrappedComponent: any,
  themeKey?: string,
  displayName?: string,
) => {
  return Object.assign(
    (props: any, forwardedRef: any) => {
      const {children, ...rest} = props;

      return (
        <ThemeConsumer>
          {context => {
            // If user isn't using ThemeProvider
            if (!context) {
              const newProps = {...rest, theme: LightTheme, children};
              if (isClassComponent(WrappedComponent)) {
                return <WrappedComponent ref={forwardedRef} {...newProps} />;
              }
              if (isFunctionComponent(WrappedComponent)) {
                return <WrappedComponent {...newProps} />;
              }
              if (isForwardRefRenderFunction(WrappedComponent)) {
                return <WrappedComponent ref={forwardedRef} {...newProps} />;
              }
              return null;
            }
            const {theme, changeTheme} = context;
            const newProps = {
              theme,
              changeTheme,
              themeKey,
              clone: false,
              ...rest,
              children,
            };
            if (isClassComponent(WrappedComponent)) {
              return <WrappedComponent ref={forwardedRef} {...newProps} />;
            }
            if (isFunctionComponent(WrappedComponent)) {
              return <WrappedComponent {...newProps} />;
            }
            if (isForwardRefRenderFunction(WrappedComponent)) {
              return <WrappedComponent ref={forwardedRef} {...newProps} />;
            }
            return null;
          }}
        </ThemeConsumer>
      );
    },
    {displayName: displayName},
  );
};

function withTheme<P = {}>(
  WrappedComponent: React.ComponentType<P & Partial<ThemeProps>>,
  themeKey?: string,
) {
  const name = themeKey
    ? `Themed.${themeKey}`
    : `Themed.${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
      }`;

  const Component = ThemedComponent(WrappedComponent, themeKey, name);

  if (isClassComponent(WrappedComponent)) {
    return hoistNonReactStatics(React.forwardRef(Component), WrappedComponent);
  }
  if (isForwardRefRenderFunction(WrappedComponent)) {
    return hoistNonReactStatics(React.forwardRef(Component), WrappedComponent);
  }
  return Component;
}

export default withTheme;
