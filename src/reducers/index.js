import { combineReducers } from 'redux';
import auth from './auth';
import navigation from './navigation';
import alerts from './alerts';
import analytics from './analytics';

export default combineReducers({
  alerts,
  auth,
  navigation,
  analytics,
});
