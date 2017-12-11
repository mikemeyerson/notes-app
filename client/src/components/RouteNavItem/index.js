import React from 'react';
import { Route } from 'react-router-dom';
import { NavItem } from 'react-bootstrap';

export default ({ children, ...props }) => (
  <Route exact path={props.href}>
    {({ match, history }) => (
      <NavItem
        onClick={(e) => history.push(e.currentTarget.getAttribute('href'))}
        {...props}
        active={Boolean(match)}
      >
        {children}
      </NavItem>
    )}
  </Route>
);
