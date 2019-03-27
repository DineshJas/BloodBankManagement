import React, { Component } from "react";
import axios from "axios";
import "./Post.scss";
import NavBar from "../NavBar/NavBar";
class Posts extends Component {
  state = {
    fetchedDatas: [],
    isError: false,
    errorMessage: "",
    showFullMessageToggle: false,
    id: "",
    isWarning: false,
    warningMessage: "",
    currentUser: {}
  };
  componentWillMount() {
    console.log("Posts Component's ComponentwillMount is called");
    axios
      .get("http://localhost:3001/details")
      .then(res => {
        // console.log(res.data.message);
        // console.log(typeof res.data.message);
        this.setState({ fetchedDatas: res.data.message });
      })
      .catch(err => {
        console.log("Error occured " + err.messages);
        this.setState({ isError: true, errorMessage: err.message });
      });
  }
  handleClick = id => {
    this.setState({
      showFullMessageToggle: !this.state.showFullMessageToggle,
      id: id
    });
  };
  handleDonate = async (currentUser, patientDetails) => {
    // console.log(patientDetails);
    // console.log(currentUser);
    if (this.state.isWarning) {
      await this.setState({ isWarning: false });
    }
    if (currentUser.bloodgroup !== patientDetails.bloodGroup) {
      let warningMessage = `You are not a matching donor`;
      await this.setState({ isWarning: true, warningMessage: warningMessage });
      return;
    }
    if (
      !(
        patientDetails.contactNumber.startsWith("91") ||
        patientDetails.contactNumber.startsWith("+91")
      )
    ) {
      patientDetails.contactNumber = "91" + patientDetails.contactNumber;
    }
    axios
      .post("http://localhost:3001/donate", { currentUser, patientDetails })
      .then(res => {
        console.log(res.data.message);
      })
      .catch(err => {
        console.log(err.message);
      });
  };

  handleEdit = patientId => {
    console.log("Edit functionality is not yet implemented");
    console.log(patientId);
  };

  handleDelete = patientId => {
    // console.log(patientId);
    axios
      .delete("http://localhost:3001/details", { data: { patientId } }) //In axios data object is must to pass the data through req.body
      .then(res => {
        // console.log(res.data.isError);
        let { fetchedDatas } = this.state;
        let filteredDatas = fetchedDatas.filter(result => {
          return result._id !== res.data.message._id;
        });
        // console.log(filteredDatas);
        this.setState({
          isError: res.data.isError,
          fetchedDatas: filteredDatas
        });
      })
      .catch(err => {
        console.log("Error occured " + err.message);
        this.setState({ isError: true, errorMessage: err.message });
      });
  };
  render() {
    let signedIn, currentUser, admin, isAdmin;
    if (this.props.location.state === undefined) {
      signedIn = false;
      currentUser = null;
      admin = null;
      isAdmin = false;
    } else {
      signedIn = this.props.location.state.signedIn;
      currentUser = this.props.location.state.currentUser;
      admin = this.props.location.state.adminDetails;
      if (this.props.location.state.adminDetails === undefined) isAdmin = false;
      else isAdmin = this.props.location.state.adminDetails.isAdmin;
      // console.log(admin);
    }
    // console.log(currentUser);
    return (
      <div>
        <NavBar signedIn={signedIn} />
        {this.state.isWarning ? (
          <div className="warning">{this.state.warningMessage}</div>
        ) : (
          ""
        )}
        <div className="posts-grid">
          {this.state.fetchedDatas.length !== 0 ? (
            this.state.fetchedDatas.map(data => {
              return (
                <div
                  className="posts"
                  key={data._id}
                  // style={
                  //   this.state.id === data._id
                  //     ? this.state.showFullMessageToggle
                  //       ? { minHeight: "60px" }
                  //       : { height: "60px" }
                  //     : { height: "60px" }
                  // }
                >
                  <div
                    className="posts-header"
                    // onClick={this.handleClick.bind(this, data._id)}
                  >
                    <h4>
                      <span className="posts-title_head"> Patient Name</span>:
                      <span className="posts-title_name">
                        {data.patientName}
                      </span>
                    </h4>
                    <div className="posts-details">
                      <h4>
                        <span className="posts-title_head"> Number</span>:
                        <span className="posts-title_name">
                          {data.contactNumber}
                        </span>
                      </h4>
                      <h4>
                        <span className="posts-title_head">Group</span>:
                        <span className="posts-title_name">
                          {data.bloodGroup}
                        </span>
                      </h4>
                    </div>
                  </div>
                  <p className="address">
                    <span className="posts-title_head">Address</span>:
                    {data.address}
                  </p>
                  <p className="posts-message">
                    <span className="posts-title_head">Message</span>:
                    {data.additionalMessage}
                  </p>
                  <div className="posts-btn_group">
                    {!isAdmin && signedIn ? (
                      <button
                        className="posts-donate_btn"
                        onClick={this.handleDonate.bind(
                          this,
                          currentUser,
                          data
                        )}
                      >
                        Donate
                      </button>
                    ) : (
                      ""
                    )}

                    {admin !== undefined && isAdmin ? (
                      <div className="posts-control_component">
                        <button
                          className="posts-delete_btn"
                          onClick={this.handleDelete.bind(this, data._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="posts-edit_btn"
                          onClick={this.handleDelete.bind(this, data._id)}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p
              style={{
                textTransform: "uppercase",
                position: "absolute",
                left: "30%",
                top: "30%",
                margin: "0",
                letterSpacing: "2px",
                fontSize: "24px"
              }}
            >
              Wait Posts are loading
            </p>
          )}
        </div>
      </div>
    );
  }
}
Posts.defaultProps = {
  signedIn: false
};
export default Posts;
