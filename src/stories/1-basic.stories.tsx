import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import BasicLayout from "./1-basic";

export default {
  title: 'Example/BasicLayout',
  Component: BasicLayout,
};

const Template = (args) => <BasicLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
