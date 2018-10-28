/* @flow */

import React from 'react';

// Popover Imports
import { isTablet } from './Utility'
import PopoverNavigation from './PopoverNavigation'
import PopoverStackView from './PopoverStackView';

// RN Imports
import {
  createNavigator,
  createKeyboardAwareNavigator,
  StackRouter,
  createNavigationContainer
} from 'react-navigation';

export function withPopoverNavigation(Comp, popoverOptions) {
  class PopoverNavigationInner extends React.Component {
    static router = Comp.router
    render() {
      let props = Comp.router ? { navigation: this.props.navigation, screenProps: this.props.screenProps } : this.props;
      return (
        <PopoverNavigation {...popoverOptions} showInPopover={popoverOptions.isFirstView ? false : props.screenProps.showInPopover}><Comp {...props} /></PopoverNavigation>
      )
    }
  }
  return PopoverNavigationInner;
}

function createPopoverStackNavigator(routeConfigMap, stackConfig = {}) {
  const {
    initialRouteKey,
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
    disableKeyboardHandling,
    getCustomActionCreators,
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteKey,
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
    getCustomActionCreators,
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

  return Navigator;
}

createPopoverStackNavigator.registeredViews = {};
createPopoverStackNavigator.registerRefForView = (ref, view) => {
  createPopoverStackNavigator.registeredViews[view] = ref;
}

export default createPopoverStackNavigator;

