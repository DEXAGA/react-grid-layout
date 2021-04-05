import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import StaticElementsLayout from "./5-static-elements";

export default {
  title: 'Example/StaticElementsLayout',
  Component: StaticElementsLayout,
};

const Template = (args) => <StaticElementsLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
