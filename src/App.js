import React, { Component } from "react";
import DayContainer from "./containers/DayContainer";
import Navbar from "./components/Navbar";
import AuthFormContainer from "./containers/AuthFormContainer";
import { Route, Switch, withRouter } from "react-router-dom";
import api from "./services/api";

class App extends Component {
  state = {
    auth: {
      currentUser: {
        appointments: [],
        start_time: "6:00am",
        end_time: "10:00pm"
      }
    },
    quote: this.props.quote,
    modalOpen: false,
    activeModal: null
  };
  onEscape = e => {
    if (e.key === "Escape") {
      this.modalClose();
    }
  };
  handleDoubleClick = e => {
    this.setState({ activeModal: e.target.id });
  };
  modalClose = () => {
    this.setState({ modalOpen: false, activeModal: null });
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth.getCurrentUser().then(user => {
        const currentUser = { currentUser: user };
        this.setState({
          auth: currentUser
        });
      });
    } else {
      this.props.history.push("/login");
    }
  }
  handleLogin = user => {
    const currentUser = { currentUser: user };
    localStorage.setItem("token", user.token);
    this.setState({
      auth: currentUser
    });
  };

  handleLogout = () => {
    localStorage.removeItem("token");
    this.setState({ auth: { currentUser: {} } });
  };

  createAppointment = appointment => {
    const prevstate = this.state.auth.currentUser.appointments.slice();
    prevstate.push(appointment);
    this.setState({
      auth: {
        currentUser: { ...this.state.auth.currentUser, appointments: prevstate }
      }
    });
    if (prevstate.length === 1) {
      this.setState({ modalOpen: true, editModalOpen: false });
    }
  };

  handleDelete = event => {
    api.appointments.deleteAppointment(event.target.id);
    const id = event.target.id;
    const prevstate = this.state.auth.currentUser.appointments.slice();
    const newState = prevstate.filter(a => a.id.toString() !== id);
    this.setState({
      auth: {
        currentUser: {
          ...this.state.auth.currentUser,
          appointments: newState
        }
      }
    });
  };

  setTimes = time => {
    api.users.update(
      this.state.auth.currentUser.id,
      time.startTime,
      time.endTime
    );
    this.setState({
      auth: {
        currentUser: {
          ...this.state.auth.currentUser,
          start_time: time.startTime,
          end_time: time.endTime
        }
      }
    });
  };

  render() {
    return (
      <div onKeyUp={this.onEscape}>
        <div>
          <Navbar
            currentUser={this.state.auth.currentUser}
            handleLogout={this.handleLogout}
          />
        </div>

        <Switch>
          <Route
            path="/login"
            render={routerProps => {
              return (
                <AuthFormContainer
                  {...routerProps}
                  handleLogin={this.handleLogin}
                  name="Sign In"
                  apiCall={api.auth.login}
                />
              );
            }}
          />
          <Route
            path="/signup"
            render={routerProps => {
              return (
                <AuthFormContainer
                  {...routerProps}
                  handleLogin={this.handleLogin}
                  name="Sign Up"
                  apiCall={api.users.signup}
                />
              );
            }}
          />

          <Route
            path="/"
            render={routerProps => {
              return (
                <DayContainer
                  style={{ height: "100vh" }}
                  handleChange={this.handleChange}
                  setTimes={this.setTimes}
                  createAppointment={this.createAppointment}
                  currentUser={this.state.auth.currentUser}
                  handleDelete={this.handleDelete}
                  quote={this.state.quote}
                  modalOpen={this.state.modalOpen}
                  handleClose={this.handleClose}
                  activeModal={this.state.activeModal}
                  handleDoubleClick={this.handleDoubleClick}
                  modalClose={this.modalClose}
                />
              );
            }}
          />
        </Switch>
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px"
          }}
        >
          <footer>
            <p
              style={{
                color: "RGB(31,31,31)",
                backgroundColor: "RGBa(244, 244, 244, .03)",
                borderTopRightRadius: "5px",
                borderTopLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                borderBottomLeftRadius: "5px"
              }}
            >
              &copy; 2017 Dick Ward |{" "}
              <a
                style={{ color: "RGB(14,14,14)" }}
                href="mailto:thedickward@gmail.com"
              >
                TheDickWard@gmail.com
              </a>
            </p>
          </footer>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
