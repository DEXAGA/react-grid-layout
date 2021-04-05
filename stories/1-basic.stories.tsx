import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import BasicLayout from "./1-basic";

export default {
  title: 'Example/BasicLayout',
  Component: BasicLayout,
};

const Template = (args) => <BasicLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
