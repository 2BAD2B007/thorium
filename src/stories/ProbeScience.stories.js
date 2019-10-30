import React from "react";
import StorybookWrapper from "./helpers/storybookWrapper.js";
import StorybookWrapperCore from "./helpers/storybookWrapperCore.js";
import baseProps from "./helpers/baseProps.js";
import Component from "../components/views/ProbeScience/index.js";
import CoreComponent from "../components/views/ProbeScience/core.js";
import ProbeScienceMock from "mocks/cards/ProbeScience.mock.js";

export default {
  title: "Cards|Sensors/ProbeScience",
};
export const ProbeScience = () => (
  <StorybookWrapper mocks={ProbeScienceMock}>
    <Component {...baseProps} />
  </StorybookWrapper>
);
export const Core = () => (
  <StorybookWrapperCore mocks={ProbeScienceMock}>
    <CoreComponent {...baseProps} />
  </StorybookWrapperCore>
);
