import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import StaticElementsLayout from "./5-static-elements";

export default {
  title: 'Example/StaticElementsLayout',
  Component: StaticElementsLayout,
};

const Template = (args) => <StaticElementsLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
