import React, { Component, Fragment } from "react";
import FontAwesome from "react-fontawesome";
import { Nav, NavItem, NavLink, Button } from "reactstrap";
import { Link } from "react-router-dom";
import "./sideNav.css";

const makeLinks = () => {
  const links = [
    {
      link: "/",
      name: "Home",
      icon: "home"
    },
    {
      link: "/client",
      name: "Client",
      icon: "desktop"
    },
    {
      name: "Simulator Config",
      icon: "space-shuttle",
      link: "/config/simulator"
    },
    {
      name: "Asset Config",
      icon: "picture-o",
      link: "/config/assets"
    },
    {
      name: "Mission Config",
      icon: "user-secret",
      link: "/config/mission"
    },
    {
      name: "Tactical Map Config",
      icon: "map-o",
      link: "/config/tacticals"
    },
    {
      name: "Sets Config",
      icon: "tasks",
      link: "/config/sets"
    },
    {
      name: "Software Panel Config",
      icon: "cogs",
      link: "/config/panels"
    },
    {
      name: "Survey Form Config",
      icon: "file-text-o",
      link: "/config/survey"
    },
    {
      name: "Keyboard Config",
      icon: "keyboard-o",
      link: "/config/keyboard"
    }
  ];
  if (process.env.NODE_ENV !== "production") {
    links.push({
      name: "Debug",
      icon: "bug",
      link: "/config/debug"
    });
    links.push({
      name: "Debug Core",
      icon: "bug",
      link: "/config/flight/c/core"
    });
  }

  return links;
};
class SideNav extends Component {
  state = { open: false };
  render = () => (
    <Fragment>
      <div className="top-bar">
        <Button
          size="sm"
          color="dark"
          className="menu-button"
          onClick={() => this.setState({ open: true })}
        >
          <FontAwesome name="bars" />
        </Button>
        <img
          alt="Logo"
          src={require("../../components/logo.png")}
          draggable="false"
          height="30px"
        />
        <h3>Thorium</h3>
      </div>
      <Nav vertical className={`sideNav ${this.state.open ? "open" : ""}`}>
        <SideNavLink
          icon="times"
          name="Close"
          link="#"
          onClick={() => {
            this.setState({ open: false });
          }}
        />

        {makeLinks().map(m => (
          <SideNavLink
            key={`sidemenu-${m.id || m.name}`}
            onClick={() => {
              this.setState({ open: false });
            }}
            {...m}
          />
        ))}
      </Nav>
    </Fragment>
  );
}
export class SideNavLink extends Component {
  state = { open: false };
  render() {
    const m = this.props;
    const { open } = this.state;
    return (m.children && m.children.length > 0) || m.link || m.onClick ? (
      <NavItem>
        <NavLink
          tag={Link}
          to={m.link ? m.link : "#"}
          onClick={m.link ? m.onClick : () => this.setState({ open: !open })}
        >
          {m.icon && <FontAwesome name={m.icon.replace("fa-", "")} />} {m.name}{" "}
          {m.children &&
            m.children.length > 0 && (
              <FontAwesome
                name={open ? "chevron-down" : "chevron-left"}
                className="pull-right"
              />
            )}
        </NavLink>
        {m.children &&
          m.children.length > 0 &&
          open && (
            <Nav vertical style={{ marginLeft: "20px" }}>
              {m.children
                .concat()
                .map(c => (
                  <SideNavLink
                    key={`sidemenu-${c.id || c.name}`}
                    {...c}
                    onClick={m.onClick}
                  />
                ))}
            </Nav>
          )}
      </NavItem>
    ) : null;
  }
}

export default SideNav;
