import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { FormGroup , FormControl, ControlLabel } from 'react-bootstrap';
import LoaderButton from '../../components/LoaderButton';
import { invokeApig, s3Upload } from '../../libs/aws-lib';
import config from '../../config';
import './NewNote.css';

class NewNote extends Component {
  file = null;
  state = {
    isLoading: null,
    content: '',
    isSubmitted: null,
  };

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = ({ target: { id, value } }) => {
    this.setState({
      [id]: value,
    });
  };

  handleFileChange = ({ target: { files } }) => {
    this.file = files[0];
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000}MB`);
      return;
    }

    this.setState({ isLoading: true });

    try {
      const attachment = this.file
        ? (await s3Upload(this.file)).Location
        : null;

      await this.createNote({ content: this.state.content, attachment });
      this.setState({ isSubmitted: true });
    } catch(e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  };

  createNote(note) {
    return invokeApig({
      path: '/notes',
      method: 'POST',
      body: note,
    });
  }

  render() {
    const { isLoading, content, isSubmitted } = this.state;

    if (isSubmitted) {
      return <Redirect to="/" />;
    }

    return (
      <div className="NewNote">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={content}
              componentClass="textarea"
            />
          </FormGroup>
          <FormGroup controlId="file">
            <ControlLabel>Attachment</ControlLabel>
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Create"
            loadingText="Creating..."
          />
        </form>
      </div>
    );
  }
}

export default NewNote;
