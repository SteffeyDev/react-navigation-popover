/* @flow */

// React Imports
import * as React from 'react';
import { NativeModules } from 'react-native';

// Popover Imports
import { popoverTransitionConfig, isTablet } from './Utility'
import PopoverNavigation from './PopoverNavigation'

// RN Imports
import {
  createNavigator,
  createKeyboardAwareNavigator,
  StackRouter,
  StackActions
} from 'react-navigation';

import {
  StackView,
  StackViewLayout,
  Transitioner,
  StackViewTransitionConfigs as TransitionConfigs
} from 'react-navigation-stack';

export let withPopoverNavigation = (Comp, popoverOptions) => props => <PopoverNavigation {...popoverOptions} showInPopover={popoverOptions.isFirstView ? false : props.screenProps.showInPopover}><Comp {...props} /></PopoverNavigation>;

const NativeAnimatedModule =
  NativeModules && NativeModules.NativeAnimatedModule;

class PopoverStackView extends React.Component {
  static defaultProps = {
    navigationConfig: {
      mode: 'card',
    },
  };

  render() {
    return (
      <Transitioner
        render={this._render}
        configureTransition={this._configureTransition}
        screenProps={this.props.screenProps}
        navigation={this.props.navigation}
        descriptors={this.props.descriptors}
        onTransitionStart={
          this.props.onTransitionStart ||
          this.props.navigationConfig.onTransitionStart
        }
        onTransitionEnd={(transition, lastTransition) => {
          const { navigationConfig, navigation } = this.props;
          const onTransitionEnd =
            this.props.onTransitionEnd || navigationConfig.onTransitionEnd;
          if (transition.navigation.state.isTransitioning) {
            navigation.dispatch(
              StackActions.completeTransition({
                key: navigation.state.key,
              })
            );
          }
          onTransitionEnd && onTransitionEnd(transition, lastTransition);
        }}
      />
    );
  }

  _shouldShowInPopover = () => this.props.screenProps && this.props.screenProps.showInPopover !== undefined
                                ? this.props.screenProps.showInPopover
                                : isTablet()

  _configureTransition = (transitionProps, prevTransitionProps) => {
    return {
      ...TransitionConfigs.getTransitionConfig(
        this._shouldShowInPopover() ? popoverTransitionConfig : this.props.navigationConfig.transitionConfig,
        transitionProps,
        prevTransitionProps,
        this.props.navigationConfig.mode === 'modal'
      ).transitionSpec,
      useNativeDriver: !!NativeAnimatedModule,
    };
  };

  _render = (transitionProps, lastTransitionProps) => {
    const { screenProps, navigationConfig } = this.props;
    const { headerMode, cardStyle, transitionConfig, ...remainingNavigationConfig } = navigationConfig;
    return (
      <StackViewLayout
        {...remainingNavigationConfig}
        headerMode={this._shouldShowInPopover() ? 'screen' : headerMode}
        cardStyle={this._shouldShowInPopover() ? {...cardStyle, backgroundColor: 'transparent'} : cardStyle}
        transitionConfig={this._shouldShowInPopover() ? popoverTransitionConfig : transitionConfig}
        onGestureBegin={this.props.onGestureBegin}
        onGestureCanceled={this.props.onGestureCanceled}
        onGestureEnd={this.props.onGestureEnd}
        screenProps={screenProps}
        descriptors={this.props.descriptors}
        transitionProps={transitionProps}
        lastTransitionProps={lastTransitionProps}
      />
    );
  };
}

function createPopoverStackNavigator(routeConfigMap, stackConfig = {}) {
  const {
    initialRouteKey,
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
    disableKeyboardHandling,
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteKey,
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
  };

  let routeKeys = Object.keys(routeConfigMap);
  let newRouteConfigMap = {};
  let displayArea = {
    width: 0,
    height: 0
  };

  routeKeys.forEach((route, i) => {
    let getRegisteredView = () => createPopoverStackNavigator.registeredViews.hasOwnProperty(route) ? createPopoverStackNavigator.registeredViews[route] : null;
    newRouteConfigMap[route] = Object.assign({}, 
      routeConfigMap[route], 
      { 
        screen: withPopoverNavigation(routeConfigMap[route].screen, Object.assign({}, 
          stackConfig.popoverOptions,
          routeConfigMap[route].popoverOptions, 
          {
            isFirstView: i === 0,
            getRegisteredView, 
            backgroundColor: stackConfig.cardStyle ? stackConfig.cardStyle.backgroundColor : (i > 0 ? 'white' : '#E9E9EF')
          }
        )),
        navigationOptions: (ops) => {
          const userNavigationOptions = routeConfigMap[route].navigationOptions;
          let additionalNavigationOptions = null;
          if (userNavigationOptions) {
            if (typeof userNavigationOptions === "function")
              additionalNavigationOptions = userNavigationOptions(ops);
            else if (typeof userNavigationOptions === "object")
              additionalNavigationOptions = userNavigationOptions;
          }
          return i > 0 && ops.screenProps && ops.screenProps.showInPopover
            ? Object.assign({}, additionalNavigationOptions, {header: null})
            : additionalNavigationOptions;
        }
      }
    );
  });

  const router = StackRouter(newRouteConfigMap, stackRouterConfig);

  // Create a navigator with PopoverStackView as the view
  let Navigator = createNavigator(PopoverStackView, router, stackConfig);
  if (!disableKeyboardHandling) {
    Navigator = createKeyboardAwareNavigator(Navigator, stackConfig);
  }

  return createNavigationContainer(Navigator);
}

createPopoverStackNavigator.registeredViews = {};
createPopoverStackNavigator.registerRefForView = (ref, view) => {
  createPopoverStackNavigator.registeredViews[view] = ref;
}

export default createPopoverStackNavigator;

