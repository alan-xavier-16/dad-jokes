import React, {Component} from 'react';
import Joke from './Joke';
import axios from 'axios';
import './Jokes.css';
const API_URL = 'https://icanhazdadjoke.com/';

class Jokes extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), /**Reloads old jokes on page refresh or empty if first visit to page */
      loading: false
    }
    this.seenJokes = new Set(this.state.jokes.map(j => j.id)); /**Creates a Set to check for duplicated jokes */
    this.handleVote = this.handleVote.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getJokes = this.getJokes.bind(this);
  }

  componentDidMount() {
    if(this.state.jokes.length === 0) this.getJokes();
  }

  /**Fetch data from the API */
  async getJokes() {
    try {
      let jokes = [];
      while(jokes.length < this.props.numJokesToGet) {
        let res = await axios.get(API_URL, { headers: { Accept: "application/json" }});
        /**Checking for duplicates */
        let {joke, id} = res.data;
        if(!this.seenJokes.has(id)) {
          jokes.push({ text: joke, votes: 0, id: id });
          /**Adds id to the seenJokes Set */
          this.seenJokes.add(id);
        } else {
          console.log("Found a Duplicate", joke);
        }
      }
      this.setState(st => ({
        loading: false,
        jokes: [...st.jokes, ...jokes]
      }), 
        /**Adding jokes to localStorage so new jokes are refreshed on page*/
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (err) {
      alert(err);
      this.setState({ loading: false });
    } 
  }

  /**Button logic to GET NEW JOKES */
  handleClick() {
    this.setState(st => ({
      loading: true
    }), this.getJokes);
  }

  /**Handles VOTING logic */
  handleVote(id, delta) {
    this.setState(st => ({
      jokes: st.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j)
    }), 
      /**Adding jokeObject contents to localStorage so new jokes AND votes are refreshed on page*/
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  render() {
    /**Loading Page */
    if(this.state.loading) {
      return (
        <div className="Jokes-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="Jokes-title">Loading....</h1>
        </div>
      )
    } else {
      /**Jokes List */
      let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes); /**Sorting based on votes */
      return(
        <div className="Jokes">
          <div className="Jokes-sidebar">
            <h1 className="Jokes-title"><span>Dad</span> Jokes</h1>
            <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt='Laughing Emoji' />
            <button className="Jokes-getmore" onClick={this.handleClick} >Fetch Jokes</button>
          </div>
          
          <div className="Jokes-jokes">
            {jokes.map(j => (
              <Joke key={j.id} id={j.id} text={j.text} votes={j.votes} vote={this.handleVote} />
            ))}
          </div>
        </div>
      );
    }
  }
}

export default Jokes;