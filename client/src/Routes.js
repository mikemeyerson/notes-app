import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import Home from './containers/Home';
import Login from './containers/Login';
import Signup from './containers/Signup';
import NewNote from './containers/NewNote';
import Notes from './containers/Notes';
import NotFound from './containers/NotFound';

export default ({ childProps }) => (
  <Switch>
    <AppliedRoute exact path='/' component={Home} props={childProps} />
    <AppliedRoute exact path='/login' component={Login} props={childProps} />
    <AppliedRoute exact path="/signup" component={Signup} props={childProps} />
    <AppliedRoute exact path="/notes/new" component={NewNote} props={childProps} />
    <AppliedRoute exact path="/notes/:id" component={Notes} props={childProps} />
    <Route component={NotFound} />
  </Switch>
)
