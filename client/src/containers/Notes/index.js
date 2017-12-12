import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import config from '../../config';
import { invokeApig, s3Upload, s3Delete } from '../../libs/aws-lib';
import LoaderButton from '../../components/LoaderButton';

class Notes extends Component {
  file = null;
  state = {
    isLoading: null,
    isDeleting: null,
    note: null,
    content: '',
    redirectToHome: null,
  };

  async componentDidMount() {
    try {
      const results = await this.getNote();
      this.setState({
        note: results,
        content: results.content,
      });
    } catch (e) {
      this.setState({ redirectToHome: true });
    }
  }

  getNote() {
    return invokeApig({ path: `/notes/${this.props.match.params.id}` });
  }

  saveNote(note) {
    return invokeApig({
      path: `/notes/${this.props.match.params.id}`,
      method: "PUT",
      body: note
    });
  }

  deleteNote() {
    return invokeApig({
      path: `/notes/${this.props.match.params.id}`,
      method: "DELETE"
    });
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  formatFilename(str) {
    return str.length < 50
      ? str
      : str.substr(0, 20) + '...' + str.substr(str.length - 20, str.length);
  }

  handleChange = ({ target: { id, value }}) => {
    this.setState({ [id]: value });
  }

  handleFileChange = ({ target: { files } }) => {
    this.file = files[0];
  }

  handleSubmit = async (event) => {
    let uploadedFileName;
    const { note, content } = this.state;

    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000}MB`);
      return;
    }

    this.setState({ isLoading: true });

    try {
      if (this.file) {
        uploadedFileName = (await s3Upload(this.file)).Location;
      }

      await this.saveNote({
        ...note,
        content,
        attachment: uploadedFileName || note.attachment,
      });

      this.setState({ redirectToHome: true });
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  handleDelete = async (event) => {
    event.preventDefault();

    const confirmed = window.confirm('Are you sure you want to delete this note?');

    if (!confirmed) {
      return;
    }

    this.setState({ isDeleting: true });

    try {
      await this.deleteNote();

      if (this.state.note.attachment) {
        const s3File = this.state.note.attachment.split('/').slice(-1)[0];
        await s3Delete(unescape(s3File));
      }

      this.setState({ redirectToHome: true });
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  };

  render() {
    const { note, content, isLoading, isDeleting, redirectToHome } = this.state;

    if (redirectToHome) {
      return <Redirect to="/" />;
    }

    if (!note) {
      return <div />
    }

    return (
      <div className="Notes">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={content}
              componentClass="textarea"
            />
          </FormGroup>
          {note.attachment &&
            <FormGroup>
              <ControlLabel>Attachment</ControlLabel>
              <FormControl.Static>
                <a target="_blank" rel="noopener noreferrer" href={note.attachment}>
                  {this.formatFilename(note.attachment)}
                </a>
              </FormControl.Static>
            </FormGroup>
          }
          <FormGroup controlId="file">
            {!note.attachment &&
              <ControlLabel>Attachment</ControlLabel>
            }
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Save"
            loadingText="Saving..."
          />
          <LoaderButton
            block
            bsStyle="danger"
            bsSize="large"
            isLoading={isDeleting}
            onClick={this.handleDelete}
            text="Delete"
            loadingText="Deleting..."
          />
        </form>
      </div>
    );
  }
}

export default Notes;
