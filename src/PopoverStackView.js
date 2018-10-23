import React from 'react';
import { NativeModules } from 'react-native';
import { popoverTransitionConfig, isTablet } from './Utility';
import {
  StackViewLayout,
  Transitioner,
  StackViewTransitionConfigs as TransitionConfigs
} from 'react-navigation-stack';
import { StackActions } from 'react-navigation';

const NativeAnimatedModule =
  NativeModules && NativeModules.NativeAnimatedModule;

export default class PopoverStackView extends React.Component {
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
