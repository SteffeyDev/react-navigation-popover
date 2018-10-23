## react-native-popover-view

[![npm version](http://img.shields.io/npm/v/react-navigation-popover.svg?style=flat-square)](https://npmjs.org/package/react-navigation-popover "View this project on npm")
[![npm version](http://img.shields.io/npm/dm/react-navigation-popover.svg?style=flat-square)](https://npmjs.org/package/react-navigation-popover "View this project on npm")
[![npm licence](http://img.shields.io/npm/l/react-navigation-popover.svg?style=flat-square)](https://npmjs.org/package/react-navigation-popover "View this project on npm")

This allows the popover view from [react-native-popover-view](https://github.com/SteffeyDev/react-native-popover-view) to be used with [React Navigation](https://reactnavigation.org), just like the Stack Navigator, Drawer Navigator, and others.

It works by modifying the stack navigator to show the child views in a popover if desired, which is great for making your app adaptable to tablets, where full-screen views in a stack can be a bit much.

See the documentation for [react-native-popover-view](https://github.com/SteffeyDev/react-native-popover-view) for details on how the `Popover` component itself works.

This project is not officially affiliated with React Navigation, but integrates well and borrows code from [react-navigation-stack](https://github.com/react-navigation/react-navigation-stack).  Thanks to all the guys at React Navigation for all the work they do.

##### Table of Contents
* [Demo](#demo)
* [Installation](#installation)
* [Usage with React Navigation](#rn)
  * [Setup](#setup)
  * [Example](#rn-example)
  * [Advanced Usage](#advanced)
* [Contributing](#contributing)

## <a name="demo"/>Demo App

You can play around with the various features using [the Expo test app](https://expo.io/@steffeydev/popover-view-test-app).
Source Code: [react-native-popover-view-test-app](https://github.com/SteffeyDev/react-native-popover-view-test-app)

## <a name="installation"/>Installation

```shell
npm i react-navigation-popover
```
or
```shell
yarn add react-navigation-popover
```

## <a name="rn"/>Usage with React Navigation

### Support

* `react-navigation-popover` v1.0.x supports `react-navigation` v2.12.0 and forwards
* For older versions of `react-navigation`, instead install `react-native-popover-view` v1.0.5 or ealier, and use the documentation at that repository for the corresponding tag

If `react-navigation` changes in a future versions and breaks compatibility with this library, please open an issue.

### <a name="setup"/>Basic Setup


#### 1) Change `createStackNavigator` to `createPopoverStackNavigator`

`createPopoverStackNavigator` is a drop-in replacement for react-navigation's `createStackNavigator`.  It assumes the first view in your `routeConfigMap` is the base view, and every other view should be shown in a Popover when the `showInPopover` prop is `true` (see step #2).
You can pass a few (optional) per-screen options through your `routeConfigMap` or globally through your `stackConfig`:

Option      | Type              | Default                | Description
----------- | ----------------- | ---------------------- | --------------
`placement` | PLACEMENT_OPTIONS | PLACEMENT_OPTIONS.AUTO | Passed through to `Popover`.
`contentContainerStyle` | number        | {width: 380}   | The style for the internal view that wraps the `Popover`.
`showInModal`   | boolean       | true                   | Passed through to `Popover`. If you want to stack multiple `Popover`'s, only the bottom one can be shown in a `Modal` on iOS.
`showBackground` | boolean      | true                   | Passed through to `Popover`
`arrowStyle` | object           | {}                     | Passed through to `Popover`
`popoverStyle` | object           | {}                   | Passed through to `Popover`
`animationConfig` | object           |                   | Passed through to `Popover`
`verticalOffset` | number           | 0                 | Passed through to `Popover`

Note: If you pass a value through the `stackConfig`, and pass the same option for an individual screen, the value passed for the screen overrides.

Example:
```jsx
import createPopoverStackNavigator from 'react-navigation-popover';

let stack = createPopoverStackNavigator({
  BaseView: {
    screen: BaseView,
    navigationOptions: {
      title: 'BaseView',
      ...otherOptions
    }
  },
  ModalView: {
    screen: ModalView,
    navigationOptions: {
      title: 'ModalView',
      ...otherOptions // You'll probably want to pass in your header style's here
    },
    popoverOptions: {
      placement: Popover.PLACEMENT_OPTIONS.BOTTOM,
      showBackground: true // Remember: this overrides the global popoverOptions passed in below
    }
  }
}, 
{
  mode: 'modal',
  popoverOptions: {
    showBackground: false,
    contentContainerStyle: {
      width: 500,
      ...otherStyles // These can be any styles you'd normally apply to a view
    }
  }
});
```

#### 2) Define when Popover should be shown

By default, views will be shown in a Popover view on tablets, and normally on phones.  To override this behavior, you can pass the `showInPopover` option in the `screenProps` to the class returned by `createPopoverStackNavigator`:

```jsx
let Stack = createPopoverStackNavigator(...);
...
  render() {
    let smallScreen = this.props.width < 500;
    return <Stack screenProps={{ showInPopover: !smallScreen }} />;
  }
```

This sort of width-based test is needed if your app can be launched in split-screen mode on tablets, because the default value is always `true` on tablets regardless of the actual display width of your app.

#### 3) (Optional) Set Popover Source

There are several ways to make sure the `Popover` shows from the button that triggered it:

##### I. (Recommended) Register Refs for Views

You can register the button as the source of the `Popover` for a particular route.  Check out this example:

We first register the ref for a view:
```jsx
<TouchableHighlight ref={ref => createPopoverStackNavigator.registerRefForView(ref, 'View1')} {...otherProps} />
```
Then, if `View1` is a route name in a `createPopoverStackNavigator`...
```jsx
import View1 from './views/View1';
...
let stack = createPopoverStackNavigator({
  View1: {
    screen: View1,
    navigationOptions: navOptions
  }
}, options);
```

When we navigate to the view, the `Popover` will originate from the associated `TouchableHighlight`:
```jsx
this.props.navigation.navigate('View1', params);
```

You can register any type of view, not only a `TouchableHighlight`, and the `Popover` will point to the outside of the bounds of that view.

Note: The map is stored statically, so you cannot register two views with the same name, even if they are in different `createPopoverStackNavigator`'s.  

##### II. Send showFromView

If you need even more fine-grained control, such as wanting to open the same child but have it originate from different views at different times, you can pass the `showFromView` param in your `navigate` call:

```js
this.props.navigation.navigate('View1', {showFromView: this.storedView});
```
where `this.storedView` is a ref of a component (obtained through a `ref` callback).

##### III. Use a Custum Rect
See "Show Popover from custom rect" in the Advanced Usage section below.

### <a name="rn-example"/>Full Example

```jsx
import React, { Component } from 'react';
import createPopoverStackNavigator from 'react-navigation-popover';
import { MoreHeaderView, ExtraInfoView, MoreOptionView } from './myOtherViews';
import { Colors } from './Colors';
import DeviceInfo from 'react-native-device-info';

class MoreView extends Component {
  render() {
    return (
      <View style={styles.viewStyle}>
        <MoreHeaderView />
        <View>
          <TouchableHighlight
            style={styles.buttonStyle} 
            ref={touchable => createPopoverStackNavigator.registerRefForView(touchable, 'About')} 
            onPress={() => this.props.navigation.navigate('About')}>
            <Text>About the App</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.buttonStyle} 
            ref={touchable => createPopoverStackNavigator.registerRefForView(touchable, 'Settings')} 
            onPress={() => this.props.navigation.navigate('Settings')}>
            <Text>Content Settings</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.buttonStyle} 
            ref={touchable => createPopoverStackNavigator.registerRefForView(touchable, 'Account')} 
            onPress={() => this.props.navigation.navigate('Account')}>
            <Text>Account Details</Text>
          </TouchableHighlight>
        </View>
        <ExtraInfoView />
      </View>
    )
  }
}

let MoreStack = createPopoverStackNavigator({
  MoreView: {
    screen: MoreView,
    navigationOptions: {title: 'More'}
  },
  About: {
    screen: AboutView,
    navigationOptions: {title: 'About', ...styles.headerStyle}
  },
  Settings: {
    screen: SettingsView,
    navigationOptions: {title: 'Settings', ...styles.headerStyle}
  },
  Account: {
    screen: AccountView,
    navigationOptions: {title: 'About', ...styles.headerStyle}
  },
}, {
  headerMode: 'screen'
});

export default class MoreStackWrapper extends Component {
  state = { width: DeviceInfo.getInitialWidth() }
  render() {
    return (
      <View
        style={styles.fullScreenViewStyle} 
        onLayout={evt => this.setState({width: evt.nativeEvent.layout.width})}>
        <MoreStack screenProps={{ showInPopover: DeviceInfo.isTablet() && this.state.width > 500 }} />
      </View>
    );
  }
}

let styles = {
  buttonStyle: {
    width: 100,
    height: 40,
    marginBottom: 50
  },
  viewStyle: {
    alignItems: 'center'
  },
  headerStyle: {
    headerStyle: {
      backgroundColor: Colors.backgroundColor
    },
    headerTintColor: Colors.tintColor,
    headerTitleStyle: {
      color: Colors.headerTextColor
    }
  },
  fullScreenViewStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
}
```
### <a name="advanced"/>Advanced Usage

#### Custumize Display Area used by Popovers

By default, Popover's will query RN's `SafeAreaView` to get the allowed display area on the device, and then add a 10pt padding around all the edges, and set this as the display area.  If you want to inject a custum display area to a specific popover, you can do so either through the `createPopoverStackNavigator`'s `RouteConfigs` or through params in the `navigate` call:

```jsx
let Stack = createPopoverStackNavigator({
  View1: {
    screen: 'View1',
    popoverOptions: {
      displayArea: new Rect(0, 0, 50, 50)
    },
    ...otherOptions
  },
  ...otherViews
}, options);
```
OR
```jsx
this.props.navigation.navigate('View1', {displayArea: new Rect(0, 0, 50,50)});
```

#### Show Popover from custom rect

There may be situations in which you want to show a `Popover` with a custom fromRect, not tied to any view.  Instead of using `createPopoverStackNavigator.registerRefForView`, you can pass in a custom `fromRect` as params to the `navigate()` call.  For example:
```jsx
import { Rect } from 'react-navigation-popover';
...
  this.props.navigation.navigate('NextView', {fromRect: new Rect(10, 10, 40, 20), ...otherParams});
```

If the rect uses variables that could change when the display area changes, you should instead use `calculateRect`, and pass in a function that will return the rect.  For example, if your popover originates from a button that is always centered, regardless of screen size, you could use the following:
```jsx
import { Rect } from 'react-navigation-popover';
...
  this.props.navigation.navigate('NextView', {calculateRect: () => new Rect(this.state.width/2 - 20, 50, 40, 20), ...otherParams});
```
Now, if your app is put into split-screen mode while the popover is still showing, `calculateRect` will be called again, and the popover will shift to point to the new rect.

## <a name="contributing">Contributing

Pull requests are welcome; if you find that you are having to bend over backwards to make this work for you, feel free to open an issue or PR!  Of course, try to keep the same coding style if possible and I'll try to get back to you as soon as I can.

---

**MIT Licensed**
