import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import Home from './containers/Home';
import Login from './containers/Login';
import NotFound from './containers/NotFound';

export default ({ childProps }) => (
  <Switch>
    <AppliedRoute exact path='/' component={Home} props={childProps} />
    <AppliedRoute exact path='/login' component={Login} props={childProps} />
    <Route component={NotFound} />
  </Switch>
)
