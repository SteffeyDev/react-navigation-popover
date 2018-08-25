import { createNavigationContainer } from 'react-navigation';
import createPopoverStackNavigator from './createPopoverStackNavigator.js';

const createContainedPopoverStackNavigator = (routeConfigs, config = {}) => {
  const navigator = createPopoverStackNavigator(routeConfigs, config);
  return createNavigationContainer(navigator);
};

createContainedPopoverStackNavigator.registeredViews = {};
createContainedPopoverStackNavigator.registerRefForView = (ref, view) => {
  createPopoverStackNavigator.registeredViews[view] = ref;
}

export default createContainedPopoverStackNavigator;
