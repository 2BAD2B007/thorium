import React, { Component } from "react";
import gql from "graphql-tag";
import { Row, Col, Container, Card } from "reactstrap";
import { graphql, withApollo } from "react-apollo";
import Measure from "react-measure";
import Tour from "reactour";
import "./style.css";
/* TODO

Some improvements:
- Make it so you can just click on a box or a yellow line to set the power level
- Make it so the names show up better (add a display name to the system class)
- Change the types of the systems to make it easier to sort the systems by name.
*/

const mutation = gql`
  mutation ChangePower($id: ID!, $level: Int!) {
    changePower(systemId: $id, power: $level)
  }
`;

const SYSTEMS_SUB = gql`
  subscription SystemsUpdate($simulatorId: ID) {
    systemsUpdate(simulatorId: $simulatorId, power: true) {
      name
      displayName
      type
      id
      power {
        power
        powerLevels
      }
      damage {
        damaged
      }
    }
  }
`;

const REACTOR_SUB = gql`
  subscription ReactorUpdate($simulatorId: ID) {
    reactorUpdate(simulatorId: $simulatorId) {
      id
      model
      batteryChargeLevel
    }
  }
`;

class PowerDistribution extends Component {
  constructor(props) {
    super(props);
    this.state = {
      systems: [],
      offset: null,
      sysId: null
    };
    this.mouseMove = e => {
      const mouseX = e.pageX;
      const level = Math.max(
        0,
        Math.min(40, Math.round((mouseX - this.state.offset - 10) / 14))
      );
      const { systems, sysId } = this.state;
      const newSystems = systems.map(s => {
        if (s.id === sysId) {
          const newSys = JSON.parse(JSON.stringify(s));
          newSys.power.power = level;
          return newSys;
        }
        return s;
      });
      this.setState({
        systems: newSystems
      });
    };
    this.mouseUp = () => {
      document.removeEventListener("mousemove", this.mouseMove);
      document.removeEventListener("mouseup", this.mouseUp);
      const system = this.state.systems.find(s => s.id === this.state.sysId);
      const variables = {
        id: system.id,
        level: system.power.power
      };
      this.props.client.mutate({
        mutation,
        variables
      });
      this.setState({
        offset: null,
        sysId: null
      });
    };
    this.systemSub = null;
    this.reactorSub = null;
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.loading && !this.state.sysId) {
      this.setState({
        systems: nextProps.data.systems
      });
    }
    if (!this.systemSub && !nextProps.data.loading) {
      this.systemSub = nextProps.data.subscribeToMore({
        document: SYSTEMS_SUB,
        variables: {
          simulatorId: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            systems: subscriptionData.systemsUpdate
          });
        }
      });
      this.reactorSub = nextProps.data.subscribeToMore({
        document: REACTOR_SUB,
        variables: {
          simulatorId: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            reactors: subscriptionData.reactorUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.systemSub();
    this.reactorSub();
  }
  mouseDown = (sysId, dimensions, e) => {
    this.setState({
      sysId,
      offset: dimensions.left
    });
    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("mouseup", this.mouseUp);
  };
  render() {
    if (this.props.data.loading) return null;
    // Get the batteries, get just the first one.
    const battery = this.props.data.reactors.find(r => r.model === "battery");
    const charge = battery && battery.batteryChargeLevel;
    const powerTotal = this.state.systems.reduce((prev, next) => {
      return next.power.power + prev;
    }, 0);
    return (
      <Container fluid={!!battery} className="powerLevels">
        <Row className="powerlevel-row">
          <Col lg="12" xl={battery ? 8 : 12} className="powerlevel-containers">
            {this.state.systems
              .slice(0)
              .sort((a, b) => {
                if (a.type > b.type) return 1;
                if (a.type < b.type) return -1;
                return 0;
              })
              .filter(
                sys =>
                  (sys.power.power || sys.power.power === 0) &&
                  sys.power.powerLevels.length
              )
              .map(sys => (
                <SystemPower
                  key={sys.id}
                  {...sys}
                  mouseDown={this.mouseDown}
                  count={this.state.systems.length}
                  height={window.innerHeight * 0.74}
                />
              ))}
            <h4 className="totalPowerText">Total Power Used: {powerTotal}</h4>
          </Col>
          {battery && (
            <Col sm="4" className="battery-holder">
              <Card>
                <div className="battery-container">
                  <Battery
                    level={Math.min(1, Math.max(0, (charge - 0.75) * 4))}
                  />
                  <Battery
                    level={Math.min(1, Math.max(0, (charge - 0.5) * 4))}
                  />
                  <Battery
                    level={Math.min(1, Math.max(0, (charge - 0.25) * 4))}
                  />
                  <Battery level={Math.min(1, Math.max(0, charge * 4))} />
                </div>
              </Card>
            </Col>
          )}
        </Row>
        <Tour
          steps={trainingSteps}
          isOpen={this.props.clientObj.training}
          onRequestClose={this.props.stopTraining}
        />
      </Container>
    );
  }
}

const trainingSteps = [
  {
    selector: ".powerlevel-containers",
    content:
      "This list shows all of the systems on the ship that take power. Drag the green bars next to each system to add or remove power. You must ensure that there is enough power for the system to run. The yellow bars represent the amount of power necessary for the system to function at a certain level."
  },
  {
    selector: ".totalPowerText",
    content: "This is the total amount of power being used by the ship."
  },
  {
    selector: ".battery-holder",
    content:
      "These are the ship’s batteries, if it has any. They show how much power is remaining in the batteries. If you use more power than is being outputted by your reactor, power will draw from the batteries. If they run out of power, you will have to balance your power, and the batteries will need to be recharged. You can recharge batteries from your reactor by using less power than the current reactor output. Don’t let these run out in the middle of space. That would be...problematic."
  }
];

const SystemPower = ({
  id,
  name,
  displayName,
  damage: { damaged },
  power: { power, powerLevels },
  mouseDown,
  count,
  height
}) => {
  return (
    <Row>
      <Col sm="3">
        <h5
          className={damaged ? "text-danger" : ""}
          style={{ padding: 0, margin: 0, marginTop: height / count - 20 }}
        >
          {displayName}: {power}
        </h5>
      </Col>
      <Col sm="9">
        <Measure>
          {dimensions => (
            <div
              className="powerLine"
              style={{ margin: (height / count - 20) / 2 }}
            >
              {powerLevels.map(n => {
                return (
                  <div
                    className="powerLevel"
                    key={`${id}-powerLine-${n}`}
                    style={{ left: `${(n + 1) * 14 - 7}px` }}
                  />
                );
              })}
              <div
                className="powerBox zero"
                onMouseDown={() => mouseDown(id, dimensions)}
                key={`${id}-${-1}`}
              />
              {Array(40)
                .fill(0)
                .map((n, i) => {
                  return (
                    <div
                      className={`powerBox ${i >= power ? "hidden" : ""}`}
                      onMouseDown={() => mouseDown(id, dimensions)}
                      key={`${id}-${i}`}
                    />
                  );
                })}
            </div>
          )}
        </Measure>
      </Col>
    </Row>
  );
};

const Battery = ({ level = 1 }) => {
  return (
    <div className="battery">
      <div className="battery-bar" style={{ height: `${level * 100}%` }} />
      <div className="battery-level">{Math.round(level * 100)}</div>
    </div>
  );
};
const SYSTEMS_QUERY = gql`
  query Systems($simulatorId: ID) {
    systems(simulatorId: $simulatorId, power: true) {
      name
      displayName
      type
      id
      power {
        power
        powerLevels
      }
      damage {
        damaged
      }
    }
    reactors(simulatorId: $simulatorId) {
      id
      model
      batteryChargeLevel
    }
  }
`;

export default graphql(SYSTEMS_QUERY, {
  options: ownProps => ({ variables: { simulatorId: ownProps.simulator.id } })
})(withApollo(PowerDistribution));
