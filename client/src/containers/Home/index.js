import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap';
import { invokeApig } from '../../libs/aws-lib';

import './Home.css';

class Home extends Component {
  state = {
    isLoading: true,
    notes: []
  };

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      this.setState({ notes: await this.getNotes() });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getNotes() {
    return invokeApig({ path: '/notes' });
  }

  handleNoteClick = (event) => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute('href'));
  }

  renderNotesList(notes) {
    return [{}].concat(notes).map(
      (note, i) =>
        i !== 0
          ? <ListGroupItem
              key={note.noteId}
              href={`/notes/${note.noteId}`}
              onClick={this.handleNoteClick}
              header={note.content.trim().split("\n")[0]}
            >
              {"Created: " + new Date(note.createdAt).toLocaleString()}
            </ListGroupItem>
          : <ListGroupItem
              key="new"
              href="/notes/new"
              onClick={this.handleNoteClick}
            >
              <h4>
                <b>{"\uFF0B"}</b> Create a new note
              </h4>
            </ListGroupItem>
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>A simple note taking app</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    )
  }

  renderNotes() {
    const { isLoading, notes } = this.state;

    return (
      <div className="notes">
        <PageHeader>Your Notes</PageHeader>
        <ListGroup>
          {!isLoading && this.renderNotesList(notes)}
        </ListGroup>
      </div>
    )
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
      </div>
    );
  }
}

export default Home;
