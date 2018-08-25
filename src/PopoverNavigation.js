import Popover from 'react-native-popover-view'
import { popoverTransitionConfig, Rect, isIOS, isTablet } from './Utility'
import React, { Component } from 'react'
import { View, BackHandler, Animated, findNodeHandle, NativeModules, Alert } from 'react-native'
import PropTypes from 'prop-types'

export default class PopoverNavigation extends Component {
  static navigationOptions = {}

  state = {
    visible: false,
  }

  getParam(param:string) {
    if (this.props.children.props.navigation.state.params)
      return this.props.children.props.navigation.state.params[param];
    else
      return null;
  }

  goBack() {
    if (this.props.showInPopover)
      this.setState({visible: false});
    else
      this.props.children.props.navigation.goBack();
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backButtonPressed);
    this.setState({visible: true});
  }

  backButtonPressed = () => {
    this.goBack();
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backButtonPressed);
  }

  render() {
    const child = React.cloneElement(this.props.children, {goBack: () => this.goBack()});
    const { contentContainerStyle, popoverStyle, arrowStyle, placement, showInModal, layoutRtl, showBackground, getRegisteredView, displayArea, showInPopover, backgroundColor, animationConfig, verticalOffset } = this.props;

    if (showInPopover) {
      return (
        <Popover
          arrowStyle={arrowStyle}
          popoverStyle={popoverStyle}
          placement={placement}
          showInModal={showInModal}
          layoutRtl={layoutRtl}
          showBackground={showBackground}
          animationConfig={animationConfig}
          isVisible={this.state.visible}
          onClose={() => this.goBack()}
          displayArea={displayArea || this.getParam('displayArea')}
          doneClosingCallback={() => this.props.children.props.navigation.goBack()}
          verticalOffset={verticalOffset}
          fromView={getRegisteredView() || this.getParam('showFromView')}
          calculateRect={this.getParam('calculateRect')}
          fromRect={this.getParam('fromRect')}>
          <View style={{backgroundColor, ...contentContainerStyle}}>{child}</View>
        </Popover>
      )
    } else {
      return <View style={{backgroundColor, flex: 1}}>{child}</View>;
    }
  }
}



PopoverNavigation.defaultProps = {
  contentContainerStyle: {width: 380},
  showInPopover: true
}

PopoverNavigation.propTypes = {
  arrowSize: PropTypes.objectOf(PropTypes.number),
  placement: PropTypes.oneOf([Popover.PLACEMENT_OPTIONS.LEFT, Popover.PLACEMENT_OPTIONS.RIGHT, Popover.PLACEMENT_OPTIONS.TOP, Popover.PLACEMENT_OPTIONS.BOTTOM, Popover.PLACEMENT_OPTIONS.AUTO]),
  showInModal: PropTypes.bool,
  layoutRtl: PropTypes.bool,
  showBackground: PropTypes.bool,
  contentContainerStyle: PropTypes.object,
  displayArea: PropTypes.objectOf(PropTypes.number),
  showInPopover: PropTypes.bool,
  popoverStyle: PropTypes.object,
  arrowStyle: PropTypes.object,
  animationConfig: PropTypes.object,
  verticalOffset: PropTypes.number
}
