import React, { Component } from 'react';
import { AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import config from '../../config';
import { HelpBlock, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import LoaderButton from '../../components/LoaderButton';
import './Signup.css';

class Signup extends Component {
  state = {
    isLoading: false,
    email: '',
    password: '',
    confirmPassword: '',
    confirmationCode: '',
    newUser: null,
  };

  validateForm() {
    const { email, password, confirmPassword } = this.state;

    return email.length > 0 && password.length > 0 && password === confirmPassword;
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleChange = ({ target: { id, value }}) => {
    this.setState({
      [id]: value
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const { email, password } = this.state;

    this.setState({ isLoading: true });

    try {
      const newUser = await this.signup(email, password);
      this.setState({ newUser });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async (event) => {
    event.preventDefault();

    const { newUser, confirmationCode, email, password } = this.state;

    this.setState({ isLoading: true });

    try {
      await this.confirm(newUser, confirmationCode);
      await this.authenticate(newUser, email, password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  signup(email, password) {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID,
    });

    return new Promise((resolve, reject) =>
      userPool.signUp(email, password, [], null,
        (err, result) => err ? reject(err) : resolve(result.user))
    );
  }

  confirm(user, confirmationCode) {
    return new Promise((resolve, reject) =>
      user.confirmRegistration(confirmationCode, true,
        (err, result) => err ? reject(err) : resolve(result))
    );
  }

  authenticate(user, email, password) {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    return new Promise((resolve, reject) =>
      user.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(),
        onFailure: err => reject(err),
      })
    );
  }

  renderConfirmationForm() {
    const { confirmationCode, isLoading } = this.state;
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={confirmationCode}
            onChange={this.handleChange}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={isLoading}
          text="Verify"
          loadingText="Verifying..."
        />
      </form>

    )
  }

  renderForm() {
    const { email, password, confirmPassword, isLoading } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={email}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={password}
            onChange={this.handleChange}
            type="password"
          />
        </FormGroup>
        <FormGroup controlId="confirmPassword" bsSize="large">
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
            value={confirmPassword}
            onChange={this.handleChange}
            type="password"
          />
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateForm()}
          type="submit"
          isLoading={isLoading}
          text="Signup"
          loadingText="Signing up..."
        />
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()
        }
      </div>
    )
  }
}

export default Signup;
