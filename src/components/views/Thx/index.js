import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import SubscriptionHelper from "../../../helpers/subscriptionHelper";
import Thx from "./thx";
import "./style.css";

const queryData = `
id
name
clients {
  id
  lock
  charge
  station
}
activated
`;

const QUERY = gql`
  query Thx($simulatorId: ID!) {
    thx(simulatorId: $simulatorId) {
${queryData}
    }
  }
`;
const SUBSCRIPTION = gql`
  subscription ThxUpdate($simulatorId: ID!) {
    thxUpdate(simulatorId: $simulatorId) {
${queryData}
    }
  }
`;

class ThxData extends Component {
  state = {};
  render() {
    return (
      <Query query={QUERY} variables={{ simulatorId: this.props.simulator.id }}>
        {({ loading, data, subscribeToMore }) => {
          const { thx } = data;
          if (loading || !thx) return null;
          if (!thx[0]) return <div>No Thx</div>;
          const {
            clientObj: { id: clientId }
          } = this.props;
          const { clients } = thx[0];
          const { charge } = clients.find(c => c.id === clientId) || {
            lock: false
          };

          return (
            <SubscriptionHelper
              subscribe={() =>
                subscribeToMore({
                  document: SUBSCRIPTION,
                  variables: { simulatorId: this.props.simulator.id },
                  updateQuery: (previousResult, { subscriptionData }) => {
                    return Object.assign({}, previousResult, {
                      thx: subscriptionData.data.thxUpdate
                    });
                  }
                })
              }
            >
              <Thx key={charge} {...this.props} {...thx[0]} />
            </SubscriptionHelper>
          );
        }}
      </Query>
    );
  }
}
export default ThxData;
