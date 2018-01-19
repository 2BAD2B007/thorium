import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, withApollo } from "react-apollo";
import { Container, Row, Col, Button } from "reactstrap";
import WaveMatch from "./waveMatch";

import "./style.css";

const SUB = gql`
  subscription LRQueueingSub($simulatorId: ID) {
    longRangeCommunicationsUpdate(simulatorId: $simulatorId) {
      id
      simulatorId
      name
      damage {
        damaged
        report
      }
      power {
        power
        powerLevels
      }
      interception
      locked
      decoded
    }
  }
`;

class LongRangeComm extends Component {
  sub = null;
  state = { intercepting: false };
  componentWillReceiveProps(nextProps) {
    if (!this.sub && !nextProps.data.loading) {
      this.sub = nextProps.data.subscribeToMore({
        document: SUB,
        variables: {
          simulatorId: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            longRangeCommunications:
              subscriptionData.data.longRangeCommunicationsUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.sub && this.sub();
  }
  renderInterception() {
    const { data: { longRangeCommunications } } = this.props;
    const { interception, decoded, locked } = longRangeCommunications[0];
    if (interception) {
      if (locked) {
        if (decoded) {
          <div className="centered-text">
            <h1>Signal Decoded</h1>
          </div>;
        }
        return (
          <div className="centered-text">
            <h1>Signal Locked</h1>
          </div>
        );
      }
      if (this.state.intercepting) {
        return (
          <WaveMatch
            client={this.props.client}
            lrComm={longRangeCommunications[0]}
          />
        );
      }
      return (
        <div className="centered-text">
          <h1>Active signal detected.</h1>
          <Button
            size="lg"
            color="warning"
            onClick={() => this.setState({ intercepting: true })}
          >
            Attempt Interception
          </Button>
        </div>
      );
    }
    return (
      <div className="centered-text">
        <h1>No active signals.</h1>
      </div>
    );
  }
  render() {
    const { data: { loading, longRangeCommunications } } = this.props;
    if (loading || !longRangeCommunications) return null;
    return (
      <Container className="card-commInterception">
        <Row>
          <Col sm={12}>{this.renderInterception()}</Col>
        </Row>
      </Container>
    );
  }
}
const QUEUING_QUERY = gql`
  query LRQueuing($simulatorId: ID) {
    longRangeCommunications(simulatorId: $simulatorId) {
      id
      simulatorId
      name
      damage {
        damaged
        report
      }
      power {
        power
        powerLevels
      }
      interception
      locked
      decoded
    }
  }
`;
export default graphql(QUEUING_QUERY, {
  options: ownProps => ({
    variables: {
      simulatorId: ownProps.simulator.id
    }
  })
})(withApollo(LongRangeComm));
