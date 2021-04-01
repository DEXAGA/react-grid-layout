import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import MessyLayout from "./3-messy";

export default {
  title: 'Example/MessyLayout',
  Component: MessyLayout,
};

const Template = (args) => <MessyLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
